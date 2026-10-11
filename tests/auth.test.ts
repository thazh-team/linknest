
import { describe, it, expect } from 'vitest'
import { normalizeUsername, isSafeUrl, RESERVED_USERNAMES } from '../src/lib/utils'

describe('username normalization', () => {
  it('lowercases and strips invalid', () => {
    expect(normalizeUsername('John_Doe!@')).toBe('john_doe')
  })
  it('limits to 30', () => {
    expect(normalizeUsername('a'.repeat(50)).length).toBe(30)
  })
})

describe('safe url validation', () => {
  it('allows https', () => { expect(isSafeUrl('https://example.com')).toBe(true) })
  it('rejects javascript', () => { expect(isSafeUrl('javascript:alert(1)')).toBe(false) })
  it('rejects data', () => { expect(isSafeUrl('data:text/html,hi')).toBe(false) })
})

describe('reserved usernames', () => {
  it('contains admin', () => { expect(RESERVED_USERNAMES.has('admin')).toBe(true) })
})
