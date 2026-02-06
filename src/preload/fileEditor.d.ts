import { ElectronAPI } from '@electron-toolkit/preload'
import { FileInfo } from 'src/types'

declare global {
  interface Window {
    electron: ElectronAPI
    fileEditorApi: {
      getPathForFile: (file: File) => string
      openFileDialog: () => Promise<FileInfo | null>
      readFile: (filePath: string) => Promise<FileInfo>
      writeFile: (filePath: string, content: string) => Promise<void>
      saveDialog: (defaultFileName?: string) => Promise<string | null>
      confirmClose: (fileName: string) => Promise<'save' | 'discard' | 'cancel'>
      confirmCloseComplete: () => void
      cancelClose: () => void
      updateTitle: (title: string) => void
      onRequestClose: (callback: () => void) => () => void
      onOpenFilePath: (callback: (filePath: string) => void) => () => void
    }
  }
}
