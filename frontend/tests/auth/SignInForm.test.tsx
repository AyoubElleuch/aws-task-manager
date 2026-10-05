// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import SignInForm from '../../src/auth/SignInForm';
import { login } from '../../src/auth/auth';

vi.mock('../../src/auth/auth', () => ({ login: vi.fn() }));

test('routes Cognito password-reset responses without signing in', async () => {
  vi.mocked(login).mockResolvedValue({ isSignedIn: false, nextStep: { signInStep: 'RESET_PASSWORD' } });

  const onSignedIn = vi.fn();
  const onResetPassword = vi.fn();

  render(<SignInForm onSignedIn={onSignedIn} onResetPassword={onResetPassword} />);

  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'OldPassword123!' } });
  fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

  await vi.waitFor(() => expect(onResetPassword).toHaveBeenCalledWith('test@example.com'));
  expect(onSignedIn).not.toHaveBeenCalled();
});
