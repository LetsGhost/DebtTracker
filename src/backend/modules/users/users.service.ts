import bcrypt from "bcryptjs";

import { ApiError } from "@/backend/common/errors/errors";
import { logger } from "@/backend/common/logging/logger";
import { GroupInviteModel } from "@/backend/modules/groups/group-invite.entity";
import { GroupMemberModel } from "@/backend/modules/groups/group-member.entity";
import { NotificationModel } from "@/backend/modules/notifications/notification.entity";
import { UserModel } from "@/backend/modules/users/users.entity";

const splitDisplayName = (displayName: string) => {
  const tokens = displayName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (tokens.length === 1) {
    return { firstName: tokens[0], lastName: "" };
  }

  return {
    firstName: tokens[0],
    lastName: tokens.slice(1).join(" "),
  };
};

const composeDisplayName = (firstName: string, lastName: string) => `${firstName} ${lastName}`.trim();

export class UsersService {
  async deleteAccount(userId: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    await Promise.all([
      NotificationModel.deleteMany({ userId }),
      GroupInviteModel.updateMany({ invitedUserId: userId, status: "pending" }, { $set: { status: "revoked", actedAt: new Date() } }),
      GroupMemberModel.updateMany({ userId, removedAt: null }, { $set: { removedAt: new Date() } }),
    ]);

    await user.deleteOne();
    logger.info("User account deleted", { userId, email: user.email });

    return { deleted: true };
  }

  async searchUsers(query: string) {
    const normalized = query.trim();

    if (normalized.length < 2) {
      return [];
    }

    const escaped = normalized.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
    const matcher = new RegExp(escaped, "i");

    const users = await UserModel.find({
      $or: [{ displayName: matcher }, { email: matcher }],
    })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    return users.map((user: { _id: string; displayName: string; email: string }) => ({
      id: String(user._id),
      displayName: user.displayName,
      email: user.email,
    }));
  }

  async createUser(input: { email: string; password: string; displayName: string }) {
    const emailNorm = input.email.toLowerCase();
    logger.debug("Creating user", { email: emailNorm });
    const existing = await UserModel.findOne({ email: emailNorm }).lean();

    if (existing) {
      logger.warn("User creation blocked: email already exists", { email: emailNorm });
      throw new ApiError("Email is already in use", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await UserModel.create({
      email: emailNorm,
      displayName: input.displayName,
      passwordHash,
    });
    logger.info("User created successfully", { userId: String(user._id), email: emailNorm });

    return {
      id: String(user._id),
      email: user.email,
      displayName: user.displayName,
      emailVerifiedAt: user.emailVerifiedAt ?? null,
    };
  }

  async verifyPassword(email: string, password: string) {
    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new ApiError("Invalid credentials", 401);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new ApiError("Invalid credentials", 401);
    }

    return {
      id: String(user._id),
      email: user.email,
      displayName: user.displayName,
      emailVerifiedAt: user.emailVerifiedAt ?? null,
    };
  }

  async getByEmail(email: string) {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();

    if (!user) {
      return null;
    }

    return {
      id: String(user._id),
      email: user.email,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerifiedAt: user.emailVerifiedAt ?? null,
    };
  }

  async markEmailVerified(userId: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (!user.emailVerifiedAt) {
      user.emailVerifiedAt = new Date();
      await user.save();
    }

    return this.getById(userId);
  }

  async updatePassword(userId: string, password: string) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();

    return this.getById(userId);
  }

  async getById(userId: string) {
    const user = await UserModel.findById(userId).lean();

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const fallbackName = splitDisplayName(user.displayName);

    return {
      id: String(user._id),
      email: user.email,
      displayName: user.displayName,
      firstName: user.firstName ?? fallbackName.firstName,
      lastName: user.lastName ?? fallbackName.lastName,
      emailVerifiedAt: user.emailVerifiedAt ?? null,
      createdAt: user.createdAt,
    };
  }

  async updateUserSettings(
    userId: string,
    input: {
      firstName?: string;
      lastName?: string;
      currentPassword?: string;
      newPassword?: string;
    },
  ) {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const firstNameProvided = typeof input.firstName === "string";
    const lastNameProvided = typeof input.lastName === "string";

    if (firstNameProvided || lastNameProvided) {
      const nextFirstName = (input.firstName ?? user.firstName ?? splitDisplayName(user.displayName).firstName).trim();
      const nextLastName = (input.lastName ?? user.lastName ?? splitDisplayName(user.displayName).lastName).trim();

      if (!nextFirstName || !nextLastName) {
        throw new ApiError("First and last name are required", 400);
      }

      user.firstName = nextFirstName;
      user.lastName = nextLastName;
      user.displayName = composeDisplayName(nextFirstName, nextLastName);
    }

    const wantsPasswordUpdate = Boolean(input.currentPassword || input.newPassword);

    if (wantsPasswordUpdate) {
      if (!input.currentPassword || !input.newPassword) {
        throw new ApiError("Current and new password are required", 400);
      }

      const validCurrentPassword = await bcrypt.compare(input.currentPassword, user.passwordHash);
      if (!validCurrentPassword) {
        throw new ApiError("Current password is incorrect", 401);
      }

      user.passwordHash = await bcrypt.hash(input.newPassword, 12);
    }

    await user.save();
    return this.getById(userId);
  }
}
