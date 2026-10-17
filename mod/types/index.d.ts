export type SelectorKey = 'model' | 'effort' | 'caveman' | 'ponytail'

// open: el selector desplegado; effort: el último que confirmó Claude Code; tests: el último resultado de la sesión.
export type Row = { open: SelectorKey | null; effort: string; tests: 'passed' | 'failed' | null }

declare module 'claude-code' {
  interface PluginState {
    'statusline-controls': { row: Row }
  }
}
