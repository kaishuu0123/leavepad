import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { getTime } from 'date-fns'
import { defaultNoteEditorSettings, Note, NoteEditorSettings } from '../types'
import { JSONFileSyncPreset } from 'lowdb/node'
import { uuidv7 } from 'uuidv7'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // width: 1024,
    // height: 768,
    width: 800,
    height: 600,
    useContentSize: true,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  const userDir = app.getPath('userData')
  const defaultData: Note[] = []
  const notesDb = JSONFileSyncPreset<Note[]>(path.join(userDir, 'notes.json'), defaultData)
  await notesDb.read()
  const settingsDb = JSONFileSyncPreset<NoteEditorSettings>(
    path.join(userDir, 'settings.json'),
    defaultNoteEditorSettings
  )
  await settingsDb.read()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

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

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
