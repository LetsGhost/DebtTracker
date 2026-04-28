import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/_lib/get-current-user";
import { RegisterPage } from "@/frontend/modules/auth/pages/RegisterPage";

export default async function RegisterRoute() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <RegisterPage />;
}
