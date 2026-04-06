import { BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let jsonFormatterWindow: BrowserWindow | null = null

export function createJsonFormatterWindow(): BrowserWindow {
  // If window already exists, focus it
  if (jsonFormatterWindow && !jsonFormatterWindow.isDestroyed()) {
    jsonFormatterWindow.focus()
    return jsonFormatterWindow
  }

  jsonFormatterWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 400,
    useContentSize: true,
    show: false,
    autoHideMenuBar: true,
    title: 'JSON Formatter - Leavepad',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/jsonFormatter.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  jsonFormatterWindow.center()

  jsonFormatterWindow.on('ready-to-show', () => {
    jsonFormatterWindow?.show()
  })

  jsonFormatterWindow.on('closed', () => {
    jsonFormatterWindow = null
  })

  // Load the JSON formatter renderer
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    const devUrl = process.env['ELECTRON_RENDERER_URL'].replace(/\/$/, '')
    jsonFormatterWindow.loadURL(`${devUrl}/json-formatter/index.html`)
  } else {
    jsonFormatterWindow.loadFile(join(__dirname, '../renderer/json-formatter/index.html'))
  }

  return jsonFormatterWindow
}

export function getJsonFormatterWindow(): BrowserWindow | null {
  return jsonFormatterWindow
}

export function registerJsonFormatterWindowHandlers(): void {
  ipcMain.on('open-json-formatter', () => {
    createJsonFormatterWindow()
  })
}
