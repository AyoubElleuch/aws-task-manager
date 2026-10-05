import { useState, type FormEvent } from "react";
import { finishPasswordReset, startPasswordReset } from "./auth";

type ResetPasswordFormProps = {
  email: string;
  onReset: () => void;
  onBackToSignIn: () => void;
};

export default function ResetPasswordForm({
  email,
  onReset,
  onBackToSignIn,
}: ResetPasswordFormProps) {
  const [step, setStep] = useState<"request" | "confirm">("request");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function requestCode(resend = false) {
    if (pending) return;
    setPending(true);
    setError("");
    setMessage("");

    try {
      const result = await startPasswordReset(email.trim());
      if (result.nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
        setStep("confirm");
        setMessage(resend ? "A new reset code was sent." : "Check your email for a reset code.");
      } else if (result.nextStep.resetPasswordStep === "DONE") {
        onReset();
      } else {
        setError("An additional password reset step is required.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send the reset code.");
    } finally {
      setPending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    if (step === "request") {
      await requestCode();
      return;
    }

    if (!code.trim()) {
      setError("Enter the reset code.");
      return;
    }

    setPending(true);
    setError("");
    setMessage("");

    try {
      await finishPasswordReset(email.trim(), code.trim(), newPassword);
      onReset();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not reset the password.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>Reset password for {email}</p>
      {step === "confirm" && (
        <>
          <label htmlFor="reset-code">Reset code</label>
          <input
            id="reset-code"
            type="text"
            autoComplete="one-time-code"
            required
            disabled={pending}
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            disabled={pending}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </>
      )}
      <button type="submit" disabled={pending}>
        {step === "request" ? "Send reset code" : "Reset password"}
      </button>
      {step === "confirm" && (
        <button type="button" onClick={() => void requestCode(true)} disabled={pending}>
          Resend code
        </button>
      )}
      <button type="button" onClick={onBackToSignIn} disabled={pending}>
        Back to sign in
      </button>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
    </form>
  );
}
