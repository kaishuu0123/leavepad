import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { AppState, Note, NoteEditorSettings } from '../types'

// Custom APIs for renderer
const api = {
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
