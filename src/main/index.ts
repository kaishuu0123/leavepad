import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { registerIpcHandles } from './ipcHandles'
import { dbInstance } from './db_singleton'

let mainWindow: BrowserWindow

// Disable Application Menu when boot
Menu.setApplicationMenu(null)

function createWindow(): void {
  const appStateData = dbInstance.dbs.appStateDb.data

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: appStateData?.windowWidth != null ? appStateData?.windowWidth : 800,
    height: appStateData?.windowHeight != null ? appStateData?.windowHeight : 600,
    useContentSize: true,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  if (appStateData.windowX != null && appStateData.windowY != null) {
    mainWindow.setPosition(appStateData.windowX, appStateData.windowY, false)
  } else {
    mainWindow.center()
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('move', async () => {
    const bounds = mainWindow.getBounds()
    const appStateDb = dbInstance.dbs.appStateDb
    appStateDb.data.windowX = bounds.x
    appStateDb.data.windowY = bounds.y
    await appStateDb.write()
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
  electronApp.setAppUserModelId('me.saino.leavepad')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  registerIpcHandles(ipcMain, mainWindow)

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  await dbInstance.writeAllDbs()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
