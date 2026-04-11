import { ElectronAPI } from '@electron-toolkit/preload'
import { AppState, Note, NoteEditorSettings } from 'src/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getPathForFile: (file: File) => string
      openFileInEditor: (filePath: string) => void
      openJsonFormatter: () => void
      getNotes: () => Promise<Note[]>
      getNote: (noteId: string) => Promise<Note | undefined>
      createNote: () => Promise<Note>
      updateNote: (willUpdateNote: Note) => Promise<Note | undefined>
      deleteNote: (noteId: string) => Promise<Note | undefined>
      updateSettings: (settings: NoteEditorSettings) => void
      getSettings: () => Promise<NoteEditorSettings>
      getAppState: () => Promise<AppState>
      updateAppState: (appState: AppState) => void
      installUpdate: () => void
      getAppVersion: () => string
      checkForUpdates: () => void
      popupMenu: () => void
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      isMaximized: () => Promise<boolean>
      onMaximizeChange: (cb: (maximized: boolean) => void) => void
      updateMenuLanguage: (language: string) => void
      importNotes: (notes: Note[]) => Promise<Note[]>
      deleteAllNotes: () => Promise<void>
    }
  }
}
