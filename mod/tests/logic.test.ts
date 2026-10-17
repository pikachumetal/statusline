import { describe, expect, test } from 'claude-code/testing'

import { CAVEMAN_FLAGS, PONYTAIL_FLAGS, costText, flagValue, modelName } from '../hooks/logic'

describe('modelName', () => {
  test('turns a model id into its short name', () => {
    expect(modelName('claude-opus-5-5')).toBe('Opus 5.5')
    expect(modelName('claude-sonnet-5-5')).toBe('Sonnet 5.5')
    expect(modelName('claude-haiku-4-5-20251001')).toBe('Haiku 4.5')
  })

  test('leaves an id it does not recognise as it is', () => {
    expect(modelName('gpt-x')).toBe('gpt-x')
  })
})

describe('costText', () => {
  test('adds the hourly rate from five minutes on', () => {
    expect(costText(7.5, 0, 30 * 60000)).toBe('$7.50 · $15.00/h')
  })

  test('shows no rate before five minutes', () => {
    expect(costText(0.4, 0, 4 * 60000)).toBe('$0.40')
  })

  test('shows no rate with zero cost', () => {
    expect(costText(0, 0, 30 * 60000)).toBe('$0.00')
  })
})

describe('flagValue', () => {
  test('a missing flag is off', () => {
    expect(flagValue(undefined, CAVEMAN_FLAGS)).toBe('off')
  })

  test('a whitelisted value is kept, trimmed', () => {
    expect(flagValue('lite\n', PONYTAIL_FLAGS)).toBe('lite')
  })

  test('a value outside the whitelist is off', () => {
    expect(flagValue('hacked', PONYTAIL_FLAGS)).toBe('off')
  })

  test('a flag over 64 bytes is off', () => {
    expect(flagValue('full'.padEnd(65, ' '), PONYTAIL_FLAGS)).toBe('off')
  })
})
