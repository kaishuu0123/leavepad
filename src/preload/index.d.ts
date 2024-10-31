import { ElectronAPI } from '@electron-toolkit/preload'
import { Note, NoteEditorSettings } from 'src/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getNotes: () => Promise<Note[]>
      getNote: (noteId: string) => Promise<Note | undefined>
      createNote: () => Promise<Note>
      updateNote: (willUpdateNote: Note) => Promise<Note | undefined>
      deleteNote: (noteId: string) => Promise<Note | undefined>
      updateSettings: (settings: NoteEditorSettings) => void
      getSettings: () => Promise<NoteEditorSettings>
    }
  }
}
