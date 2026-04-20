import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyAccessToken } from "@/backend/common/auth";
import { env } from "@/backend/common/env";
import { container } from "@/backend/container";

export type CurrentUser = {
  id: string;
  displayName: string;
  email: string;
};

export const getCurrentUserOrRedirect = async (): Promise<CurrentUser> => {
  const token = (await cookies()).get(env.jwtCookieName)?.value;
  const payload = verifyAccessToken(token);

  if (!payload?.userId) {
    redirect("/login");
  }

  return container.authController
    .me()
    .then(async (response) => (await response.json()).data as CurrentUser);
};
