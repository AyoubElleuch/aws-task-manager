import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { getSession } from "./auth/auth";
import { ConfirmEmailPage, ResetPasswordPage, SignInPage, SignUpPage } from "./auth/AuthPages";
import SignedInPage from "./SignedInPage";
import ProjectsPage from "./ProjectsPage";

type SessionState = "checking" | "signed-in" | "signed-out";

function GuestRoute({ session }: { session: SessionState }) {
  return session === "signed-in" ? <Navigate to="/" replace /> : <Outlet />;
}

function PrivateRoute({ session, guestPath }: { session: SessionState; guestPath: string }) {
  const location = useLocation();
  if (session === "signed-in") return <Outlet />;
  if (location.pathname === "/") return <Navigate to={guestPath} replace />;
  return <Navigate to="/signin" replace />;
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
    <BrowserRouter>
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
          <Route path="/projects" element={<ProjectsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
