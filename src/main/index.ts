import pkg from 'electron-updater'
const { autoUpdater } = pkg
import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import { registerIpcHandles } from './ipcHandles'
import { registerFileEditorIpcHandles } from './fileEditorIpcHandles'
import { registerFileEditorWindowHandlers } from './fileEditorWindow'
import { createFileEditorWindow } from './fileEditorWindow'
import { registerJsonFormatterWindowHandlers } from './jsonFormatterWindow'
import { dbInstance } from './db_singleton'

let mainWindow: BrowserWindow

const menuTranslations: Record<string, Record<string, string>> = {
  english: {
    file: 'File',
    newNote: 'New Note',
    fileEditor: 'File Editor',
    jsonFormatter: 'JSON Formatter',
    settings: 'Settings',
    edit: 'Edit',
    findInNotes: 'Find in Notes',
    findInEditor: 'Find in Editor',
    view: 'View',
    reload: 'Reload',
    forceReload: 'Force Reload',
    toggleDevTools: 'Toggle Developer Tools',
    help: 'Help',
    checkForUpdates: 'Check for Updates',
    about: 'About'
  },
  japanese: {
    file: 'ファイル',
    newNote: 'ノートを追加',
    fileEditor: 'ファイルエディタ',
    jsonFormatter: 'JSON Formatter',
    settings: 'グローバル設定',
    edit: '編集',
    findInNotes: 'ノートを検索',
    findInEditor: 'エディタ内を検索',
    view: '表示',
    reload: '再読み込み',
    forceReload: '強制再読み込み',
    toggleDevTools: '開発者ツール',
    help: 'ヘルプ',
    checkForUpdates: 'アップデートを確認',
    about: 'このアプリについて'
  }
}

function buildAppMenu(language: string = 'english'): void {
  const t = menuTranslations[language] ?? menuTranslations.english
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: t.file,
      submenu: [
        {
          label: t.newNote,
          accelerator: 'CmdOrCtrl+N',
          registerAccelerator: false,
          click: () => mainWindow.webContents.send('menu-new-note')
        },
        {
          label: t.fileEditor,
          click: () => createFileEditorWindow()
        },
        {
          label: t.jsonFormatter,
          accelerator: 'CmdOrCtrl+Shift+J',
          registerAccelerator: false,
          click: () => mainWindow.webContents.send('menu-open-json-formatter')
        },
        { type: 'separator' },
        {
          label: t.settings,
          accelerator: 'CmdOrCtrl+,',
          registerAccelerator: false,
          click: () => mainWindow.webContents.send('menu-open-settings')
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: t.edit,
      submenu: [
        {
          label: t.findInNotes,
          accelerator: 'CmdOrCtrl+Shift+F',
          registerAccelerator: false,
          click: () => mainWindow.webContents.send('menu-find-in-notes')
        },
        {
          label: t.findInEditor,
          accelerator: 'CmdOrCtrl+F',
          registerAccelerator: false,
          click: () => mainWindow.webContents.send('menu-find-in-editor')
        }
      ]
    },
    {
      label: t.view,
      submenu: [
        { role: 'reload', label: t.reload },
        { role: 'forceReload', label: t.forceReload },
        { role: 'toggleDevTools', label: t.toggleDevTools }
      ]
    },
    {
      label: t.help,
      submenu: [
        {
          label: t.checkForUpdates,
          click: () => mainWindow.webContents.send('menu-check-for-updates')
        },
        { type: 'separator' },
        {
          label: t.about,
          click: () => mainWindow.webContents.send('menu-about')
        }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

export function initAutoUpdater(mainWindow: BrowserWindow) {
  // 開発環境では動かさない
  if (!app.isPackaged) return

  autoUpdater.autoDownload = true // バックグラウンドで自動DL
  autoUpdater.autoInstallOnAppQuit = true // 終了時に自動インストール

  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('update-checking')
  })

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update-available', info)
  })

  autoUpdater.on('update-not-available', () => {
    mainWindow.webContents.send('update-not-available')
  })

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('update-downloaded', info)
  })

  autoUpdater.on('error', (err) => {
    console.error('AutoUpdater error:', err)
    mainWindow.webContents.send('update-error', err.message)
  })

  // 起動時にチェック
  autoUpdater.checkForUpdates()
}

function createWindow(): void {
  const appStateData = dbInstance.dbs.appStateDb.data

  const isNonMac = process.platform !== 'darwin'

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: appStateData?.windowWidth != null ? appStateData?.windowWidth : 800,
    height: appStateData?.windowHeight != null ? appStateData?.windowHeight : 600,
    useContentSize: true,
    show: false,
    autoHideMenuBar: true,
    frame: !isNonMac,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })

  if (isNonMac) {
    buildAppMenu()

    mainWindow.on('maximize', () => mainWindow.webContents.send('maximize-changed', true))
    mainWindow.on('unmaximize', () => mainWindow.webContents.send('maximize-changed', false))

    ipcMain.on('popup-application-menu', () => {
      Menu.getApplicationMenu()?.popup({ window: mainWindow })
    })
    ipcMain.on('minimize-window', () => mainWindow.minimize())
    ipcMain.on('maximize-window', () => {
      mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
    })
    ipcMain.on('close-window', () => mainWindow.close())
    ipcMain.handle('is-maximized', () => mainWindow.isMaximized())
    ipcMain.on('update-menu-language', (_, language: string) => buildAppMenu(language))
  }

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
    mainWindow.webContents.reloadIgnoringCache()
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

  // Register file editor IPC handlers
  registerFileEditorIpcHandles()
  registerFileEditorWindowHandlers()
  registerJsonFormatterWindowHandlers()

  createWindow()

  registerIpcHandles(ipcMain, mainWindow)

  initAutoUpdater(mainWindow)

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
