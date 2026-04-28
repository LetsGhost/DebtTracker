"use client";

import { FormEvent, useState } from "react";
import { UserPlus, Mail, Users } from "lucide-react";

import { Button } from "@/frontend/shared/components/Button";
import { Card } from "@/frontend/shared/components/Card";
import { ModuleNav } from "@/frontend/shared/components/ModuleNav";
import { TextField } from "@/frontend/shared/components/TextField";
import { apiGet, apiPost } from "@/frontend/shared/lib/api-client";
import { useToast } from "@/frontend/shared/hooks/useToast";

type Friend = {
  id: string;
  displayName: string;
  email: string;
  suspendedAt: string | null;
};

type FriendRequest = {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  createdAt: string;
};

type FriendRequestsResponse = {
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
};

type FriendsPageProps = {
  user: {
    id: string;
    displayName: string;
    email: string;
  };
  initialFriends: Friend[];
  initialRequests: FriendRequestsResponse;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 16).replace("T", " ");
};

export const FriendsPage = ({ user, initialFriends, initialRequests }: FriendsPageProps) => {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [friends, setFriends] = useState<Friend[]>(initialFriends);
  const [incoming, setIncoming] = useState<FriendRequest[]>(initialRequests.incoming);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>(initialRequests.outgoing);
  const [isLoading, setIsLoading] = useState(false);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [friendList, requests] = await Promise.all([
        apiGet<Friend[]>("/api/friends"),
        apiGet<FriendRequestsResponse>("/api/friends/requests"),
      ]);
      setFriends(friendList);
      setIncoming(requests.incoming);
      setOutgoing(requests.outgoing);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load friends");
    } finally {
      setIsLoading(false);
    }
  };

  const onSendRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await apiPost<{ autoAccepted: boolean }>("/api/friends", { email: email.trim() });
      setEmail("");
      await loadAll();
      toast.success(response.autoAccepted ? "Friend request automatisch akzeptiert." : "Friend request gesendet.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send friend request");
    }
  };

  const onAccept = async (requestId: string) => {
    try {
      await apiPost(`/api/friends/requests/${requestId}/accept`, {});
      await loadAll();
      toast.success("Friend request akzeptiert.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Accept failed");
    }
  };

  const onReject = async (requestId: string) => {
    try {
      await apiPost(`/api/friends/requests/${requestId}/reject`, {});
      await loadAll();
      toast.success("Friend request abgelehnt.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Reject failed");
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 md:py-8">
      <header className="space-y-4 rounded-2xl border border-black/10 bg-(--surface) p-4 md:p-5">
        <div>
          <h1 className="text-2xl font-bold">Friends</h1>
          <p className="text-sm text-(--text-muted)">{user.displayName} · {user.email}</p>
        </div>
        <ModuleNav />
      </header>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <UserPlus size={18} />
            <h2 className="text-lg font-semibold">Add Friend via Email</h2>
          </div>
          <form className="space-y-3" onSubmit={onSendRequest}>
            <TextField
              name="email"
              type="email"
              label="Email address"
              placeholder="friend@mail.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Button type="submit" className="w-full">Send request</Button>
          </form>
          <p className="mt-3 text-xs text-(--text-muted)">No search. Requests are sent only by exact email address.</p>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Mail size={18} />
            <h2 className="text-lg font-semibold">Incoming Requests</h2>
          </div>
          <div className="space-y-2">
            {incoming.length === 0 && <p className="text-sm text-(--text-muted)">No incoming requests.</p>}
            {incoming.map((request) => (
              <div key={request.id} className="rounded-xl border border-black/10 bg-white p-3 text-sm">
                <p className="font-semibold">{request.displayName}</p>
                <p className="text-xs text-(--text-muted)">{request.email}</p>
                <p className="text-xs text-(--text-muted)">{formatDate(request.createdAt)}</p>
                <div className="mt-2 flex gap-2">
                  <Button type="button" onClick={() => onAccept(request.id)}>Accept</Button>
                  <Button type="button" variant="ghost" onClick={() => onReject(request.id)}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Mail size={18} />
            <h2 className="text-lg font-semibold">Outgoing Requests</h2>
          </div>
          <div className="space-y-2">
            {outgoing.length === 0 && <p className="text-sm text-(--text-muted)">No outgoing requests.</p>}
            {outgoing.map((request) => (
              <div key={request.id} className="rounded-xl border border-black/10 bg-white p-3 text-sm">
                <p className="font-semibold">{request.displayName}</p>
                <p className="text-xs text-(--text-muted)">{request.email}</p>
                <p className="text-xs text-(--text-muted)">{formatDate(request.createdAt)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Users size={18} />
            <h2 className="text-lg font-semibold">My Friends</h2>
          </div>
          {isLoading && <p className="text-sm text-(--text-muted)">Loading...</p>}
          <div className="space-y-2">
            {friends.length === 0 && !isLoading && <p className="text-sm text-(--text-muted)">No friends yet.</p>}
            {friends.map((friend) => (
              <div key={friend.id} className="rounded-xl border border-black/10 bg-white p-3 text-sm">
                <p className="font-semibold">{friend.displayName}</p>
                <p className="text-xs text-(--text-muted)">{friend.email}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <div>
        <Button type="button" variant="ghost" onClick={() => void loadAll()}>Refresh</Button>
      </div>
    </main>
  );
};
