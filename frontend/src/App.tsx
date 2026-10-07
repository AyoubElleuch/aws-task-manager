import { useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, Outlet, Route, Routes, useLocation, useParams } from "react-router";
import { getSession } from "./auth/auth";
import { ConfirmEmailPage, ResetPasswordPage, SignInPage, SignUpPage } from "./auth/AuthPages";
import SignedInPage from "./SignedInPage";
import ProjectsPage from "./ProjectsPage";
import ProjectPage from "./ProjectPage";
import { getProject } from "./projects/projectsApi";

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

function ProjectRoute() {
  const { projectId } = useParams();
  const [project, setProject] = useState<{ projectId: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    setProject(null);
    setError(null);
    getProject(projectId)
      .then((result) => {
        if (active) setProject(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load project.");
      });
    return () => { active = false; };
  }, [projectId]);

  return (
    <>
      <p><Link to="/projects">Back to projects</Link></p>
      {error && <p role="alert">{error}</p>}
      {!project && !error && <p>Loading...</p>}
      {project && <ProjectPage project={project} />}
    </>
  );
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
          <Route path="/projects/:projectId" element={<ProjectRoute />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
