import { BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let fileEditorWindow: BrowserWindow | null = null

export function createFileEditorWindow(filePath?: string): BrowserWindow {
  // If window already exists, focus it and optionally open new file
  if (fileEditorWindow && !fileEditorWindow.isDestroyed()) {
    fileEditorWindow.focus()
    if (filePath) {
      fileEditorWindow.webContents.send('file-editor:open-file-path', filePath)
    }
    return fileEditorWindow
  }

  fileEditorWindow = new BrowserWindow({
    width: 800,
    height: 600,
    useContentSize: true,
    show: false,
    autoHideMenuBar: true,
    title: 'File Editor - Leavepad',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/fileEditor.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  fileEditorWindow.center()

  fileEditorWindow.on('ready-to-show', () => {
    fileEditorWindow?.show()
    // If a file path was provided, send it to the renderer after the window is ready
    if (filePath) {
      // Wait a bit for React to initialize
      setTimeout(() => {
        fileEditorWindow?.webContents.send('file-editor:open-file-path', filePath)
      }, 100)
    }
  })

  fileEditorWindow.on('closed', () => {
    fileEditorWindow = null
  })

  // Handle close with unsaved changes
  fileEditorWindow.on('close', async (e) => {
    if (fileEditorWindow) {
      e.preventDefault()
      fileEditorWindow.webContents.send('file-editor:request-close')
    }
  })

  // Load the file editor renderer
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    const devUrl = process.env['ELECTRON_RENDERER_URL'].replace(/\/$/, '')
    fileEditorWindow.loadURL(`${devUrl}/file-editor/index.html`)
  } else {
    fileEditorWindow.loadFile(join(__dirname, '../renderer/file-editor/index.html'))
  }

  return fileEditorWindow
}

export function getFileEditorWindow(): BrowserWindow | null {
  return fileEditorWindow
}

// IPC handler for confirming close from renderer
export function registerFileEditorWindowHandlers(): void {
  ipcMain.on('file-editor:confirm-close-complete', () => {
    if (fileEditorWindow) {
      fileEditorWindow.removeAllListeners('close')
      fileEditorWindow.close()
      fileEditorWindow = null
    }
  })

  ipcMain.on('file-editor:cancel-close', () => {
    // Do nothing, user cancelled the close
  })

  ipcMain.on('file-editor:update-title', (_event, title: string) => {
    if (fileEditorWindow && !fileEditorWindow.isDestroyed()) {
      fileEditorWindow.setTitle(title)
    }
  })

  // Open file in editor from main window (drag & drop)
  ipcMain.on('open-file-in-editor', (_event, filePath: string) => {
    createFileEditorWindow(filePath)
  })
}
