export type DomainEventMap = {
  "group.invite.created": {
    inviteId: string;
    groupId: string;
    invitedUserId: string;
    invitedByUserId: string;
    message?: string;
  };
  "expense.debt.created": {
    groupId: string;
    expenseId: string;
    expenseTitle: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
  };
  "settlement.payment.reported": {
    settlementId: string;
    groupId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
  };
  "settlement.payment.confirmed": {
    settlementId: string;
    groupId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
    confirmedByUserId: string;
  };
  "settlement.payment.declined": {
    settlementId: string;
    groupId: string;
    fromUserId: string;
    toUserId: string;
    amount: number;
    declinedByUserId: string;
    reason?: string;
  };
};

export type DomainEventName = keyof DomainEventMap;

export type DomainEvent<K extends DomainEventName = DomainEventName> = {
  type: K;
  payload: DomainEventMap[K];
  occurredAt: string;
};
