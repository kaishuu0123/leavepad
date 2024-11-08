import { useEffect, useRef, useState } from 'react'
import { editor } from 'monaco-editor'
import { useForm } from 'react-hook-form'

import { Button } from './components/ui/button'
import { ScrollArea } from './components/ui/scroll-area'
import { Input } from './components/ui/input'
import { Separator } from './components/ui/separator'
import NoteCard from './components/note-card'
import NoteTabs from './components/note-tabs'
import NoteEditor, { initializeNoteEditor } from './components/note-editor'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem
} from './components/ui/context-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from './components/ui/dialog'
import { GlobalSettingsTabs } from './components/global-settings-tabs'
import { cn } from './lib/utils'
import { CursorPosition, defaultNoteEditorSettings, Note, NoteEditorSettings } from '../../types'
import { useAtom } from 'jotai'
import { currentNoteEditorSettingsAtom } from './lib/atoms/note-editor-settings'
import { currentNoteAtom, notesAtom } from './lib/atoms/notes'
import {
  contextSelectedTabIdAtom,
  noteTabsAtom,
  onCloseAllTab,
  onCloseOthersTab,
  onCloseTab,
  onCloseToTheRightTab,
  onTabCloseClick
} from './lib/atoms/tabs'
import { getTime } from 'date-fns'
import { Trans, useTranslation } from 'react-i18next'
import i18n from './i18n/configs'
import { Drawer, DrawerContent, DrawerTrigger } from './components/ui/drawer'
import LogoImg from './assets/leavepad_logo.svg'

initializeNoteEditor()

function App(): JSX.Element {
  const { t } = useTranslation()
  // @ts-ignore
  const _ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
  const editorRef = useRef<editor.IStandaloneCodeEditor | undefined>(undefined)
  const [notes, setNotes] = useAtom(notesAtom)
  const [currentNote, setCurrentNote] = useAtom(currentNoteAtom)
  const [noteTabs, setNoteTabs] = useAtom(noteTabsAtom)
  const [_contextSelectedTabId, setContextSelectedTabId] = useAtom(contextSelectedTabIdAtom)
  const [currentNoteEditorSettings, setCurrentNoteEditorSettings] = useAtom(
    currentNoteEditorSettingsAtom
  )
  const settingsForm = useForm<NoteEditorSettings>({
    values: currentNoteEditorSettings
  })
  const [cursorPosition, setCursorPositon] = useState<CursorPosition>({ line: 1, col: 1 })
  const [globalSettingsOpen, setGlobalSettingsOpen] = useState(false)
  const [currentSearchValue, setCurrentSearchValue] = useState('')
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const sortNotes = (unsortedNotes: Note[]) => {
    const sortBy = currentNoteEditorSettings.sortBy
    const sortOrder = currentNoteEditorSettings.sortOrder

    return [...unsortedNotes].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortBy] - b[sortBy]
      } else {
        return b[sortBy] - a[sortBy]
      }
    })
  }

  useEffect(() => {
    const fetchNotes = async () => {
      const notes = await window.api.getNotes()
      setNotes(sortNotes(notes))
    }
    const fetchSettings = async () => {
      const settings = await window.api.getSettings()
      setCurrentNoteEditorSettings({ ...defaultNoteEditorSettings, ...settings })
    }
    fetchNotes()
    fetchSettings()

    document.fonts.load('16px HackGen')

    window.addEventListener('resize', () => {
      editorRef.current?.layout()
    })
  }, [])

  useEffect(() => {
    // re-sort when global settings changed
    setNotes(sortNotes(notes))
    i18n.changeLanguage(currentNoteEditorSettings.language)
  }, [currentNoteEditorSettings])

  const AddNote = async () => {
    const note = await window.api.createNote()
    const notes = await window.api.getNotes()
    setNotes(sortNotes(notes))
    setCurrentNote(note)
    setNoteTabs([...noteTabs, { id: note.id, name: note.name }])
  }

  const DeleteNote = async (willDeleteNote: Note) => {
    await window.api.deleteNote(willDeleteNote.id)
    const notes = await window.api.getNotes()
    setNotes(sortNotes(notes))
    const newTabs = noteTabs.filter((tab) => willDeleteNote.id !== tab.id)
    setNoteTabs(newTabs)
  }

  const onTabClick = (tabId: string) => {
    const note = notes.find((note) => note.id === tabId)
    if (note != null) {
      setCurrentNote(note)
    }
  }

  const onDidChangeCursorPosition = (event: editor.ICursorPositionChangedEvent) => {
    setCursorPositon({
      line: event.position.lineNumber,
      col: event.position.column
    })
  }

  const onEditorChange = async (currentNote: Note, value: string) => {
    const willUpdateNote = {
      ...currentNote,
      body: value,
      updatedAt: getTime(new Date())
    }

    window.api.updateNote(willUpdateNote)
    const notes = await window.api.getNotes()
    setNotes(sortNotes(notes))
  }

  const onNoteCardClick = (note: Note) => {
    setCurrentNote(note)

    if (isDrawerOpen === true) {
      setDrawerOpen(false)
    }

    const noteTab = noteTabs.find((tab) => tab.id === note.id)
    // Focus exists tab.
    if (noteTab) {
      return
    }

    // Add tab when not included noteTabs.
    setNoteTabs([...noteTabs, { id: note.id, name: note.name }])
  }

  const onNoteCardSetName = async (changedNote: Note, title: string) => {
    const willUpdateNote = {
      ...changedNote,
      name: title,
      updatedAt: getTime(new Date())
    }

    window.api.updateNote(willUpdateNote)
    const notes = await window.api.getNotes()
    setNotes(sortNotes(notes))

    // Update noteTab name
    setNoteTabs(
      noteTabs.map((tab) => {
        if (changedNote.id === tab.id) {
          return {
            ...tab,
            name: title
          }
        } else {
          return tab
        }
      })
    )
  }

  const onGlobalSettingsSubmit = (value: NoteEditorSettings) => {
    setCurrentNoteEditorSettings(value)
    i18n.changeLanguage(value.language)
    window.api.updateSettings(value)
  }

  if (currentNote == null) {
    if (noteTabs.length > 0) {
      // focus latest tab (by setCurrentNote)
      const latestTab = noteTabs.at(-1)
      if (latestTab) {
        const note = notes.find((note) => note.id === latestTab.id)
        if (note != null) {
          setCurrentNote(note)
        }
      }
    }
  }

  const filterNotesByName = (notes: Note[]) => {
    if (currentSearchValue != null && currentSearchValue != '') {
      const regex = new RegExp(currentSearchValue)
      return notes.filter((note) => {
        return regex.test(note.name)
      })
    }

    return notes
  }

  return (
    <>
      <div
        className={cn(
          'bg-background text-foreground flex w-full h-full items-stretch',
          currentNoteEditorSettings.themeName === 'dark' && 'dark'
        )}
      >
        <div
          className={cn(
            'flex flex-col h-screen space-y-2',
            isSidebarOpen === true ? 'w-3/12 xl:w-2/12' : ''
          )}
        >
          <div className="mt-2">
            {isSidebarOpen === true ? (
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start space-x-2 rounded-none"
                onClick={() => {
                  setSidebarOpen(!isSidebarOpen)
                }}
              >
                <div className="w-8 h-8 object-contain">
                  <img src={LogoImg} />
                </div>
                <div className="grow text-left">Leavepad</div>
                <div className="codicon codicon-chevron-left"></div>
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start space-x-2 rounded-none"
                onClick={() => setSidebarOpen(!isSidebarOpen)}
              >
                <div className="codicon codicon-chevron-right w-full"></div>
              </Button>
            )}
          </div>

          <Separator />

          <div className="px-2">
            <Button className="w-full items-center justify-start" onClick={AddNote}>
              <span className="codicon codicon-new-file"></span>
              {isSidebarOpen === true && <span>{t('createNote')}</span>}
            </Button>
          </div>

          <Separator />

          {isSidebarOpen === true ? (
            <div className="px-2">
              <div className="flex items-center w-full">
                <div className="grow">
                  <h2 className="text-lg font-bold">Notes</h2>
                </div>
                <div className="grow flex justify-end">
                  <span className="text-sm">{notes.length}</span>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          {isSidebarOpen === true ? (
            <div className="px-2">
              <Input
                placeholder={t('searchByNoteName')}
                defaultValue={currentSearchValue}
                onChange={(e) => setCurrentSearchValue(e.target.value)}
              />
            </div>
          ) : (
            <></>
          )}

          <div className="grow overflow-y-auto px-2">
            {isSidebarOpen === true ? (
              <ScrollArea type="always" className="h-full">
                <div className="flex flex-col h-full items-start gap-2 text-left text-sm">
                  {filterNotesByName(notes).map((note, _i) => {
                    return (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onClick={onNoteCardClick}
                        onNoteCardSetName={onNoteCardSetName}
                        onDeleteNote={DeleteNote}
                      />
                    )
                  })}
                </div>
              </ScrollArea>
            ) : (
              <Drawer direction="left" open={isDrawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button>
                    <div className="codicon codicon-note"></div>
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="w-4/12 h-full rounded-none py-3">
                  <div className="flex flex-col h-full space-y-4">
                    <div className="px-3">
                      <div className="flex items-center w-full">
                        <div className="grow">
                          <h2 className="text-lg font-bold">Notes</h2>
                        </div>
                        <div className="grow flex justify-end">
                          <span className="text-sm">{notes.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-3">
                      <Input
                        placeholder={t('searchByNoteName')}
                        defaultValue={currentSearchValue}
                        onChange={(e) => setCurrentSearchValue(e.target.value)}
                      />
                    </div>

                    <div className="grow overflow-y-auto px-3">
                      <ScrollArea type="always" className="h-full">
                        <div className="flex flex-col h-full items-start gap-2 text-left text-sm">
                          {filterNotesByName(notes).map((note, _i) => {
                            return (
                              <NoteCard
                                key={note.id}
                                note={note}
                                onClick={onNoteCardClick}
                                onNoteCardSetName={onNoteCardSetName}
                                onDeleteNote={DeleteNote}
                              />
                            )
                          })}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>

          <div className="flex-shrink items-center border-t">
            <Dialog open={globalSettingsOpen} onOpenChange={setGlobalSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex rounded-none py-1 gap-1 w-full h-full items-center justify-center text-sm"
                >
                  <div className="flex items-center min-h-5">
                    <div className="codicon codicon-settings-gear"></div>
                  </div>
                  <div className={cn('text-sm', isSidebarOpen === true ? '' : 'hidden')}>
                    {t('globalSettings')}
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent
                className={cn(
                  'flex flex-col bg-background text-foreground max-w-2xl h-[90%] gap-2',
                  currentNoteEditorSettings.themeName === 'dark' && 'dark'
                )}
                aria-describedby={undefined}
              >
                <DialogHeader>
                  <DialogTitle asChild>
                    <h2 className="text-2xl font-bold tracking-tight">{t('globalSettings')}</h2>
                  </DialogTitle>
                </DialogHeader>
                <div
                  data-orientation="horizontal"
                  className="flex-shrink-0 bg-border h-[1px] w-full my-2"
                ></div>
                <div className="grow flex w-full min-h-0 pb-3">
                  <GlobalSettingsTabs settingsForm={settingsForm} />
                </div>
                <div
                  data-orientation="horizontal"
                  className="flex-shrink-0 bg-border h-[1px] w-full my-2"
                ></div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="default"
                    onClick={() => {
                      onGlobalSettingsSubmit(settingsForm.getValues())
                      settingsForm.reset()
                      setGlobalSettingsOpen(false)
                    }}
                  >
                    {t('globalSettingsGroup.save')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      settingsForm.reset()
                      setGlobalSettingsOpen(false)
                    }}
                  >
                    {t('globalSettingsGroup.cancel')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Separator orientation="vertical" className="h-screen" />
        <div
          className={cn('flex h-screen', isSidebarOpen === true ? 'w-9/12 xl:w-10/12' : 'w-full')}
        >
          {noteTabs.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full h-screen">
              <h1 className="text-2xl text-muted-foreground">
                <Trans i18nKey="blankWindowDescription" />
              </h1>
            </div>
          ) : (
            <div className="flex flex-col w-full h-screen">
              <div className="w-full">
                <ContextMenu>
                  <ContextMenuTrigger
                    onContextMenu={(event) => {
                      if (event.target instanceof Element) {
                        const tab = event.target.closest('[role="tab"]') as HTMLElement
                        if (tab) {
                          setContextSelectedTabId(tab.dataset?.tabId)
                        }
                      }
                    }}
                  >
                    <NoteTabs
                      noteTabs={noteTabs}
                      activeTabId={currentNote?.id}
                      onTabClick={onTabClick}
                      onTabCloseClick={onTabCloseClick}
                    />
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-64">
                    <ContextMenuItem onSelect={onCloseTab}>
                      {t('contextMenu.close')}
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={onCloseOthersTab}>
                      {t('contextMenu.closeOthers')}
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={onCloseToTheRightTab}>
                      {t('contextMenu.closeToTheRight')}
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={onCloseAllTab}>
                      {t('contextMenu.closeAll')}
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </div>

              <div className="grow overflow-y-auto">
                <NoteEditor
                  currentNote={currentNote}
                  onDidChangeCursorPosition={onDidChangeCursorPosition}
                  onEditorChange={onEditorChange}
                  ref={editorRef}
                />
              </div>

              <div className="flex-shrink border-t py-1">
                <div className="flex w-full gap-2 justify-start ps-3 text-sm">
                  <div>
                    <div>
                      {t('line')}: {cursorPosition?.line}
                    </div>
                  </div>
                  <div>
                    <div>
                      {t('col')}: {cursorPosition?.col}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default App
