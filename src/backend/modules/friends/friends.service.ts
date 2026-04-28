import { ApiError } from "@/backend/common/errors/errors";
import { FriendRequestModel } from "@/backend/modules/friends/friends.entity";
import { UserModel } from "@/backend/modules/users/users.entity";

const byNewest = { createdAt: -1 } as const;

export class FriendsService {
  async getFriendUserIds(userId: string) {
    const accepted = await FriendRequestModel.find({
      status: "accepted",
      $or: [{ requesterUserId: userId }, { recipientUserId: userId }],
    }).lean();

    return accepted.map((request: any) => (
      request.requesterUserId === userId ? request.recipientUserId : request.requesterUserId
    ));
  }

  async areFriends(userA: string, userB: string) {
    const relation = await FriendRequestModel.findOne({
      status: "accepted",
      $or: [
        { requesterUserId: userA, recipientUserId: userB },
        { requesterUserId: userB, recipientUserId: userA },
      ],
    }).lean();

    return Boolean(relation);
  }

  async createRequest(requesterUserId: string, email: string) {
    const recipient = await UserModel.findOne({ email: email.toLowerCase().trim() }).lean();

    if (!recipient) {
      throw new ApiError("User not found", 404);
    }

    const recipientUserId = String(recipient._id);

    if (recipientUserId === requesterUserId) {
      throw new ApiError("You cannot add yourself", 400);
    }

    const existingAccepted = await FriendRequestModel.findOne({
      status: "accepted",
      $or: [
        { requesterUserId, recipientUserId },
        { requesterUserId: recipientUserId, recipientUserId: requesterUserId },
      ],
    }).lean();

    if (existingAccepted) {
      throw new ApiError("You are already friends", 409);
    }

    const reversePending = await FriendRequestModel.findOne({
      requesterUserId: recipientUserId,
      recipientUserId: requesterUserId,
      status: "pending",
    });

    if (reversePending) {
      reversePending.status = "accepted";
      reversePending.actedAt = new Date();
      await reversePending.save();
      return {
        requestId: String(reversePending._id),
        status: "accepted" as const,
        autoAccepted: true,
      };
    }

    const duplicatePending = await FriendRequestModel.findOne({
      requesterUserId,
      recipientUserId,
      status: "pending",
    }).lean();

    if (duplicatePending) {
      throw new ApiError("Friend request already sent", 409);
    }

    const request = await FriendRequestModel.create({
      requesterUserId,
      recipientUserId,
      status: "pending",
    });

    return {
      requestId: String(request._id),
      status: request.status,
      autoAccepted: false,
    };
  }

  async listFriends(userId: string) {
    const friendIds = await this.getFriendUserIds(userId);

    if (friendIds.length === 0) {
      return [];
    }

    const users = await UserModel.find({ _id: { $in: friendIds } }).sort(byNewest).lean();

    return users.map((user: any) => ({
      id: String(user._id),
      displayName: user.displayName,
      email: user.email,
      suspendedAt: user.suspendedAt ?? null,
    }));
  }

  async listRequests(userId: string) {
    const [incoming, outgoing] = await Promise.all([
      FriendRequestModel.find({ recipientUserId: userId, status: "pending" }).sort(byNewest).lean(),
      FriendRequestModel.find({ requesterUserId: userId, status: "pending" }).sort(byNewest).lean(),
    ]);

    const userIds = [
      ...incoming.map((request: any) => request.requesterUserId),
      ...outgoing.map((request: any) => request.recipientUserId),
    ];

    const users = await UserModel.find({ _id: { $in: userIds } }).lean();
    const userMap = new Map<string, { displayName: string; email: string }>(
      users.map((user: any) => [String(user._id), { displayName: user.displayName, email: user.email }]),
    );

    return {
      incoming: incoming.map((request: any) => {
        const requester = userMap.get(request.requesterUserId);
        return {
          id: String(request._id),
          userId: request.requesterUserId,
          displayName: requester?.displayName ?? request.requesterUserId,
          email: requester?.email ?? "",
          createdAt: request.createdAt,
        };
      }),
      outgoing: outgoing.map((request: any) => {
        const recipient = userMap.get(request.recipientUserId);
        return {
          id: String(request._id),
          userId: request.recipientUserId,
          displayName: recipient?.displayName ?? request.recipientUserId,
          email: recipient?.email ?? "",
          createdAt: request.createdAt,
        };
      }),
    };
  }

  async acceptRequest(userId: string, requestId: string) {
    const request = await FriendRequestModel.findById(requestId);

    if (!request || request.status !== "pending") {
      throw new ApiError("Friend request not found", 404);
    }

    if (request.recipientUserId !== userId) {
      throw new ApiError("Forbidden", 403);
    }

    request.status = "accepted";
    request.actedAt = new Date();
    await request.save();

    return { accepted: true };
  }

  async rejectRequest(userId: string, requestId: string) {
    const request = await FriendRequestModel.findById(requestId);

    if (!request || request.status !== "pending") {
      throw new ApiError("Friend request not found", 404);
    }

    if (request.recipientUserId !== userId) {
      throw new ApiError("Forbidden", 403);
    }

    request.status = "rejected";
    request.actedAt = new Date();
    await request.save();

    return { rejected: true };
  }
}
