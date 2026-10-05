import { useState, type FormEvent } from "react";
import { login } from "./auth";

type SignInFormProps = {
  initialEmail?: string;
  onSignedIn: () => void;
  onResetPassword: (email: string) => void;
};

export default function SignInForm({
  initialEmail = "",
  onSignedIn,
  onResetPassword,
}: SignInFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    setPending(true);
    setError("");
    setMessage("");

    try {
      const result = await login(email.trim(), password);

      if (result.isSignedIn && result.nextStep.signInStep === "DONE") {
        onSignedIn();
      } else if (result.nextStep.signInStep === "RESET_PASSWORD") {
        onResetPassword(email.trim());
      } else {
        setMessage("Sign in step is not complete.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setPending(false);
    }
  }

  function handleForgotPassword() {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    onResetPassword(email.trim());
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        autoComplete="email"
        required
        disabled={pending}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        required
        disabled={pending}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit" disabled={pending}>
        Sign In
      </button>
      <button type="button" onClick={handleForgotPassword} disabled={pending}>
        Forgot password?
      </button>
      {error && (
        <p role="alert" style={{ color: "red" }}>
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
    </form>
  );
}
