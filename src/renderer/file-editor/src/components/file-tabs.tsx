import { FileTab } from '../../../../types'
import { ScrollArea, ScrollBar } from '../../../src/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '../../../src/components/ui/tabs'
import { Button } from '../../../src/components/ui/button'
import { useState } from 'react'

type FileTabsProps = {
  fileTabs: FileTab[]
  activeTabId: string | null
  onTabClick: (tabId: string) => void
  onTabCloseClick: (tabId: string) => void
  onTabReorder: (newTabs: FileTab[]) => void
}

function FileTabs({
  fileTabs,
  activeTabId,
  onTabClick,
  onTabCloseClick,
  onTabReorder
}: FileTabsProps): JSX.Element {
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null)
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null)

  if (fileTabs.length === 0) {
    return <></>
  }

  const onTabChange = (value: string): void => {
    onTabClick(value)
  }

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId)
    e.dataTransfer.effectAllowed = 'move'

    // Create a custom drag image (ghost)
    const target = e.currentTarget as HTMLElement
    const clone = target.cloneNode(true) as HTMLElement

    // Style the clone for the drag preview
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

    // Calculate offset from the click position within the element
    const rect = target.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const offsetY = e.clientY - rect.top

    e.dataTransfer.setDragImage(clone, offsetX, offsetY)

    // Remove the clone after drag starts
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

    const draggedIndex = fileTabs.findIndex((tab) => tab.id === draggedTabId)
    const targetIndex = fileTabs.findIndex((tab) => tab.id === targetTabId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTabId(null)
      setDragOverTabId(null)
      return
    }

    // Create new array with reordered tabs
    const newTabs = [...fileTabs]
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
    <ScrollArea type="always" className="w-full h-9 border-b">
      <Tabs value={activeTabId || ''} className="h-full" onValueChange={onTabChange}>
        <TabsList className="w-full gap-1 rounded-none justify-start px-1 pb-0 pt-1 h-full">
          {fileTabs.map((tab) => {
            const isDragging = draggedTabId === tab.id
            const isDragOver = dragOverTabId === tab.id

            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                data-tab-id={tab.id}
                draggable
                onDragStart={(e) => handleDragStart(e, tab.id)}
                onDragOver={(e) => handleDragOver(e, tab.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, tab.id)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-2 h-full rounded-none rounded-t-sm border border-b-0 px-3 transition-all ${
                  isDragging ? 'opacity-40 bg-muted' : ''
                } ${isDragOver ? 'border-l-4 border-l-blue-500 shadow-lg' : ''}`}
                style={{
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                asChild
              >
                <div>
                  <button className="grow text-sm">
                    {tab.isModified ? `${tab.fileName} *` : tab.fileName}
                  </button>
                  <div className="flex h-full items-center">
                    <Button
                      variant="ghost"
                      className="flex items-center w-4 h-4 rounded-none hover:bg-muted"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTabCloseClick(tab.id)
                      }}
                    >
                      <div className="codicon codicon-close text-xs"></div>
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

export default FileTabs
