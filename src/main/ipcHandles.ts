import { getTime } from 'date-fns'
import { uuidv7 } from 'uuidv7'

import { AppState, Note, NoteEditorSettings } from '../types'
import { dbInstance } from './db_singleton'

export const registerIpcHandles = (ipcMain): void => {
  const { notesDb, settingsDb, appStateDb } = dbInstance.dbs

  ipcMain.handle('get-notes', (): Note[] => {
    return notesDb.data
  })

  ipcMain.handle(
    'get-note',
    (_event: Electron.IpcMainInvokeEvent, noteId: string): Note | undefined => {
      const note = notesDb.data.find((note) => {
        note.id == noteId
      })

      return note
    }
  )

  ipcMain.handle('create-note', async () => {
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
  })

  ipcMain.handle(
    'update-note',
    async (_event: Electron.IpcMainInvokeEvent, willUpdateNote: Note) => {
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
    }
  )

  ipcMain.handle('delete-note', async (_event: Electron.IpcMainInvokeEvent, noteId: string) => {
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
  })

  ipcMain.handle(
    'update-settings',
    async (_event: Electron.IpcMainInvokeEvent, settings: NoteEditorSettings) => {
      settingsDb.data = settings
      await settingsDb.write()
    }
  )

  ipcMain.handle('get-settings', async (_event: Electron.IpcMainInvokeEvent) => {
    return settingsDb.data
  })

  ipcMain.handle('get-app-state', async (_event: Electron.IpcMainInvokeEvent) => {
    return appStateDb.data
  })

  ipcMain.handle(
    'update-app-state',
    async (_event: Electron.IpcMainInvokeEvent, appState: AppState) => {
      appStateDb.data = appState
      await appStateDb.write()
    }
  )
}
