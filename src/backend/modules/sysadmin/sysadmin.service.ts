import { Types } from "mongoose";

import { ApiError } from "@/backend/common/errors/errors";
import { AuthLoginAuditModel } from "@/backend/modules/auth/auth-login-audit.entity";
import { GroupModel } from "@/backend/modules/groups/group.entity";
import { GroupMemberModel } from "@/backend/modules/groups/group-member.entity";
import { SettlementModel } from "@/backend/modules/settlements/settlement.entity";
import { UserModel } from "@/backend/modules/users/users.entity";
import { ExpenseModel } from "@/backend/modules/expenses/expense.entity";
import { UsersService } from "@/backend/modules/users/users.service";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export class SysAdminService {
  constructor(private readonly usersService: UsersService = new UsersService()) {}

  async listUsers(query: string) {
    const normalized = query.trim();
    const filter: Record<string, unknown> = {};

    if (normalized.length > 0) {
      const matcher = new RegExp(escapeRegExp(normalized), "i");
      const or: Array<Record<string, unknown>> = [
        { email: matcher },
        { displayName: matcher },
      ];

      if (Types.ObjectId.isValid(normalized)) {
        or.push({ _id: normalized });
      }

      filter.$or = or;
    }

    const users = await UserModel.find(filter).sort({ createdAt: -1 }).limit(200).lean();

    return users.map((user: any) => ({
      id: String(user._id),
      email: user.email,
      displayName: user.displayName,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      emailVerifiedAt: user.emailVerifiedAt ?? null,
      suspendedAt: user.suspendedAt ?? null,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt ?? null,
    }));
  }

  async setUserSuspension(userId: string, suspended: boolean, actorUserId: string) {
    if (userId === actorUserId) {
      throw new ApiError("Cannot suspend your own account", 400);
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }

    user.suspendedAt = suspended ? new Date() : undefined;
    await user.save();

    return {
      id: String(user._id),
      suspendedAt: user.suspendedAt ?? null,
    };
  }

  async deleteUser(userId: string, actorUserId: string) {
    if (userId === actorUserId) {
      throw new ApiError("Cannot delete your own account via sysadmin action", 400);
    }

    await this.usersService.deleteAccount(userId);
    return { deleted: true };
  }

  async getStats() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      users,
      groups,
      activeMemberships,
      expenses,
      pendingSettlements,
      totalLogins,
      successfulLogins,
      failedLogins,
      last24hLogins,
      last7dLogins,
      recentAttempts,
    ] = await Promise.all([
      UserModel.countDocuments({}),
      GroupModel.countDocuments({ deletedAt: null }),
      GroupMemberModel.countDocuments({ removedAt: null }),
      ExpenseModel.countDocuments({}),
      SettlementModel.countDocuments({ status: "pending_receiver" }),
      AuthLoginAuditModel.countDocuments({}),
      AuthLoginAuditModel.countDocuments({ success: true }),
      AuthLoginAuditModel.countDocuments({ success: false }),
      AuthLoginAuditModel.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      AuthLoginAuditModel.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      AuthLoginAuditModel.find({})
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]);

    return {
      users,
      groups,
      activeMemberships,
      expenses,
      pendingSettlements,
      loginStats: {
        totalLogins,
        successfulLogins,
        failedLogins,
        last24hLogins,
        last7dLogins,
        recentAttempts: recentAttempts.map((entry: any) => ({
          id: String(entry._id),
          userId: entry.userId ?? null,
          email: entry.email,
          success: entry.success,
          failureReason: entry.failureReason ?? null,
          ipAddress: entry.ipAddress ?? null,
          userAgent: entry.userAgent ?? null,
          createdAt: entry.createdAt,
        })),
      },
    };
  }
}
