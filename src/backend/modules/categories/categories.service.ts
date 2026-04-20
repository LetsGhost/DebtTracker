import { CategoryModel } from "@/backend/modules/categories/categories.entity";

export class CategoriesService {
  async listForUser(userId: string) {
    return CategoryModel.find({ userId }).sort({ name: 1 }).lean();
  }
}
