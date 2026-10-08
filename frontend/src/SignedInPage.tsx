import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getSession, logout } from "./auth/auth";

export default function SignedInPage({ onSessionEnded }: { onSessionEnded: () => void }) {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMe() {
      try {
        const token = (await getSession()).tokens?.accessToken?.toString();
        if (!token) {
          if (active) onSessionEnded();
          return;
        }

        const apiUrl = import.meta.env.VITE_API_BASE_URL;

        if (!apiUrl) throw new Error("VITE_API_BASE_URL is missing.");

        const response = await fetch(`${apiUrl.replace(/\/$/, "")}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`/me returned ${response.status}.`);

        const body: unknown = await response.json();

        if (!body || typeof body !== "object" || !("sub" in body) || typeof body.sub !== "string") {
          throw new Error("Invalid /me response.");
        }

        if (active) setUserId(body.sub);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load /me.");
      }
    }

    void loadMe();
    return () => { active = false; };
  }, [onSessionEnded]);

  async function handleSignOut() {
    try {
      await logout();
      onSessionEnded();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign out.");
    }
  }

  return (
    <div className="welcome">
      <p className="eyebrow">Your workspace</p><h1>Good work starts here.</h1><p className="muted">One place for your projects, milestones, and the small steps in between.</p>
      {userId && <p className="account-id">User ID: {userId}</p>}
      {error && <p role="alert">{error}</p>}
      <p><Link className="button primary" to="/projects">Open projects</Link></p>
      <button type="button" onClick={() => void handleSignOut()}>Sign out</button>
    </div>
  );
}
