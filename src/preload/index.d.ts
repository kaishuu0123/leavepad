import { ElectronAPI } from '@electron-toolkit/preload'
import { AppState, Note, NoteEditorSettings } from 'src/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getPathForFile: (file: File) => string
      openFileInEditor: (filePath: string) => void
      getNotes: () => Promise<Note[]>
      getNote: (noteId: string) => Promise<Note | undefined>
      createNote: () => Promise<Note>
      updateNote: (willUpdateNote: Note) => Promise<Note | undefined>
      deleteNote: (noteId: string) => Promise<Note | undefined>
      updateSettings: (settings: NoteEditorSettings) => void
      getSettings: () => Promise<NoteEditorSettings>
      getAppState: () => Promise<AppState>
      updateAppState: (appState: AppState) => void
    }
  }
}
