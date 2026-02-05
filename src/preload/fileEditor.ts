import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { FileInfo } from '../types'

// Custom APIs for file editor renderer
const fileEditorApi = {
  // Get file path from dropped file (for drag & drop)
  getPathForFile: (file: File): string => {
    return webUtils.getPathForFile(file)
  },
  // Open file dialog and return file info
  openFileDialog: (): Promise<FileInfo | null> => {
    return ipcRenderer.invoke('file-editor:open-dialog')
  },

  // Read file from path
  readFile: (filePath: string): Promise<FileInfo> => {
    return ipcRenderer.invoke('file-editor:read-file', filePath)
  },

  // Write file to path
  writeFile: (filePath: string, content: string): Promise<void> => {
    return ipcRenderer.invoke('file-editor:write-file', filePath, content)
  },

  // Show save dialog (Save As)
  saveDialog: (defaultFileName?: string): Promise<string | null> => {
    return ipcRenderer.invoke('file-editor:save-dialog', defaultFileName)
  },

  // Confirm unsaved changes dialog
  confirmClose: (fileName: string): Promise<'save' | 'discard' | 'cancel'> => {
    return ipcRenderer.invoke('file-editor:confirm-close', fileName)
  },

  // Notify main process that close is confirmed
  confirmCloseComplete: (): void => {
    ipcRenderer.send('file-editor:confirm-close-complete')
  },

  // Notify main process that close is cancelled
  cancelClose: (): void => {
    ipcRenderer.send('file-editor:cancel-close')
  },

  // Update window title
  updateTitle: (title: string): void => {
    ipcRenderer.send('file-editor:update-title', title)
  },

  // Listen for request to close window (to check unsaved changes)
  onRequestClose: (callback: () => void): (() => void) => {
    const listener = (): void => {
      callback()
    }
    ipcRenderer.on('file-editor:request-close', listener)
    return () => {
      ipcRenderer.removeListener('file-editor:request-close', listener)
    }
  },

  // Listen for file path to open (from menu)
  onOpenFilePath: (callback: (filePath: string) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, filePath: string): void => {
      callback(filePath)
    }
    ipcRenderer.on('file-editor:open-file-path', listener)
    return () => {
      ipcRenderer.removeListener('file-editor:open-file-path', listener)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('fileEditorApi', fileEditorApi)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.fileEditorApi = fileEditorApi
}
