import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@renderer/lib/utils'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import appIcon from '../../../../resources/icon.png'

type UpdateStatus = 'checking' | 'up-to-date' | 'available' | 'downloaded' | 'error'

const fontCredits = [
  {
    name: 'Geist Sans / Geist Mono',
    copyright: 'Copyright (c) 2023 Vercel, in collaboration with basement.studio',
    url: 'https://github.com/vercel/geist-font'
  },
  {
    name: '白源 (HackGen)',
    copyright: 'Copyright (c) 2019 Yuko OTAWARA',
    url: 'https://github.com/yuru7/HackGen'
  },
  {
    name: 'Noto Sans JP',
    copyright: 'Copyright 2014-2021 Adobe',
    url: 'https://fonts.google.com/noto/specimen/Noto+Sans+JP'
  },
  {
    name: 'NOTONOTO',
    copyright: 'Copyright (c) 2024 Yuko Otawara',
    url: 'https://github.com/yuru7/NOTONOTO'
  },
  {
    name: 'Noto Color Emoji',
    copyright: 'Copyright 2021 Google Inc.',
    url: 'https://fonts.google.com/noto/specimen/Noto+Color+Emoji'
  }
]

type AboutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  theme: 'light' | 'dark'
}

export const AboutDialog = ({ open, onOpenChange, theme }: AboutDialogProps) => {
  const { t } = useTranslation()
  const [version] = useState(() => window.api.getAppVersion())
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('checking')
  const [latestVersion, setLatestVersion] = useState('')
  const [isDevError, setIsDevError] = useState(false)

  useEffect(() => {
    if (!open) return

    window.api.checkForUpdates()

    const onChecking = () => setUpdateStatus('checking')
    const onNotAvailable = () => setUpdateStatus('up-to-date')
    const onAvailable = (_e, info: { version: string }) => {
      setUpdateStatus('available')
      setLatestVersion(info.version)
    }
    const onDownloaded = (_e, info: { version: string }) => {
      setUpdateStatus('downloaded')
      setLatestVersion(info.version)
    }
    const onError = (_e, msg: string) => {
      setIsDevError(msg === 'dev')
      setUpdateStatus('error')
    }

    window.electron.ipcRenderer.on('update-checking', onChecking)
    window.electron.ipcRenderer.on('update-not-available', onNotAvailable)
    window.electron.ipcRenderer.on('update-available', onAvailable)
    window.electron.ipcRenderer.on('update-downloaded', onDownloaded)
    window.electron.ipcRenderer.on('update-error', onError)

    return () => {
      window.electron.ipcRenderer.removeListener('update-checking', onChecking)
      window.electron.ipcRenderer.removeListener('update-not-available', onNotAvailable)
      window.electron.ipcRenderer.removeListener('update-available', onAvailable)
      window.electron.ipcRenderer.removeListener('update-downloaded', onDownloaded)
      window.electron.ipcRenderer.removeListener('update-error', onError)
    }
  }, [open])

  const renderUpdateStatus = () => {
    switch (updateStatus) {
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{t('about.checking')}</span>
          </div>
        )
      case 'up-to-date':
        return <p className="text-sm text-green-600">{t('about.upToDate')}</p>
      case 'available':
        return (
          <p className="text-sm text-blue-500">{t('about.available', { version: latestVersion })}</p>
        )
      case 'downloaded':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-green-600">{t('about.downloaded', { version: latestVersion })}</p>
            <Button size="sm" onClick={() => window.api.installUpdate()}>
              {t('restartAndUpdate')}
            </Button>
          </div>
        )
      case 'error':
        return (
          <p className="text-sm text-muted-foreground">
            {isDevError ? t('about.devError') : t('about.error')}
          </p>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('bg-background text-foreground max-w-sm', theme === 'dark' && 'dark')}
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>{t('about.title')}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-3">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3 pt-2">
            <img src={appIcon} className="w-20 h-20 rounded-2xl" alt="Leavepad" />
            <div className="text-center">
              <h2 className="text-xl font-semibold">Leavepad</h2>
              <p className="text-sm text-muted-foreground mt-1">Version {version}</p>
            </div>
            <div>{renderUpdateStatus()}</div>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{t('about.fontCredits')}</p>
            <div className="flex flex-col items-center gap-5">
              {fontCredits.map((font) => (
                <div key={font.name} className="text-center space-y-0.5">
                  <p className="text-sm font-semibold font-mono">{font.name}</p>
                  <p className="text-xs text-muted-foreground">{font.copyright}</p>
                  <p className="text-xs text-muted-foreground">SIL Open Font License 1.1</p>
                  <a
                    href={font.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-500 hover:underline"
                  >
                    {font.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
