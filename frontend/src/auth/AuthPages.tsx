import { Navigate, useLocation, useNavigate } from "react-router";
import ConfirmEmailForm from "./ConfirmEmailForm";
import ResetPasswordForm from "./ResetPasswordForm";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";

function emailFromState(state: unknown) {
  if (state && typeof state === "object" && "email" in state && typeof state.email === "string") {
    return state.email;
  }
  return "";
}

export function SignUpPage() {
  const navigate = useNavigate();

  return (
    <div>
      <SignUpForm onNeedsConfirmation={(email) => navigate("/confirm-email", { state: { email } })} />
      <button type="button" onClick={() => navigate("/signin")}>Already have an account? Sign in</button>
    </div>
  );
}

export function ConfirmEmailPage() {
  const navigate = useNavigate();
  const email = emailFromState(useLocation().state);

  if (!email) return <Navigate to="/signup" replace />;
  return <ConfirmEmailForm email={email} onConfirmed={() => navigate("/signin", { state: { email } })} />;
}

export function SignInPage({ onSignedIn }: { onSignedIn: () => void }) {
  const navigate = useNavigate();
  const email = emailFromState(useLocation().state);

  return (
    <SignInForm
      initialEmail={email}
      onSignedIn={() => {
        onSignedIn();
        navigate("/");
      }}
      onResetPassword={(nextEmail) => navigate("/reset-password", { state: { email: nextEmail } })}
    />
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const email = emailFromState(useLocation().state);

  if (!email) return <Navigate to="/signin" replace />;

  const backToSignIn = () => navigate("/signin", { state: { email } });
  
  return <ResetPasswordForm email={email} onReset={backToSignIn} onBackToSignIn={backToSignIn} />;
}
