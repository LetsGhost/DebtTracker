import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyAccessToken } from "@/backend/common/auth/auth";
import { env } from "@/backend/common/config/env";
import { LoginPage } from "@/frontend/modules/auth/pages/LoginPage";

export default async function LoginRoute() {
  const token = (await cookies()).get(env.jwtCookieName)?.value;
  const payload = verifyAccessToken(token);

  if (payload?.userId && payload.verified) {
    redirect("/dashboard");
  }

  return <LoginPage />;
}
