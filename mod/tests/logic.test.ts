import { describe, expect, test } from 'claude-code/testing'

import { CAVEMAN_FLAGS, PONYTAIL_FLAGS, boardPath, confirmedEffort, costText, firstLine, flagValue, isTestCommand, modelName } from '../hooks/logic'

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

describe('confirmedEffort', () => {
  test('reads the level Claude Code set', () => {
    expect(confirmedEffort('Set effort level to high (saved as your default for new sessions): x')).toBe('high')
  })

  test('is undefined when Claude Code kept the old level', () => {
    expect(confirmedEffort('Kept effort level as medium')).toBeUndefined()
  })
})

describe('firstLine', () => {
  test('takes the first non-empty line', () => {
    expect(firstLine('\nSet model to `Sonnet 5.5`\nmore')).toBe('Set model to `Sonnet 5.5`')
  })

  test('says ok for an empty response', () => {
    expect(firstLine('')).toBe('ok')
  })

  test('cuts at 80 characters', () => {
    expect(firstLine('x'.repeat(100)).length).toBe(80)
  })
})

describe('isTestCommand', () => {
  test('recognises test runs, also inside a compound command', () => {
    for (const command of ['node statusline.test.js', 'npm test', 'git add . && node statusline.test.js', 'Invoke-Pester -CI', 'cd api && python -m pytest -q'])
      expect(isTestCommand(command)).toBe(true)
  })

  test('ignores commands that are not tests', () => {
    for (const command of ['git status', 'npm install', 'node statusline.js']) expect(isTestCommand(command)).toBe(false)
  })
})

describe('boardPath', () => {
  test('uses ~/.config under HOME', () => {
    expect(boardPath({ HOME: '/home/u' })).toBe('/home/u/.config/ponytail/band/board.html')
  })

  test('uses USERPROFILE on Windows', () => {
    expect(boardPath({ USERPROFILE: 'C:\\Users\\u' }).replaceAll('\\', '/')).toBe('C:/Users/u/.config/ponytail/band/board.html')
  })

  test('XDG_CONFIG_HOME wins', () => {
    const path = boardPath({ XDG_CONFIG_HOME: 'D:\\cfg', HOME: '/home/u' }).replaceAll('\\', '/')
    expect(path).toBe('D:/cfg/ponytail/band/board.html')
  })
})
