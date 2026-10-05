// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import ResetPasswordForm from '../../src/auth/ResetPasswordForm';
import { finishPasswordReset, startPasswordReset } from '../../src/auth/auth';

vi.mock('../../src/auth/auth', () => ({
  startPasswordReset: vi.fn(),
  finishPasswordReset: vi.fn(),
}));

test('requests a code and resets the password with it', async () => {
  vi.mocked(startPasswordReset).mockResolvedValue({
    isPasswordReset: false,
    nextStep: {
      resetPasswordStep: 'CONFIRM_RESET_PASSWORD_WITH_CODE',
      codeDeliveryDetails: {
        deliveryMedium: 'EMAIL',
        destination: 'test@example.com',
        attributeName: 'email',
      },
    },
  });

  const onReset = vi.fn();

  render(<ResetPasswordForm email="test@example.com" onReset={onReset} onBackToSignIn={vi.fn()} />);

  fireEvent.click(screen.getByRole('button', { name: 'Send reset code' }));
  fireEvent.change(await screen.findByLabelText('Reset code'), { target: { value: '123456' } });
  fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'NewPassword123!' } });
  fireEvent.click(screen.getByRole('button', { name: 'Reset password' }));

  await vi.waitFor(() => expect(onReset).toHaveBeenCalledOnce());
  expect(startPasswordReset).toHaveBeenCalledWith('test@example.com');
  expect(finishPasswordReset).toHaveBeenCalledWith('test@example.com', '123456', 'NewPassword123!');
});
