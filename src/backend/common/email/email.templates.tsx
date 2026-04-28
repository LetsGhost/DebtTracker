import * as React from "react";

type EmailShellProps = {
  appName: string;
  title: string;
  preview: string;
  children: React.ReactNode;
  ctaLabel?: string;
  ctaUrl?: string;
};

const shellStyles = {
  page: {
    margin: 0,
    padding: "32px 0",
    backgroundColor: "#f7f7f7",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#111827",
  } as React.CSSProperties,
  card: {
    width: "100%",
    maxWidth: "640px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  } as React.CSSProperties,
  body: {
    padding: "32px",
  } as React.CSSProperties,
  button: {
    display: "inline-block",
    marginTop: "24px",
    padding: "12px 18px",
    borderRadius: "12px",
    backgroundColor: "#111827",
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 700,
  } as React.CSSProperties,
  meta: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: "24px",
  } as React.CSSProperties,
};

const EmailShell = ({ appName, title, preview, children, ctaLabel, ctaUrl }: EmailShellProps) => (
  <html>
    <body style={shellStyles.page}>
      <div style={{ display: "none", overflow: "hidden", lineHeight: "1px", opacity: 0, maxHeight: 0, maxWidth: 0 }}>
        {preview}
      </div>
      <div style={shellStyles.card}>
        <div style={{ padding: "28px 32px", backgroundColor: "#111827", color: "#ffffff" }}>
          <div style={{ fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.75 }}>{appName}</div>
          <h1 style={{ margin: "10px 0 0", fontSize: "28px", lineHeight: 1.2 }}>{title}</h1>
        </div>

        <div style={shellStyles.body}>
          {children}

          {ctaLabel && ctaUrl && (
            <a href={ctaUrl} style={shellStyles.button} target="_blank" rel="noreferrer">
              {ctaLabel}
            </a>
          )}

          <p style={shellStyles.meta}>
            Wenn du diese E-Mail nicht angefordert hast, setzte bitte dein Passwort zurueck.
          </p>
        </div>
      </div>
    </body>
  </html>
);

export const PasswordResetEmailTemplate = ({
  appName,
  firstName,
  resetUrl,
}: {
  appName: string;
  firstName?: string;
  resetUrl: string;
}) => (
  <EmailShell
    appName={appName}
    title="Passwort zuruecksetzen"
    preview="Setze dein Passwort sicher zurueck."
    ctaLabel="Passwort zuruecksetzen"
    ctaUrl={resetUrl}
  >
    <p>Hallo {firstName ?? ""},</p>
    <p>du hast ein neues Passwort angefordert. Der Link ist aus Sicherheitsgruenden zeitlich begrenzt.</p>
    <p>Wenn du die Anfrage nicht ausgelöst hast, musst du nichts tun.</p>
  </EmailShell>
);

export const EmailVerificationTemplate = ({
  appName,
  firstName,
  verificationUrl,
}: {
  appName: string;
  firstName?: string;
  verificationUrl: string;
}) => (
  <EmailShell
    appName={appName}
    title="E-Mail bestaetigen"
    preview="Bestaetige deine E-Mail-Adresse."
    ctaLabel="E-Mail bestaetigen"
    ctaUrl={verificationUrl}
  >
    <p>Hallo {firstName ?? ""},</p>
    <p>bitte bestaetige deine E-Mail-Adresse, um dein Konto vollstaendig zu aktivieren.</p>
  </EmailShell>
);

export const NotificationEmailTemplate = ({
  appName,
  firstName,
  message,
  ctaLabel,
  ctaUrl,
}: {
  appName: string;
  firstName?: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) => (
  <EmailShell appName={appName} title="Neue Benachrichtigung" preview={message} ctaLabel={ctaLabel} ctaUrl={ctaUrl}>
    <p>Hallo {firstName ?? ""},</p>
    <p>{message}</p>
  </EmailShell>
);