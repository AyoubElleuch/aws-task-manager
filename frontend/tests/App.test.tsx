// @vitest-environment jsdom

import { render } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from '../src/App'

test('renders an empty app', () => {
  const { container } = render(<App />)
  expect(container.innerHTML).toBe('')
})
