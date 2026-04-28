import { Types } from "mongoose";

/**
 * Helper to safely convert string IDs to Mongoose ObjectId for queries.
 * Ensures consistent ID handling across all services.
 */
export const toObjectId = (id: string | Types.ObjectId): Types.ObjectId => {
  if (id instanceof Types.ObjectId) return id;
  return new Types.ObjectId(id);
};
