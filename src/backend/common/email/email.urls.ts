import { env } from "@/backend/common/config/env";

export const buildAppUrl = (path: string) => new URL(path, env.appUrl).toString();