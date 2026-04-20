import { AnyParamConstructor } from "@typegoose/typegoose/lib/types";
import { getModelForClass as typegooseGetModelForClass, ReturnModelType } from "@typegoose/typegoose";
import mongoose from "mongoose";

const registeredModels = new Set<string>();

/**
 * Safe wrapper around getModelForClass that prevents model re-registration errors
 * during Next.js dev mode hot reloads.
 */
export function getModelForClass<T extends AnyParamConstructor<any>>(
  cl: T,
): ReturnModelType<T, any> {
  const modelName = cl.name;

  // Check if model already exists in Mongoose
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName] as ReturnModelType<T, any>;
  }

  // Track and register
  if (!registeredModels.has(modelName)) {
    registeredModels.add(modelName);
  }

  return typegooseGetModelForClass(cl);
}
