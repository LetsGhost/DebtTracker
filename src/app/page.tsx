import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/backend/common/env";

export default async function HomePage() {
  const token = (await cookies()).get(env.jwtCookieName)?.value;
  redirect(token ? "/dashboard" : "/login");
}
