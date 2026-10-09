import { NavLink, Outlet, useLocation } from "react-router";

export default function PageLayout({ guest = false }: { guest?: boolean }) {
  const location = useLocation();
  let title = "Welcome back";
  let description = "Sign in to keep your work moving.";
  if (location.pathname === "/signup") {
    title = "A little more organized.";
    description = "Create an account. Make room for your next project.";
  } else if (location.pathname === "/confirm-email") {
    title = "Check your inbox";
    description = "Enter the confirmation code we sent you.";
  } else if (location.pathname === "/reset-password") {
    title = "A fresh start";
    description = "Reset your password and get back to work.";
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="header-inner">
          <div className="brand-group">
            <div className="technology-logos">
              <img src="/logos/aws.svg" alt="AWS" width="42" height="32" />
              <img src="/logos/terraform.svg" alt="Terraform" width="26" height="30" />
            </div>
            <div>
              <NavLink className="brand" to="/">Task Manager</NavLink>
              <p className="brand-caption">AWS &amp; Terraform · Cloud skills in practice</p>
            </div>
          </div>
          <nav aria-label="Main navigation">
            {guest ? <><NavLink to="/signin">Sign in</NavLink><NavLink to="/signup">Create account</NavLink></> :
              <><NavLink to="/" end>Overview</NavLink><NavLink to="/projects">Projects</NavLink></>}
          </nav>
        </div>
      </header>
      <main id="main" className={guest ? "auth-layout" : "workspace"}>
        {guest && <><p className="eyebrow">Your workspace</p><h1>{title}</h1><p className="muted">{description}</p></>}
        <Outlet />
      </main>
    </>
  );
}
