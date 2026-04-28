import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/_lib/get-current-user";

export default async function HomePage() {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/login");
}
