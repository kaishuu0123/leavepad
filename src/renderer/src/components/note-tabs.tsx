import useHorizontalScroll from '@renderer/lib/useHorizontalScroll'
import { ScrollArea, ScrollBar } from './ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from './ui/tabs'
import { Button } from './ui/button'

function NoteTabs({ noteTabs, activeTabId, onTabClick, onTabCloseClick }): JSX.Element {
  const tabs = noteTabs.map((tab) => tab.id)
  const { ref } = useHorizontalScroll()

  if (noteTabs == null) {
    return <></>
  }

  const onTabChange = (value) => {
    onTabClick(value)
  }

  return (
    <ScrollArea ref={ref} type="always" className="w-full h-full">
      <Tabs value={activeTabId} className="h-full" onValueChange={onTabChange}>
        <TabsList className="w-full gap-1 rounded-none justify-start px-1 pb-0 pt-1">
          {tabs.map((tab) => {
            return (
              <TabsTrigger
                key={tab}
                value={tab}
                data-tab-id={tab}
                className="flex items-center gap-3 h-full rounded-none rounded-t-sm border border-b-0"
                asChild
              >
                <div>
                  <button className="grow">
                    {noteTabs.find((noteTabs) => noteTabs.id === tab).name}
                  </button>
                  <div className="flex h-full items-center">
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
