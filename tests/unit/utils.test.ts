import { describe, expect, it } from 'vitest'
import { generateSlug, formatPrice } from '../../lib/utils'

describe('generateSlug', () => {
	it('lowercases and trims ASCII strings', () => {
		expect(generateSlug('  Hello World ')).toBe('hello-world')
	})

	it('removes special characters', () => {
		expect(generateSlug('Hello!!! ###')).toBe('hello')
	})

	it('caps length at 100 chars', () => {
		const long = 'a'.repeat(150)
		expect(generateSlug(long).length).toBe(100)
	})
})

describe('formatPrice', () => {
	it('formats USD by default', () => {
		expect(formatPrice(1234.5)).toBe('$1,234.50')
	})

	it('supports other currencies', () => {
		expect(formatPrice(99, 'GEL')).toContain('GEL')
	})
})


