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
  | 'automaticLayout'
  | 'language'
  | 'insertSpaces'
  | 'minimap'
  | 'padding'
  | 'quickSuggestions'
  | 'renderWhitespace'
  | 'stickyScroll'
  | 'tabSize'
  | 'useTabStops'
  | 'fontFamily'
  | 'fontSize'
  | 'wordWrap'

export const defaultNoteEditorSettings: NoteEditorSettings = {
  language: 'english',
  themeName: 'light',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  editorOptions: {
    automaticLayout: true,
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
    stickyScroll: {
      enabled: false
    },
    tabSize: 2,
    useTabStops: false,
    wordWrap: 'off',
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
