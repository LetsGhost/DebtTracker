import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyAccessToken } from "@/backend/common/auth/auth";
import { connectDatabase } from "@/backend/common/database/db";
import { env } from "@/backend/common/config/env";
import { SysAdminService } from "@/backend/modules/sysadmin/sysadmin.service";
import { UserModel } from "@/backend/modules/users/users.entity";
import { SysAdminPage } from "@/frontend/modules/sysadmin/pages/SysAdminPage";

export default async function SysAdminRoute() {
  const token = (await cookies()).get(env.jwtCookieName)?.value;
  const payload = verifyAccessToken(token);

  if (!payload?.userId) {
    redirect("/login");
  }

  await connectDatabase();
  const user = await UserModel.findById(payload.userId).lean();

  if (!user || !env.sysAdminEmails.includes(user.email.toLowerCase())) {
    redirect("/dashboard");
  }

  const stats = await new SysAdminService().getStats();
  return <SysAdminPage stats={stats} />;
}
