import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyAccessToken } from "@/backend/common/auth/auth";
import { connectDatabase } from "@/backend/common/database/db";
import { env } from "@/backend/common/config/env";
import { UserModel } from "@/backend/modules/users/users.entity";

export type CurrentUser = {
  id: string;
  displayName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  emailNotificationsEnabled?: boolean;
};

export const getCurrentUser = async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(env.jwtCookieName)?.value;
  const payload = verifyAccessToken(token);

  if (!payload?.userId || !payload.verified) {
    return null;
  }

  await connectDatabase();

  const user = await UserModel.findById(payload.userId).lean();

  if (!user) {
    return null;
  }

  return {
    id: String(user._id),
    displayName: user.displayName,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    emailNotificationsEnabled: user.emailNotificationsEnabled !== false,
  };
};

export const getCurrentUserOrRedirect = async (): Promise<CurrentUser> => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
};
