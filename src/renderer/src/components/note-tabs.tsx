import useHorizontalScroll from '@renderer/lib/useHorizontalScroll'
import { ScrollArea, ScrollBar } from './ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'
import { useEffect, useState } from 'react'

function NoteTabs({
  noteTabs,
  activeTabId,
  onTabClick,
  onTabCloseClick,
  onTabReorder
}): JSX.Element {
  const tabs = noteTabs.map((tab) => tab.id)
  const { ref } = useHorizontalScroll()
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null)
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null)

  useEffect(() => {
    if (!activeTabId) return
    const el = document.querySelector(`[data-tab-id="${activeTabId}"]`) as HTMLElement | null
    el?.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'nearest' })
  }, [activeTabId])

  if (noteTabs == null) {
    return <></>
  }

  const onTabChange = (value) => {
    onTabClick(value)
  }

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId)
    e.dataTransfer.effectAllowed = 'move'

    const target = e.currentTarget as HTMLElement
    const clone = target.cloneNode(true) as HTMLElement

    clone.style.position = 'absolute'
    clone.style.top = '-9999px'
    clone.style.left = '-9999px'
    clone.style.opacity = '0.8'
    clone.style.background = 'var(--background)'
    clone.style.border = '1px solid var(--border)'
    clone.style.borderRadius = '4px'
    clone.style.padding = '4px 8px'
    clone.style.pointerEvents = 'none'
    clone.style.width = `${target.offsetWidth}px`
    clone.style.height = `${target.offsetHeight}px`

    document.body.appendChild(clone)

    const rect = target.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    e.dataTransfer.setDragImage(clone, offsetX, offsetY)

    setTimeout(() => {
      document.body.removeChild(clone)
    }, 0)
  }

  const handleDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'

    if (draggedTabId && draggedTabId !== tabId) {
      setDragOverTabId(tabId)
    }
  }

  const handleDragLeave = () => {
    setDragOverTabId(null)
  }

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault()

    if (!draggedTabId || draggedTabId === targetTabId) {
      setDraggedTabId(null)
      setDragOverTabId(null)
      return
    }

    const draggedIndex = noteTabs.findIndex((tab) => tab.id === draggedTabId)
    const targetIndex = noteTabs.findIndex((tab) => tab.id === targetTabId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTabId(null)
      setDragOverTabId(null)
      return
    }

    const newTabs = [...noteTabs]
    const [removed] = newTabs.splice(draggedIndex, 1)
    newTabs.splice(targetIndex, 0, removed)

    onTabReorder(newTabs)
    setDraggedTabId(null)
    setDragOverTabId(null)
  }

  const handleDragEnd = () => {
    setDraggedTabId(null)
    setDragOverTabId(null)
  }

  return (
    <ScrollArea ref={ref} type="always" className="w-full h-full">
      <Tabs value={activeTabId} className="h-full" onValueChange={onTabChange}>
        <TabsList className="w-full gap-1 rounded-none justify-start px-1 pb-0 pt-1">
          {tabs.map((tab) => {
            const isDragging = draggedTabId === tab
            const isDragOver = dragOverTabId === tab
            const tabName = noteTabs.find((nt) => nt.id === tab).name

            return (
              <TabsTrigger
                key={tab}
                value={tab}
                data-tab-id={tab}
                draggable
                onDragStart={(e) => handleDragStart(e, tab)}
                onDragOver={(e) => handleDragOver(e, tab)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, tab)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 h-full rounded-none rounded-t-sm border border-b-0 transition-all overflow-hidden min-w-0 flex-1 max-w-[30%] ${
                  isDragging ? 'opacity-40 bg-muted' : ''
                } ${isDragOver ? 'border-l-4 border-l-blue-500 shadow-lg' : ''}`}
                style={{
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                asChild
              >
                <div onAuxClick={(e) => { if (e.button === 1) onTabCloseClick(tab) }}>
                  <Tooltip delayDuration={700}>
                    <TooltipTrigger asChild>
                      <button className="grow min-w-0 truncate text-left">
                        {tabName}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{tabName}</TooltipContent>
                  </Tooltip>
                  <div className="flex h-full items-center shrink-0">
                    <Button
                      variant="ghost"
                      className="flex items-center w-4 h-4 rounded-none"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTabCloseClick(tab)
                      }}
                    >
                      <div className="codicon codicon-close"></div>
                    </Button>
                  </div>
                </div>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

export default NoteTabs
