import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { AppState, Note, NoteEditorSettings } from '../types'

// Custom APIs for renderer
const api = {
  // Get file path from dropped file (for drag & drop)
  getPathForFile: (file: File): string => {
    return webUtils.getPathForFile(file)
  },
  // Open file in file editor window
  openFileInEditor: (filePath: string): void => {
    ipcRenderer.send('open-file-in-editor', filePath)
  },
  // Open JSON Formatter window
  openJsonFormatter: (): void => {
    ipcRenderer.send('open-json-formatter')
  },
  getNotes: (): Promise<Note[]> => {
    return ipcRenderer.invoke('get-notes')
  },
  getNote: (noteId: string): Promise<Note> => {
    return ipcRenderer.invoke('get-note', noteId)
  },
  createNote: async (): Promise<Note> => {
    const note = await ipcRenderer.invoke('create-note')
    return note
  },
  updateNote: (willUpdateNote: Note): Promise<Note> => {
    return ipcRenderer.invoke('update-note', willUpdateNote)
  },
  deleteNote: (noteId: string): Promise<void> => {
    return ipcRenderer.invoke('delete-note', noteId)
  },
  updateSettings: (settings: NoteEditorSettings): Promise<void> => {
    return ipcRenderer.invoke('update-settings', settings)
  },
  getSettings: (): Promise<NoteEditorSettings> => {
    return ipcRenderer.invoke('get-settings')
  },
  getAppState: (): Promise<AppState> => {
    return ipcRenderer.invoke('get-app-state')
  },
  updateAppState: (appState: AppState): Promise<void> => {
    return ipcRenderer.invoke('update-app-state', appState)
  },
  installUpdate: (): void => {
    ipcRenderer.send('install-update')
  },
  getAppVersion: (): string => {
    return ipcRenderer.sendSync('get-app-version')
  },
  checkForUpdates: (): void => {
    ipcRenderer.send('check-for-updates-now')
  },
  popupMenu: (): void => {
    ipcRenderer.send('popup-application-menu')
  },
  minimizeWindow: (): void => {
    ipcRenderer.send('minimize-window')
  },
  maximizeWindow: (): void => {
    ipcRenderer.send('maximize-window')
  },
  closeWindow: (): void => {
    ipcRenderer.send('close-window')
  },
  isMaximized: (): Promise<boolean> => {
    return ipcRenderer.invoke('is-maximized')
  },
  onMaximizeChange: (cb: (maximized: boolean) => void): void => {
    ipcRenderer.on('maximize-changed', (_event, value: boolean) => cb(value))
  },
  updateMenuLanguage: (language: string): void => {
    ipcRenderer.send('update-menu-language', language)
  },
  importNotes: (notes: Note[]): Promise<Note[]> => {
    return ipcRenderer.invoke('import-notes', notes)
  },
  deleteAllNotes: (): Promise<void> => {
    return ipcRenderer.invoke('delete-all-notes')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
