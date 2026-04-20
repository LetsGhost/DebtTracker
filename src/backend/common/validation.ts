import "reflect-metadata";

import { ClassConstructor, plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";

import { ApiError } from "@/backend/common/errors";

export const validateDto = async <T extends object>(
  dto: ClassConstructor<T>,
  payload: unknown,
): Promise<T> => {
  const instance = plainToInstance(dto, payload);

  try {
    await validateOrReject(instance);
  } catch {
    throw new ApiError("Validation failed", 422);
  }

  return instance;
};
