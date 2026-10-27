import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for JSON formatter renderer
const jsonFormatterApi = {
  // Get app settings (for locale etc.)
  getSettings: (): Promise<{ language?: string; themeName?: string }> => {
    return ipcRenderer.invoke('get-settings')
  },

  // Save JSON content as a new note in Note Editor
  saveAsNote: (content: string): Promise<void> => {
    return ipcRenderer.invoke('json-formatter:save-as-note', content)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('jsonFormatterApi', jsonFormatterApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-expect-error (define in dts)
  window.electron = electronAPI
  // @ts-expect-error (define in dts)
  window.jsonFormatterApi = jsonFormatterApi
}
