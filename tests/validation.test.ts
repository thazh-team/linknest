
import { describe, it, expect } from 'vitest'
import { usernameSchema, linkSchema } from '../src/lib/validation'

describe('username schema', () => {
  it('rejects short', () => { expect(usernameSchema.safeParse('ab').success).toBe(false) })
  it('accepts valid', () => { expect(usernameSchema.safeParse('john_doe').success).toBe(true) })
})

describe('link schema', () => {
  it('rejects unsafe url', () => {
    expect(linkSchema.safeParse({ title: 'test', url: 'javascript:alert(1)' }).success).toBe(false)
  })
  it('accepts https', () => {
    expect(linkSchema.safeParse({ title: 'test', url: 'https://example.com' }).success).toBe(true)
  })
})
