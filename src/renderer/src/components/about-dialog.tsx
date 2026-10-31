import { cn } from '@renderer/lib/utils'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import appIcon from '../../../../resources/icon.png'
import type { UpdateState } from '../../../types'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'

const fontCredits = [
  {
    name: 'Geist Sans / Geist Mono',
    copyright: 'Copyright (c) 2023 vercel',
    url: 'https://github.com/vercel/geist-font'
  },
  {
    name: '白源 (HackGen)',
    copyright: 'Copyright (c) 2019 yuru7',
    url: 'https://github.com/yuru7/HackGen'
  },
  {
    name: 'NOTONOTO',
    copyright: 'Copyright (c) 2024 yuru7',
    url: 'https://github.com/yuru7/NOTONOTO'
  },
  {
    name: 'Moralerspace HWJPDOC Neon',
    copyright: 'Copyright (c) 2023 yuru7',
    url: 'https://github.com/yuru7/moralerspace'
  },
  {
    name: 'M PLUS 1 Code',
    copyright: 'Copyright 2021 coz-m',
    url: 'https://github.com/coz-m/MPLUS_FONTS'
  },
  {
    name: 'Noto Sans JP',
    copyright: 'Copyright 2014-2021 googlefonts',
    url: 'https://github.com/googlefonts/noto-cjk'
  },
  {
    name: 'Noto Color Emoji',
    copyright: 'Copyright 2021 googlefonts',
    url: 'https://github.com/googlefonts/noto-emoji'
  }
]

type AboutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  theme: 'light' | 'dark'
  updateState: UpdateState
}

export const AboutDialog = ({ open, onOpenChange, theme, updateState }: AboutDialogProps) => {
  const { t } = useTranslation()
  const [version] = useState(() => window.api.getAppVersion())
  const [copied, setCopied] = useState(false)

  // 開くたびに確認する(確認中・DL中・DL済みなら main 側で何もしない)
  useEffect(() => {
    if (open) window.api.checkForUpdates()
  }, [open])

  const copyError = async () => {
    try {
      await navigator.clipboard.writeText(updateState.error ?? '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  const checkAgainButton = (
    <button
      type="button"
      onClick={() => window.api.checkForUpdates()}
      title={t('about.checkAgain')}
      className="cursor-pointer text-muted-foreground hover:text-foreground"
    >
      <span aria-hidden="true" className="codicon codicon-refresh" />
    </button>
  )

  const renderUpdateStatus = () => {
    switch (updateState.status) {
      case 'idle':
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg
              aria-hidden="true"
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>{t('about.checking')}</span>
          </div>
        )
      case 'up-to-date':
        return (
          <div className="flex items-center gap-2">
            <p className="text-sm text-green-600">{t('about.upToDate')}</p>
            {checkAgainButton}
          </div>
        )
      case 'available':
        return (
          <p className="text-sm text-blue-500">
            {t('about.available', { version: updateState.version })}
          </p>
        )
      case 'downloaded':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-green-600">
              {t('about.downloaded', { version: updateState.version })}
            </p>
            <Button size="sm" onClick={() => window.api.installUpdate()}>
              {t('restartAndUpdate')}
            </Button>
          </div>
        )
      case 'error':
        if (updateState.error === 'dev') {
          return <p className="text-sm text-muted-foreground">{t('about.devError')}</p>
        }
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copyError}
              title={`${updateState.error}\n\n${t('about.copyHint')}`}
              className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <span>{t('about.error')}</span>
              <span
                aria-hidden="true"
                className={`codicon ${copied ? 'codicon-check text-green-600' : 'codicon-copy'}`}
              />
              {copied && <span className="text-green-600">{t('about.copied')}</span>}
            </button>
            {checkAgainButton}
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('bg-background text-foreground max-w-sm sm:max-w-sm', theme === 'dark' && 'dark')}
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
