import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/backend/common/config/env";
import { LoginPage } from "@/frontend/modules/auth/pages/LoginPage";

export default async function LoginRoute() {
  const token = (await cookies()).get(env.jwtCookieName)?.value;

  if (token) {
    redirect("/dashboard");
  }

  return <LoginPage />;
}
