import { dialog, BrowserWindow, ipcMain } from 'electron'
import { readFile, writeFile } from 'fs/promises'
import { basename } from 'path'
import { FileInfo } from '../types'

export const registerFileEditorIpcHandles = (): void => {
  // Open file dialog
  ipcMain.handle(
    'file-editor:open-dialog',
    async (_event: Electron.IpcMainInvokeEvent): Promise<FileInfo | null> => {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      const result = await dialog.showOpenDialog(focusedWindow!, {
        properties: ['openFile'],
        filters: [
          { name: 'All Files', extensions: ['*'] },
          {
            name: 'Text Files',
            extensions: [
              'txt',
              'md',
              'json',
              'js',
              'ts',
              'tsx',
              'jsx',
              'html',
              'css',
              'scss',
              'less',
              'py',
              'go',
              'rs',
              'java',
              'c',
              'cpp',
              'h',
              'hpp',
              'xml',
              'yaml',
              'yml',
              'toml',
              'ini',
              'conf',
              'sh',
              'bash',
              'zsh',
              'fish',
              'ps1',
              'bat',
              'cmd'
            ]
          }
        ]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return null
      }

      const filePath = result.filePaths[0]
      const content = await readFile(filePath, 'utf-8')
      const fileName = basename(filePath)

      return { filePath, fileName, content }
    }
  )

  // Read file
  ipcMain.handle(
    'file-editor:read-file',
    async (_event: Electron.IpcMainInvokeEvent, filePath: string): Promise<FileInfo> => {
      const content = await readFile(filePath, 'utf-8')
      const fileName = basename(filePath)
      return { filePath, fileName, content }
    }
  )

  // Write file
  ipcMain.handle(
    'file-editor:write-file',
    async (
      _event: Electron.IpcMainInvokeEvent,
      filePath: string,
      content: string
    ): Promise<void> => {
      await writeFile(filePath, content, 'utf-8')
    }
  )

  // Save dialog (Save As)
  ipcMain.handle(
    'file-editor:save-dialog',
    async (
      _event: Electron.IpcMainInvokeEvent,
      defaultFileName?: string
    ): Promise<string | null> => {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      const result = await dialog.showSaveDialog(focusedWindow!, {
        defaultPath: defaultFileName,
        filters: [
          { name: 'All Files', extensions: ['*'] },
          {
            name: 'Text Files',
            extensions: ['txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'py', 'go']
          }
        ]
      })

      if (result.canceled || !result.filePath) {
        return null
      }

      return result.filePath
    }
  )

  // Confirm unsaved changes dialog
  ipcMain.handle(
    'file-editor:confirm-close',
    async (
      _event: Electron.IpcMainInvokeEvent,
      fileName: string
    ): Promise<'save' | 'discard' | 'cancel'> => {
      const focusedWindow = BrowserWindow.getFocusedWindow()
      const result = await dialog.showMessageBox(focusedWindow!, {
        type: 'question',
        buttons: ['Save', "Don't Save", 'Cancel'],
        defaultId: 0,
        cancelId: 2,
        title: 'Unsaved Changes',
        message: `Do you want to save the changes to "${fileName}"?`,
        detail: "Your changes will be lost if you don't save them."
      })

      switch (result.response) {
        case 0:
          return 'save'
        case 1:
          return 'discard'
        default:
          return 'cancel'
      }
    }
  )
}
