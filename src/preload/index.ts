import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Note, NoteEditorSettings } from '../types'

// Custom APIs for renderer
const api = {
  getNotes: () => {
    return ipcRenderer.invoke('get-notes')
  },
  getNote: (noteId: string) => {
    return ipcRenderer.invoke('get-note', noteId)
  },
  createNote: async () => {
    const note = await ipcRenderer.invoke('create-note')
    return note
  },
  updateNote: (willUpdateNote: Note) => {
    return ipcRenderer.invoke('update-note', willUpdateNote)
  },
  deleteNote: (noteId: string) => {
    return ipcRenderer.invoke('delete-note', noteId)
  },
  updateSettings: (settings: NoteEditorSettings) => {
    ipcRenderer.invoke('update-settings', settings)
  },
  getSettings: () => {
    ipcRenderer.invoke('get-settings')
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
