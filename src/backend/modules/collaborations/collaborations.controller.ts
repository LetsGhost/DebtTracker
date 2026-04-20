import { NextRequest } from "next/server";

import { ok } from "@/backend/common/http/response";
import { CollaborationsService } from "@/backend/modules/collaborations/collaborations.service";

export class CollaborationsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  async list(_request: NextRequest, userId: string) {
    const collaborations = await this.collaborationsService.listForUser(userId);
    return ok(collaborations);
  }
}
