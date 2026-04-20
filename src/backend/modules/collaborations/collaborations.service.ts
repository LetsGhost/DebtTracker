import { CollaborationModel } from "@/backend/modules/collaborations/collaborations.entity";

export class CollaborationsService {
  async listForUser(userId: string) {
    return CollaborationModel.find({
      $or: [{ ownerUserId: userId }, { collaboratorUserId: userId }],
    }).lean();
  }
}
