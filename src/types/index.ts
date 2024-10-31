import { type editor } from 'monaco-editor'

export type Note = {
  id: string
  name: string
  body: string
  createdAt: number
  updatedAt: number
}

export type NoteTab = {
  id: string
  name: string
}

export type CursorPosition = {
  line: number
  col: number
}

export type ConfigurableMonacoEditorOptions =
  | 'language'
  | 'insertSpaces'
  | 'minimap'
  | 'padding'
  | 'quickSuggestions'
  | 'renderWhitespace'
  | 'tabSize'
  | 'useTabStops'
  | 'fontFamily'
  | 'fontSize'

export const defaultNoteEditorSettings: NoteEditorSettings = {
  language: 'english',
  themeName: 'light',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  editorOptions: {
    language: 'plaintext',
    insertSpaces: true,
    minimap: {
      enabled: false
    },
    padding: {
      top: 5,
      bottom: 5
    },
    quickSuggestions: false,
    renderWhitespace: 'all',
    tabSize: 2,
    useTabStops: false,
    fontFamily:
      "Consolas, Menlo, Monaco, 'Courier New', 'Droid Sans Mono', 'monospace', monospace, 'Noto Sans JP', 'Noto Color Emoji'"
  }
}

export type NoteEditorSettings = {
  language: string
  themeName: 'light' | 'dark'
  sortBy: string
  sortOrder: string
  editorOptions: Pick<editor.IStandaloneEditorConstructionOptions, ConfigurableMonacoEditorOptions>
}
