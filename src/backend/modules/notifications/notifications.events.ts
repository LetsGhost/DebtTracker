import { emailWorkflowService } from "@/backend/common/email/email.flows";
import { buildAppUrl } from "@/backend/common/email/email.urls";
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

const sendNotificationEmailIfEnabled = async (
  user: any,
  message: string,
  ctaLabel?: string,
  ctaPath?: string,
) => {
  if (!user || user.emailNotificationsEnabled === false || !user.email) {
    return;
  }

  await emailWorkflowService.sendNotificationEmail(
    {
      id: String(user._id),
      email: user.email,
      firstName: user.firstName,
      displayName: user.displayName,
    },
    message,
    ctaLabel,
    ctaPath ? buildAppUrl(ctaPath) : undefined,
  );
};

export const registerNotificationEventHandlers = () => {
  const g = globalThis as NotificationEventsGlobal;
  if (g[NOTIFICATION_EVENT_BINDINGS_KEY]) return;

  const bus = getEventBus();

  bus.on("group.invite.created", async ({ payload }) => {
    const [groupName, inviter, invitedUser] = await Promise.all([
      getGroupName(payload.groupId),
      getUser(payload.invitedByUserId),
      getUser(payload.invitedUserId),
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

    void sendNotificationEmailIfEnabled(
      invitedUser,
      `${inviter?.displayName ?? "A user"} invited you to ${groupName}.`,
      "Open notifications",
      "/dashboard/notifications",
    );
  });

  bus.on("expense.debt.created", async ({ payload }) => {
    const [groupName, creditor, debtor] = await Promise.all([
      getGroupName(payload.groupId),
      getUser(payload.toUserId),
      getUser(payload.fromUserId),
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

    void sendNotificationEmailIfEnabled(
      debtor,
      `You owe ${payload.amount.toFixed(2)} to ${creditor?.displayName ?? "a group member"} in ${groupName}.`,
      "Open group",
      `/groups/${payload.groupId}`,
    );
  });

  bus.on("settlement.payment.reported", async ({ payload }) => {
    const [groupName, sender, receiver] = await Promise.all([
      getGroupName(payload.groupId),
      getUser(payload.fromUserId),
      getUser(payload.toUserId),
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

    void sendNotificationEmailIfEnabled(
      receiver,
      `${sender?.displayName ?? "A group member"} marked ${payload.amount.toFixed(2)} as paid in ${groupName}.`,
      "Review notification",
      "/dashboard/notifications",
    );
  });

  bus.on("settlement.payment.confirmed", async ({ payload }) => {
    const [groupName, confirmer, sender] = await Promise.all([
      getGroupName(payload.groupId),
      getUser(payload.confirmedByUserId),
      getUser(payload.fromUserId),
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

    void sendNotificationEmailIfEnabled(
      sender,
      `${confirmer?.displayName ?? "A group member"} confirmed your payment (${payload.amount.toFixed(2)}) in ${groupName}.`,
      "Open group",
      `/groups/${payload.groupId}`,
    );
  });

  bus.on("settlement.payment.declined", async ({ payload }) => {
    const [groupName, decliner, sender] = await Promise.all([
      getGroupName(payload.groupId),
      getUser(payload.declinedByUserId),
      getUser(payload.fromUserId),
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

    void sendNotificationEmailIfEnabled(
      sender,
      `${decliner?.displayName ?? "A group member"} declined your payment confirmation in ${groupName}.`,
      "Open notifications",
      "/dashboard/notifications",
    );
  });

  g[NOTIFICATION_EVENT_BINDINGS_KEY] = true;
};
