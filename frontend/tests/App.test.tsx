// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from '../src/App'
import { getSession, logout } from '../src/auth/auth'

vi.mock('../src/auth/auth')

beforeEach(() => {
  window.history.replaceState(null, '', '/')
  vi.resetAllMocks()
  vi.mocked(getSession).mockResolvedValue({ tokens: undefined } as Awaited<ReturnType<typeof getSession>>)
})

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

test('shows signup without a session', async () => {
  render(<App />)
  expect(await screen.findByRole('button', { name: 'Sign Up' })).toBeDefined()
  expect(window.location.hash).toBe('#/signup')
})

test('restores a session, calls /me with its access token, and signs out', async () => {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test')
  vi.mocked(getSession).mockResolvedValue({
    tokens: { accessToken: { toString: () => 'access-token' } },
  } as unknown as Awaited<ReturnType<typeof getSession>>)

  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ sub: 'user-123' }) })

  vi.stubGlobal('fetch', fetchMock)
  vi.mocked(logout).mockResolvedValue()

  render(<App />)
  expect(await screen.findByText('User ID: user-123')).toBeDefined()
  expect(fetchMock).toHaveBeenCalledWith('https://api.example.test/me', {
    headers: { Authorization: 'Bearer access-token' },
  })
  
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
  expect(await screen.findByRole('button', { name: 'Sign In' })).toBeDefined()
})
