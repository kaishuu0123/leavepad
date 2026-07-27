import pkg from 'electron-updater'
const { autoUpdater } = pkg
import { app } from 'electron'
import { getTime } from 'date-fns'
import { uuidv7 } from 'uuidv7'

import { AppState, Note, NoteEditorSettings } from '../types'
import { dbInstance, safeWrite } from './db_singleton'
import { BrowserWindow } from 'electron'

export const registerIpcHandles = (ipcMain, mainWindow: BrowserWindow): void => {
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
    await safeWrite(notesDb)

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

      await safeWrite(notesDb)

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

    await safeWrite(notesDb)

    return note
  })

  ipcMain.handle(
    'update-settings',
    async (_event: Electron.IpcMainInvokeEvent, settings: NoteEditorSettings) => {
      settingsDb.data = settings
      await safeWrite(settingsDb)
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
      const bounds = mainWindow.getBounds()

      appStateDb.data = {
        ...appState,
        windowX: bounds.x,
        windowY: bounds.y,
        windowWidth: bounds.width,
        windowHeight: bounds.height
      }

      await safeWrite(appStateDb)
    }
  )

  ipcMain.handle(
    'json-formatter:save-as-note',
    async (_event: Electron.IpcMainInvokeEvent, content: string) => {
      const note: Note = {
        id: uuidv7(),
        name: `JSON ${new Date().toLocaleString()}`,
        body: content,
        createdAt: getTime(new Date()),
        updatedAt: getTime(new Date())
      }
      notesDb.data.push(note)
      await safeWrite(notesDb)

      // Notify main window to refresh notes list
      if (!mainWindow.isDestroyed()) {
        mainWindow.webContents.send('note-list-updated')
      }

      return note
    }
  )

  ipcMain.handle('delete-all-notes', async () => {
    notesDb.data = []
    await safeWrite(notesDb)
  })

  ipcMain.handle(
    'import-notes',
    async (_event: Electron.IpcMainInvokeEvent, importedNotes: Note[]) => {
      const newNotes: Note[] = importedNotes.map((note) => ({
        id: uuidv7(),
        name: note.name || 'Imported Note',
        body: note.body || '',
        createdAt: note.createdAt || getTime(new Date()),
        updatedAt: note.updatedAt || getTime(new Date()),
        ...(note.language ? { language: note.language } : {})
      }))

      notesDb.data.push(...newNotes)
      await safeWrite(notesDb)

      return notesDb.data
    }
  )

  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall()
  })

  ipcMain.on('get-app-version', (event) => {
    event.returnValue = app.getVersion()
  })

  // Trigger update check from renderer (e.g. About tab)
  ipcMain.on('check-for-updates-now', () => {
    if (!app.isPackaged) {
      mainWindow.webContents.send('update-error', 'dev')
      return
    }
    autoUpdater.checkForUpdates()
  })
}
