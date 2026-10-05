// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import ConfirmEmailForm from '../../src/auth/ConfirmEmailForm';
import { confirmRegistration, resendRegistrationCode } from '../../src/auth/auth';

vi.mock('../../src/auth/auth', () => ({
  confirmRegistration: vi.fn(),
  resendRegistrationCode: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

test('resends a code and prevents overlapping requests', async () => {

  let finish!: () => void;

  vi.mocked(resendRegistrationCode).mockImplementation(() => new Promise(resolve => {
    finish = () => resolve({ destination: 'test@example.com', deliveryMedium: 'EMAIL', attributeName: 'email' });
  }));

  render(<ConfirmEmailForm email="test@example.com" onConfirmed={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Resend Code' }));
  
  expect((screen.getByRole('button', { name: 'Confirm' }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Resend Code' }));

  expect(resendRegistrationCode).toHaveBeenCalledTimes(1);
  expect(resendRegistrationCode).toHaveBeenCalledWith('test@example.com');
  finish();
  expect((await screen.findByRole('status')).textContent).toBe('Confirmation code resent successfully.');
});

test('catches resend failures and allows retrying', async () => {
  vi.mocked(resendRegistrationCode).mockRejectedValueOnce(new Error('Please try again'));

  render(<ConfirmEmailForm email="test@example.com" onConfirmed={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Resend Code' }));
  expect((await screen.findByRole('alert')).textContent).toBe('Please try again');
  expect((screen.getByRole('button', { name: 'Resend Code' }) as HTMLButtonElement).disabled).toBe(false);
});

test('confirms using the trimmed code', async () => {
  vi.mocked(confirmRegistration).mockResolvedValue({ isSignUpComplete: true, nextStep: { signUpStep: 'DONE' } });

  const onConfirmed = vi.fn();

  render(<ConfirmEmailForm email="test@example.com" onConfirmed={onConfirmed} />);
  fireEvent.change(screen.getByLabelText('Confirmation code'), { target: { value: ' 123456 ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

  await vi.waitFor(() => expect(onConfirmed).toHaveBeenCalledOnce());
  expect(confirmRegistration).toHaveBeenCalledWith('test@example.com', '123456');
});
