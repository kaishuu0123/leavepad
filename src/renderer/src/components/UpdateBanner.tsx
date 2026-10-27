import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { UpdateState } from '../../../types'
import { Button } from './ui/button'

type UpdateBannerProps = {
  state: UpdateState
}

export const UpdateBanner = ({ state }: UpdateBannerProps) => {
  const { t } = useTranslation()
  const [dismissedVersion, setDismissedVersion] = useState<string | undefined>()

  if (state.status !== 'downloaded' || state.version === dismissedVersion) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-background border border-border text-foreground p-3 rounded-lg shadow-md flex gap-3 items-center">
      <span className="text-sm">{t('updateVersion', { version: state.version })}</span>
      <Button size="sm" variant="default" onClick={() => window.api.installUpdate()}>
        {t('restartAndUpdate')}
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setDismissedVersion(state.version)}>
        {t('cancel')}
      </Button>
    </div>
  )
}
