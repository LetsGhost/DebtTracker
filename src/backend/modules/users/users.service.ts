import bcrypt from "bcryptjs";

import { ApiError } from "@/backend/common/errors";
import { logger } from "@/backend/common/logger";
import { UserModel } from "@/backend/modules/users/users.entity";

export class UsersService {
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
    };
  }

  async getById(userId: string) {
    const user = await UserModel.findById(userId).lean();

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    return {
      id: String(user._id),
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
    };
  }
}
