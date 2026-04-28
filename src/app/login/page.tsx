import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/_lib/get-current-user";
import { LoginPage } from "@/frontend/modules/auth/pages/LoginPage";

export default async function LoginRoute() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginPage />;
}
