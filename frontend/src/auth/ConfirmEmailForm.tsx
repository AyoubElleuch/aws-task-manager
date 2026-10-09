import { useState, type FormEvent } from "react";
import { confirmRegistration, resendRegistrationCode } from "./auth";

type ConfirmEmailFormProps = {
  email: string;
  onConfirmed: () => void;
};

export default function ConfirmEmailForm({
  email,
  onConfirmed,
}: ConfirmEmailFormProps) {
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    if (!code.trim()) {
      setError("Enter your confirmation code.");
      setMessage("");
      return;
    }

    setPending(true);
    setError("");
    setMessage("");

    try {
      const result = await confirmRegistration(email, code.trim());

      if (result.isSignUpComplete && result.nextStep.signUpStep === "DONE") {
        onConfirmed();
      } else {
        setMessage("Confirmation step is not complete.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Confirmation failed.");
    } finally {
      setPending(false);
    }
  }

  async function handleResend() {
    if (pending) return;

    setPending(true);
    setError("");
    setMessage("");

    try {
      await resendRegistrationCode(email);
      setMessage("Confirmation code resent successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend confirmation code.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="confirmation-code">Confirmation code</label>
      <input
        id="confirmation-code"
        type="text"
        autoComplete="one-time-code"
        required
        disabled={pending}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Confirmation code"
      />
      <button type="submit" disabled={pending}>
        Confirm
      </button>
      <button type="button" onClick={handleResend} disabled={pending}>
        Resend Code
      </button>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </form>
  );
}
