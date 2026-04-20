import { NextRequest } from "next/server";

import { ok } from "@/backend/common/response";
import { CategoriesService } from "@/backend/modules/categories/categories.service";

export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  async list(_request: NextRequest, userId: string) {
    const categories = await this.categoriesService.listForUser(userId);
    return ok(categories);
  }
}
