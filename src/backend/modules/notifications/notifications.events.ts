import { getEventBus } from "@/backend/common/events/event-bus";
import { GroupModel } from "@/backend/modules/groups/group.entity";
import { NotificationModel } from "@/backend/modules/notifications/notification.entity";
import { UserModel } from "@/backend/modules/users/users.entity";

const NOTIFICATION_EVENT_BINDINGS_KEY = "__financTrackerNotificationEventBindings" as const;

type NotificationEventsGlobal = typeof globalThis & {
  [NOTIFICATION_EVENT_BINDINGS_KEY]?: boolean;
};

const getGroupName = async (groupId: string) => {
  const group = await GroupModel.findById(groupId).lean();
  return group?.name ?? "Group";
};

const getUser = async (userId: string) => {
  return UserModel.findById(userId).lean();
};

export const registerNotificationEventHandlers = () => {
  const g = globalThis as NotificationEventsGlobal;
  if (g[NOTIFICATION_EVENT_BINDINGS_KEY]) return;

  const bus = getEventBus();

  bus.on("group.invite.created", async ({ payload }) => {
    const [groupName, inviter] = await Promise.all([
      getGroupName(payload.groupId),
      getUser(payload.invitedByUserId),
    ]);

    await NotificationModel.create({
      userId: payload.invitedUserId,
      type: "invite",
      payload: {
        inviteId: payload.inviteId,
        groupId: payload.groupId,
        groupName,
        invitedByUserId: payload.invitedByUserId,
        invitedByDisplayName: inviter?.displayName ?? payload.invitedByUserId,
        invitedByEmail: inviter?.email ?? "",
        message: payload.message ?? null,
      },
    });
  });

  bus.on("expense.debt.created", async ({ payload }) => {
    const [groupName, creditor] = await Promise.all([
      getGroupName(payload.groupId),
      getUser(payload.toUserId),
    ]);

    await NotificationModel.create({
      userId: payload.fromUserId,
      type: "debt_due",
      payload: {
        groupId: payload.groupId,
        groupName,
        toUserId: payload.toUserId,
        toUserDisplayName: creditor?.displayName ?? payload.toUserId,
        amount: payload.amount,
        expenseId: payload.expenseId,
        expenseTitle: payload.expenseTitle,
      },
    });
  });

  bus.on("settlement.payment.reported", async ({ payload }) => {
    const [groupName, sender] = await Promise.all([
      getGroupName(payload.groupId),
      getUser(payload.fromUserId),
    ]);

    await NotificationModel.create({
      userId: payload.toUserId,
      type: "settlement_pending",
      payload: {
        settlementId: payload.settlementId,
        groupId: payload.groupId,
        groupName,
        fromUserId: payload.fromUserId,
        fromUserDisplayName: sender?.displayName ?? payload.fromUserId,
        amount: payload.amount,
      },
    });
  });

  bus.on("settlement.payment.confirmed", async ({ payload }) => {
    const [groupName, confirmer] = await Promise.all([
      getGroupName(payload.groupId),
      getUser(payload.confirmedByUserId),
    ]);

    await NotificationModel.create({
      userId: payload.fromUserId,
      type: "settlement_confirmed",
      payload: {
        settlementId: payload.settlementId,
        groupId: payload.groupId,
        groupName,
        confirmedByUserId: payload.confirmedByUserId,
        confirmedByDisplayName: confirmer?.displayName ?? payload.confirmedByUserId,
        amount: payload.amount,
      },
    });
  });

  bus.on("settlement.payment.declined", async ({ payload }) => {
    const [groupName, decliner] = await Promise.all([
      getGroupName(payload.groupId),
      getUser(payload.declinedByUserId),
    ]);

    await NotificationModel.create({
      userId: payload.fromUserId,
      type: "settlement_declined",
      payload: {
        settlementId: payload.settlementId,
        groupId: payload.groupId,
        groupName,
        declinedByUserId: payload.declinedByUserId,
        declinedByDisplayName: decliner?.displayName ?? payload.declinedByUserId,
        amount: payload.amount,
        reason: payload.reason ?? null,
      },
    });
  });

  g[NOTIFICATION_EVENT_BINDINGS_KEY] = true;
};
