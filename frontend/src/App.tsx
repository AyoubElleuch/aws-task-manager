import { useEffect, useState } from "react";
import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { getSession } from "./auth/auth";
import { ConfirmEmailPage, ResetPasswordPage, SignInPage, SignUpPage } from "./auth/AuthPages";
import SignedInPage from "./SignedInPage";

type SessionState = "checking" | "signed-in" | "signed-out";

function GuestRoute({ session }: { session: SessionState }) {
  return session === "signed-in" ? <Navigate to="/" replace /> : <Outlet />;
}

function PrivateRoute({ session, guestPath }: { session: SessionState; guestPath: string }) {
  return session === "signed-in" ? <Outlet /> : <Navigate to={guestPath} replace />;
}

export default function App() {
  const [session, setSession] = useState<SessionState>("checking");
  const [guestPath, setGuestPath] = useState("/signup");

  useEffect(() => {
    let active = true;
    
    void getSession()
      .then((result) => {
        if (active) setSession(result.tokens?.accessToken ? "signed-in" : "signed-out");
      })
      .catch(() => {
        if (active) {
          setGuestPath("/signin");
          setSession("signed-out");
        }
      });
    return () => { active = false; };
  }, []);

  if (session === "checking") return <p>Checking session...</p>;

  return (
    <HashRouter>
      <Routes>
        <Route element={<GuestRoute session={session} />}>
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/confirm-email" element={<ConfirmEmailPage />} />
          <Route path="/signin" element={<SignInPage onSignedIn={() => setSession("signed-in")} />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>
        <Route element={<PrivateRoute session={session} guestPath={guestPath} />}>
          <Route path="/" element={<SignedInPage onSessionEnded={() => {
            setGuestPath("/signin");
            setSession("signed-out");
          }} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
