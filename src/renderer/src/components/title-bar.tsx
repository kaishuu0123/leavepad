import { useEffect, useState } from 'react'
import { cn } from '../lib/utils'

const isMac = navigator.platform.includes('Mac')

export default function TitleBar(): JSX.Element | null {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    window.api.isMaximized().then(setIsMaximized)
    window.api.onMaximizeChange(setIsMaximized)
  }, [])

  if (isMac) return null

  return (
    <div
      className="flex items-center h-8 bg-background border-b border-border shrink-0 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Hamburger menu button */}
      <button
        className={cn(
          'h-full px-4 flex items-center justify-center',
          'hover:bg-accent text-foreground transition-colors',
          'focus:outline-none'
        )}
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        onClick={() => window.api.popupMenu()}
        title="Menu"
      >
        <span className="codicon codicon-menu text-sm" />
      </button>

      {/* Drag area (fills remaining space) */}
      <div className="flex-1" />

      {/* Window controls */}
      <div
        className="flex items-center h-full"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize */}
        <button
          className="h-full px-4 flex items-center justify-center hover:bg-accent text-foreground transition-colors focus:outline-none"
          onClick={() => window.api.minimizeWindow()}
          title="Minimize"
        >
          <span className="codicon codicon-chrome-minimize text-sm" />
        </button>

        {/* Maximize / Restore */}
        <button
          className="h-full px-4 flex items-center justify-center hover:bg-accent text-foreground transition-colors focus:outline-none"
          onClick={() => window.api.maximizeWindow()}
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          <span
            className={cn(
              'codicon text-sm',
              isMaximized ? 'codicon-chrome-restore' : 'codicon-chrome-maximize'
            )}
          />
        </button>

        {/* Close */}
        <button
          className="h-full px-4 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground text-foreground transition-colors focus:outline-none"
          onClick={() => window.api.closeWindow()}
          title="Close"
        >
          <span className="codicon codicon-chrome-close text-sm" />
        </button>
      </div>
    </div>
  )
}
