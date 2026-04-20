export const GROUP_ROLES = ["admin", "moderator", "editor", "viewer"] as const;
export type GroupRole = (typeof GROUP_ROLES)[number];

export const SPLIT_TYPES = ["equal", "percentage", "custom"] as const;
export type SplitType = (typeof SPLIT_TYPES)[number];

export const INVITE_STATUSES = ["pending", "accepted", "rejected", "revoked", "expired"] as const;
export type InviteStatus = (typeof INVITE_STATUSES)[number];

export const SETTLEMENT_STATUSES = ["pending_receiver", "confirmed", "declined"] as const;
export type SettlementStatus = (typeof SETTLEMENT_STATUSES)[number];

export const GROUP_VISIBILITY_MODES = ["transparent", "private", "hybrid"] as const;
export type GroupVisibilityMode = (typeof GROUP_VISIBILITY_MODES)[number];
