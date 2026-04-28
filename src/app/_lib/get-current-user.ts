import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyAccessToken } from "@/backend/common/auth/auth";
import { env } from "@/backend/common/config/env";
import { container } from "@/backend/container";

export type CurrentUser = {
  id: string;
  displayName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailNotificationsEnabled?: boolean;
};

export const getCurrentUserOrRedirect = async (): Promise<CurrentUser> => {
  const token = (await cookies()).get(env.jwtCookieName)?.value;
  const payload = verifyAccessToken(token);

  if (!payload?.userId) {
    redirect("/login");
  }

  const response = await container.authController.me();

  if (!response.ok) {
    redirect("/login");
  }

  const json = await response.json() as { success?: boolean; data?: CurrentUser };

  if (!json.success || !json.data) {
    redirect("/login");
  }

  return json.data;
};
