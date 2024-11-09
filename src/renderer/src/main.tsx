import './assets/index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createStore, Provider } from 'jotai'
import {
  AppState,
  defaultAppState,
  defaultNoteEditorSettings,
  Note,
  NoteEditorSettings
} from '../../types'
import { LowSync } from 'lowdb'
import { LocalStorage } from 'lowdb/browser'
import { uuidv7 } from 'uuidv7'
import { getTime } from 'date-fns'
import './i18n/configs'

export const leavepadStore: ReturnType<typeof createStore> = createStore()

// Probably browser mode (not electron)
if (window.api === undefined) {
  const notesDb = new LowSync(new LocalStorage<Note[]>('leavepad-notes'), [])
  notesDb.read()
  const settingsDb = new LowSync(
    new LocalStorage<NoteEditorSettings>('leavepad-notes-settings'),
    defaultNoteEditorSettings
  )
  settingsDb.read()
  const appStateDb = new LowSync(new LocalStorage<AppState>('leavepad-app-state'), defaultAppState)
  appStateDb.read()

  window.api = {
    getNotes: async (): Promise<Note[]> => {
      return notesDb.data
    },
    getNote: async (noteId: string): Promise<Note | undefined> => {
      const note = notesDb.data.find((note) => note.id === noteId)
      return note
    },
    createNote: async (): Promise<Note> => {
      const note: Note = {
        id: uuidv7(),
        name: `No Name ${notesDb.data.length + 1}`,
        body: '',
        createdAt: getTime(new Date()),
        updatedAt: getTime(new Date())
      }
      notesDb.data.push(note)
      await notesDb.write()

      return note
    },
    updateNote: async (willUpdateNote: Note): Promise<Note | undefined> => {
      const note = notesDb.data.find((note) => {
        note.id === willUpdateNote.id
      })

      const newNotes = notesDb.data.map((note) => {
        if (note.id === willUpdateNote.id) {
          return { ...note, ...willUpdateNote }
        } else {
          return note
        }
      })

      notesDb.data = newNotes

      await notesDb.write()

      return note
    },
    deleteNote: async (noteId: string): Promise<Note | undefined> => {
      const note = notesDb.data.find((note) => {
        note.id === noteId
      })

      const newNotes = notesDb.data
        .map((note) => {
          if (note.id === noteId) {
            return undefined
          } else {
            return note
          }
        })
        .filter((note) => note != null)

      notesDb.data = newNotes

      await notesDb.write()

      return note
    },
    getSettings: async () => {
      return settingsDb.data
    },
    updateSettings: async (settings: NoteEditorSettings) => {
      settingsDb.data = settings
      await settingsDb.write()
    },
    getAppState: async () => {
      return appStateDb.data
    },
    updateAppState: async (appState: AppState) => {
      appStateDb.data = appState
      await appStateDb.write()
    }
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={leavepadStore}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
)
