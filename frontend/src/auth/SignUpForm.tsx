import { useState, type FormEvent } from "react";
import { register } from "./auth";

type SignUpFormProps = {
    onNeedsConfirmation : (email: string) => void;
};

export default function SignUpForm({
    onNeedsConfirmation,
}: SignUpFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");

    setPending(true);
    setError("");
    setMessage("");

    try {
      const result = await register(email, password);

      if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        setMessage("Check your email for the confirmation code.");
        onNeedsConfirmation(email);
      } else if (result.nextStep.signUpStep === "DONE") {
        setMessage("Registration complete. You can now sign in.");
      } else {
        setMessage("An additional registration step is required.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        disabled={pending}
      />

      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        disabled={pending}
      />

      <button type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Sign Up"}
      </button>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </form>
  );
}
