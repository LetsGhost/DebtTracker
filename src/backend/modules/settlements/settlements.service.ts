import { ApiError } from "@/backend/common/errors";
import { DebtLedgerEntryModel } from "@/backend/modules/expenses/debt-ledger.entity";
import { getMemberContext } from "@/backend/modules/groups/groups.permissions";
import { SettlementModel } from "@/backend/modules/settlements/settlement.entity";

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

    return settlement;
  }

  async list(groupId: string, actorUserId: string) {
    await getMemberContext(groupId, actorUserId);

    return SettlementModel.find({
      groupId,
      $or: [{ fromUserId: actorUserId }, { toUserId: actorUserId }],
    })
      .sort({ createdAt: -1 })
      .lean();
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

    return { declined: true };
  }
}
