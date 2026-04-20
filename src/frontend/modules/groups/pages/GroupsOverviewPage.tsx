"use client";

import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Card } from "@/frontend/shared/components/Card";
import { ModuleNav } from "@/frontend/shared/components/ModuleNav";
import { apiGet } from "@/frontend/shared/lib/api-client";

type Group = { id: string; name: string; baseCurrency: string };

export const GroupsOverviewPage = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiGet<Group[]>("/api/groups")
      .then(setGroups)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load groups"));
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 md:py-8">
      <header className="space-y-4 rounded-2xl border border-black/10 bg-(--surface) p-4 md:p-5">
        <div>
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-sm text-(--text-muted)">Choose a group or create a new one.</p>
        </div>
        <ModuleNav />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/groups/new" className="block">
          <Card>
            <div className="flex min-h-40 flex-col items-center justify-center gap-3 border-2 border-dashed border-black/20 text-center">
              <Plus size={28} />
              <p className="font-semibold">Create New Group</p>
            </div>
          </Card>
        </Link>

        {groups.map((group) => (
          <Link key={group.id} href={`/groups/${group.id}`} className="block">
            <Card>
              <div className="flex min-h-40 flex-col justify-between">
                <div className="flex items-center gap-2 text-(--text-muted)">
                  <Users size={16} />
                  <span className="text-xs uppercase tracking-[0.15em]">Group</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{group.name}</h3>
                  <p className="mt-1 text-sm text-(--text-muted)">{group.baseCurrency}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </section>

      {error && <p className="rounded-xl bg-(--danger)/10 px-3 py-2 text-sm text-(--danger)">{error}</p>}
    </main>
  );
};
