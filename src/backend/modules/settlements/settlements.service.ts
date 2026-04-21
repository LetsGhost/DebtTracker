import { ApiError } from "@/backend/common/errors/errors";
import { getEventBus } from "@/backend/common/events/event-bus";
import { DebtLedgerEntryModel } from "@/backend/modules/expenses/debt-ledger.entity";
import { getMemberContext } from "@/backend/modules/groups/groups.permissions";
import { SettlementModel } from "@/backend/modules/settlements/settlement.entity";
import { UserModel } from "@/backend/modules/users/users.entity";

export class SettlementsService {
  async create(groupId: string, actorUserId: string, toUserId: string, amount: number) {
    await getMemberContext(groupId, actorUserId);

    const settlement = await SettlementModel.create({
      groupId,
      fromUserId: actorUserId,
      toUserId,
      amount,
      status: "pending_receiver",
      senderConfirmedAt: new Date(),
    });

    await getEventBus().emit("settlement.payment.reported", {
      settlementId: String(settlement._id),
      groupId,
      fromUserId: actorUserId,
      toUserId,
      amount,
    });

    return settlement;
  }

  async list(groupId: string, actorUserId: string) {
    await getMemberContext(groupId, actorUserId);

    const settlements = await SettlementModel.find({
      groupId,
      $or: [{ fromUserId: actorUserId }, { toUserId: actorUserId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const userIds = Array.from(
      new Set(
        settlements
          .flatMap((settlement: any) => [settlement.fromUserId, settlement.toUserId])
          .filter((userId: string) => Boolean(userId)),
      ),
    );

    const users = await UserModel.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map<string, { displayName: string; email: string }>(
      users.map((user: any) => [String(user._id), { displayName: user.displayName as string, email: user.email as string }]),
    );

    return settlements.map((settlement: any) => {
      const fromUser = userMap.get(settlement.fromUserId);
      const toUser = userMap.get(settlement.toUserId);

      return {
        ...settlement,
        fromUserDisplayName: fromUser?.displayName ?? "",
        fromUserEmail: fromUser?.email ?? "",
        toUserDisplayName: toUser?.displayName ?? "",
        toUserEmail: toUser?.email ?? "",
      };
    });
  }

  async confirmReceived(settlementId: string, actorUserId: string) {
    const settlement = await SettlementModel.findById(settlementId);

    if (!settlement) {
      throw new ApiError("Settlement not found", 404);
    }

    if (settlement.toUserId !== actorUserId) {
      throw new ApiError("Only receiver can confirm", 403);
    }

    if (settlement.status !== "pending_receiver") {
      throw new ApiError("Settlement is not pending", 400);
    }

    settlement.status = "confirmed";
    settlement.receiverDecisionAt = new Date();
    await settlement.save();

    await DebtLedgerEntryModel.create({
      groupId: settlement.groupId,
      fromUserId: settlement.toUserId,
      toUserId: settlement.fromUserId,
      amount: settlement.amount,
      sourceType: "settlement_adjustment",
      sourceId: String(settlement._id),
    });

    await getEventBus().emit("settlement.payment.confirmed", {
      settlementId: String(settlement._id),
      groupId: settlement.groupId,
      fromUserId: settlement.fromUserId,
      toUserId: settlement.toUserId,
      amount: settlement.amount,
      confirmedByUserId: actorUserId,
    });

    return { confirmed: true };
  }

  async decline(settlementId: string, actorUserId: string, reason?: string) {
    const settlement = await SettlementModel.findById(settlementId);

    if (!settlement) {
      throw new ApiError("Settlement not found", 404);
    }

    if (settlement.toUserId !== actorUserId) {
      throw new ApiError("Only receiver can decline", 403);
    }

    if (settlement.status !== "pending_receiver") {
      throw new ApiError("Settlement is not pending", 400);
    }

    settlement.status = "declined";
    settlement.receiverDecisionAt = new Date();
    settlement.receiverDecisionReason = reason;
    await settlement.save();

    await getEventBus().emit("settlement.payment.declined", {
      settlementId: String(settlement._id),
      groupId: settlement.groupId,
      fromUserId: settlement.fromUserId,
      toUserId: settlement.toUserId,
      amount: settlement.amount,
      declinedByUserId: actorUserId,
      reason,
    });

    return { declined: true };
  }
}
