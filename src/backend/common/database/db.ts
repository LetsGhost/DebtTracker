import mongoose from "mongoose";

import { env } from "@/backend/common/config/env";

let connected = false;

export const connectDatabase = async () => {
  if (connected) {
    return;
  }

  await mongoose.connect(env.mongodbUri);
  connected = true;
};
