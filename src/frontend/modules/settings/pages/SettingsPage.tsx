"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { FileText, History, Lock, UserRound } from "lucide-react";

import { Button } from "@/frontend/shared/components/Button";
import { Card } from "@/frontend/shared/components/Card";
import { ModuleNav } from "@/frontend/shared/components/ModuleNav";
import { TextField } from "@/frontend/shared/components/TextField";
import { useDialog } from "@/frontend/shared/hooks/useDialog";
import { useToast } from "@/frontend/shared/hooks/useToast";
import { apiDelete, apiPatch } from "@/frontend/shared/lib/api-client";

type SettingsPageProps = {
  user: {
    id: string;
    displayName: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
};

type UpdateSettingsResponse = {
  id: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
};

const deriveNames = (displayName: string) => {
  const tokens = displayName.trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (tokens.length === 1) {
    return { firstName: tokens[0], lastName: "" };
  }

  return {
    firstName: tokens[0],
    lastName: tokens.slice(1).join(" "),
  };
};

export const SettingsPage = ({ user }: SettingsPageProps) => {
  const router = useRouter();
  const toast = useToast();
  const dialog = useDialog();
  const fallbackNames = useMemo(() => deriveNames(user.displayName), [user.displayName]);

  const [firstName, setFirstName] = useState(user.firstName ?? fallbackNames.firstName);
  const [lastName, setLastName] = useState(user.lastName ?? fallbackNames.lastName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openTermsDialog = async () => {
    await dialog.open({
      title: "Terms of Service",
      description: "Nutzungsbedingungen fuer UOme",
      cancelLabel: "Schliessen",
      children: (
        <div className="space-y-2">
          <p>1. Du nutzt die App auf eigene Verantwortung.</p>
          <p>2. Teile keine Zugangsdaten mit Dritten.</p>
          <p>3. Finanzdaten duerfen nur im erlaubten Team-Kontext geteilt werden.</p>
          <p>4. Missbrauch oder Manipulationsversuche koennen zur Sperrung fuehren.</p>
        </div>
      ),
    });
  };

  const openChangelogDialog = async () => {
    await dialog.open({
      title: "Changelog",
      description: "Aktuelle und letzte Aenderungen",
      cancelLabel: "Schliessen",
      children: (
        <div className="space-y-2">
          <p><strong>v1.0.0</strong> Initiale stabile Version.</p>
          <p><strong>v1.1.0</strong> Verbesserte Gruppen- und Settlement-Workflows.</p>
          <p><strong>v1.2.0</strong> Notification-Clear-Funktion und UX-Optimierungen.</p>
          <p><strong>v1.3.0</strong> Neue User-Settings fuer Namen und Passwort.</p>
        </div>
      ),
    });
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const wantsPasswordChange = Boolean(currentPassword || newPassword || confirmNewPassword);

    if (!normalizedFirstName || !normalizedLastName) {
      toast.error("Bitte Vorname und Nachname ausfuellen.");
      return;
    }

    if (wantsPasswordChange) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        toast.error("Bitte alle Passwort-Felder ausfuellen.");
        return;
      }

      if (newPassword.length < 6) {
        toast.error("Das neue Passwort muss mindestens 6 Zeichen haben.");
        return;
      }

      if (newPassword !== confirmNewPassword) {
        toast.error("Neues Passwort und Bestaetigung stimmen nicht ueberein.");
        return;
      }
    }

    const confirmed = await dialog.open({
      title: "Einstellungen speichern?",
      description: wantsPasswordChange
        ? "Vorname, Nachname und Passwort werden aktualisiert."
        : "Vorname und Nachname werden aktualisiert.",
      actions: [
        {
          label: "Speichern",
          variant: "primary",
          onClick: () => undefined,
        },
      ],
    });

    if (!confirmed) return;

    setIsSubmitting(true);

    try {
      const payload: {
        firstName: string;
        lastName: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        firstName: normalizedFirstName,
        lastName: normalizedLastName,
      };

      if (wantsPasswordChange) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const updated = await apiPatch<UpdateSettingsResponse>("/api/users/me", payload);

      setFirstName(updated.firstName ?? normalizedFirstName);
      setLastName(updated.lastName ?? normalizedLastName);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      toast.success("Einstellungen wurden gespeichert.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Speichern fehlgeschlagen");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteAccount = async () => {
    const confirmed = await dialog.open({
      title: "Account wirklich loeschen?",
      description: "Diese Aktion entfernt deinen Account dauerhaft und loggt dich sofort aus.",
      actions: [
        {
          label: "Account loeschen",
          variant: "danger",
          onClick: () => undefined,
        },
      ],
    });

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiDelete<{ deleted: boolean }>("/api/users/me");
      toast.success("Dein Account wurde geloescht.");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Account konnte nicht geloescht werden");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8">
      <header className="space-y-4 rounded-2xl border border-black/10 bg-(--surface) p-5">
        <div>
          <h1 className="text-2xl font-bold">User Settings</h1>
          <p className="text-sm text-(--text-muted)">{user.displayName} · {user.email}</p>
        </div>
        <ModuleNav />
      </header>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
          <div className="mb-4 flex items-center gap-2">
            <UserRound size={18} />
            <h2 className="text-lg font-semibold">Profil und Passwort</h2>
          </div>

          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                name="firstName"
                label="Vorname"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
              />
              <TextField
                name="lastName"
                label="Nachname"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
              />
            </div>

            <div className="mt-4 rounded-xl border border-black/10 bg-black/5 p-3">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Lock size={16} />
                Passwort aendern (optional)
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  name="currentPassword"
                  label="Aktuelles Passwort"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />
                <TextField
                  name="newPassword"
                  label="Neues Passwort"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
              <div className="mt-3">
                <TextField
                  name="confirmNewPassword"
                  label="Neues Passwort bestaetigen"
                  type="password"
                  autoComplete="new-password"
                  value={confirmNewPassword}
                  onChange={(event) => setConfirmNewPassword(event.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Speichern..." : "Einstellungen speichern"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full border border-red-300 text-red-700 hover:bg-red-50"
              disabled={isDeleting}
              onClick={onDeleteAccount}
            >
              {isDeleting ? "Loeschen..." : "Account loeschen"}
            </Button>
          </form>
          </Card>
        </div>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <FileText size={18} />
            <h2 className="text-lg font-semibold">Dokumente</h2>
          </div>
          <div className="space-y-3">
            <Button type="button" variant="ghost" className="w-full justify-start" onClick={openTermsDialog}>
              <FileText size={16} className="mr-2" />
              Terms of Service
            </Button>
            <Button type="button" variant="ghost" className="w-full justify-start" onClick={openChangelogDialog}>
              <History size={16} className="mr-2" />
              Changelog
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
};
