import { getCurrentUserOrRedirect } from "@/app/_lib/get-current-user";
import { connectDatabase } from "@/backend/common/database/db";
import { FriendsService } from "@/backend/modules/friends/friends.service";
import { FriendsPage } from "@/frontend/modules/friends/pages/FriendsPage";

export default async function FriendsRoute() {
  const user = await getCurrentUserOrRedirect();
  await connectDatabase();

  const friendsService = new FriendsService();
  const [initialFriends, initialRequests] = await Promise.all([
    friendsService.listFriends(user.id),
    friendsService.listRequests(user.id),
  ]);

  return <FriendsPage user={user} initialFriends={initialFriends} initialRequests={initialRequests} />;
}
