import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    jsonFormatterApi: {
      getSettings: () => Promise<{ language?: string; themeName?: string }>
      saveAsNote: (content: string) => Promise<void>
    }
  }
}
