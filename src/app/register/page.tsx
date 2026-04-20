import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/backend/common/config/env";
import { RegisterPage } from "@/frontend/modules/auth/pages/RegisterPage";

export default async function RegisterRoute() {
  const token = (await cookies()).get(env.jwtCookieName)?.value;

  if (token) {
    redirect("/dashboard");
  }

  return <RegisterPage />;
}
