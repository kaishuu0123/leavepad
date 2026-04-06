import { useCallback, useEffect, useRef, useState } from 'react'
import { editor } from 'monaco-editor'
import { useForm } from 'react-hook-form'

import * as monaco from 'monaco-editor'
import { Button } from './components/ui/button'
import { ScrollArea } from './components/ui/scroll-area'
import { Input } from './components/ui/input'
import { Separator } from './components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './components/ui/command'
import NoteCard from './components/note-card'
import NoteTabs from './components/note-tabs'
import NoteEditor, { initializeNoteEditor, applyMonacoLocale } from './components/note-editor'
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
import {
  AppState,
  CursorPosition,
  defaultNoteEditorSettings,
  Note,
  NoteEditorSettings
} from '../../types'
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
import { useTranslation } from 'react-i18next'
import i18n from './i18n/configs'
import { Drawer, DrawerContent, DrawerTrigger } from './components/ui/drawer'
import appWelcomeIcon from './assets/leavepad_logo_welcome.svg'

initializeNoteEditor()

function App(): JSX.Element {
  const { t } = useTranslation()
  // @ts-ignore for DEBUG
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
  const [appState, setAppState] = useState<AppState | undefined>(undefined)
  const [isDragOver, setIsDragOver] = useState(false)
  const [updateInfo, setUpdateInfo] = useState<{ version: string } | null>(null)
  const [localeReady, setLocaleReady] = useState(false)
  const dragCounterRef = useRef(0)

  // Drag & Drop handlers for opening files in file editor
  const handleDragEnter = useCallback((e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current = 0
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files.length === 0) return

    // Open each dropped file in file editor
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const filePath = window.api.getPathForFile(file)
      if (filePath) {
        window.api.openFileInEditor(filePath)
      }
    }
  }, [])

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

    // Remove the deleted note's tab
    const newTabs = noteTabs.filter((tab) => willDeleteNote.id !== tab.id)
    setNoteTabs(newTabs)

    // If the deleted note was the current note, switch to another tab
    if (currentNote?.id === willDeleteNote.id) {
      if (newTabs.length > 0) {
        // Switch to the last tab
        const newActiveTab = newTabs[newTabs.length - 1]
        const newActiveNote = notes.find((note) => note.id === newActiveTab.id)
        if (newActiveNote) {
          setCurrentNote(newActiveNote)
        }
      } else {
        // No tabs left, clear current note
        setCurrentNote(null)
      }
    }
  }

  useEffect(() => {
    const fetchNotes = async () => {
      const notes = await window.api.getNotes()
      setNotes(sortNotes(notes))
    }
    const fetchSettings = async () => {
      const settings = await window.api.getSettings()
      const merged = { ...defaultNoteEditorSettings, ...settings }
      await applyMonacoLocale(merged.language)
      setCurrentNoteEditorSettings(merged)
      setLocaleReady(true)
    }
    const fetchAppState = async () => {
      const appState = await window.api.getAppState()
      setAppState(appState)
      setSidebarOpen(appState.isSidebarOpen)
    }

    fetchNotes()
    fetchSettings()
    fetchAppState()

    document.fonts.load('14px HackGen')
    document.fonts.load('14px NOTONOTO')
  }, [])

  useEffect(() => {
    window.electron.ipcRenderer.on('update-downloaded', (_event, info) => {
      // トースト等でユーザーに通知
      setUpdateInfo(info)
    })
  }, [])

  // Refresh notes when a note is created from JSON Tool
  useEffect(() => {
    const handleNoteListUpdated = async (): Promise<void> => {
      const notes = await window.api.getNotes()
      setNotes(sortNotes(notes))
    }
    window.electron.ipcRenderer.on('note-list-updated', handleNoteListUpdated)
    return () => {
      window.electron.ipcRenderer.removeListener('note-list-updated', handleNoteListUpdated)
    }
  }, [currentNoteEditorSettings])

  useEffect(() => {
    const updateWindowState = () => {
      editorRef.current?.layout()

      window.api.updateAppState({
        isSidebarOpen: isSidebarOpen,
        windowWidth: window.outerWidth,
        windowHeight: window.outerHeight,
        windowX: appState?.windowX,
        windowY: appState?.windowY
      })
    }
    window.addEventListener('resize', updateWindowState)

    return () => {
      window.removeEventListener('resize', updateWindowState)
    }
  }, [isSidebarOpen])

  useEffect(() => {
    // re-sort when global settings changed
    setNotes(sortNotes(notes))
    i18n.changeLanguage(currentNoteEditorSettings.language)
  }, [currentNoteEditorSettings])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const isMod = e.ctrlKey || e.metaKey

      // Ctrl+N: New note
      if (isMod && e.key === 'n' && !e.shiftKey) {
        e.preventDefault()
        AddNote()
      }

      // Ctrl+Shift+J: Open JSON Tool
      if (isMod && e.shiftKey && e.key === 'J') {
        e.preventDefault()
        window.api.openJsonFormatter()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [AddNote])

  const onTabClick = (tabId: string) => {
    const note = notes.find((note) => note.id === tabId)
    if (note != null) {
      setCurrentNote(note)
    }
  }

  const onTabReorder = (newTabs: typeof noteTabs) => {
    setNoteTabs(newTabs)
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

    await window.api.updateNote(willUpdateNote)
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

    // Update note.
    await window.api.updateNote(willUpdateNote)

    // Get all notes after updating note.
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

  const onGlobalSettingsSubmit = async (value: NoteEditorSettings) => {
    await applyMonacoLocale(value.language)
    setCurrentNoteEditorSettings(value)
    i18n.changeLanguage(value.language)
    await window.api.updateSettings(value)
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
        return regex.test(note.name) || regex.test(note.body)
      })
    }

    return notes
  }

  const onClickSidebarMinimize = async () => {
    const nextState = !isSidebarOpen
    setSidebarOpen(nextState)

    setTimeout(() => editorRef.current?.layout(), 0)

    await window.api.updateAppState({
      isSidebarOpen: nextState,
      windowWidth: window.outerWidth,
      windowHeight: window.outerHeight,
      windowX: appState?.windowX,
      windowY: appState?.windowY
    })
  }

  return (
    <>
      {updateInfo && (
        <div className="fixed bottom-4 right-4 z-50 bg-background border border-border text-foreground p-3 rounded-lg shadow-md flex gap-3 items-center">
          <span className="text-sm">{t('updateVersion', { version: updateInfo.version })}</span>
          <Button size="sm" variant="default" onClick={() => window.api.installUpdate()}>
            {t('restartAndUpdate')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setUpdateInfo(null)}>
            {t('cancel')}
          </Button>
        </div>
      )}

      <div
        className={cn(
          'bg-background text-foreground flex w-full h-full items-stretch relative',
          currentNoteEditorSettings.themeName === 'dark' && 'dark'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag & Drop Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary pointer-events-none">
            <div className="text-center">
              <div className="codicon codicon-file-add text-4xl text-primary mb-2"></div>
              <p className="text-lg font-medium text-primary">Drop files to open in File Editor</p>
            </div>
          </div>
        )}
        <div
          className={cn(
            'flex flex-col h-screen space-y-2 relative',
            isSidebarOpen === true ? 'w-3/12 xl:w-2/12' : ''
          )}
        >
          <Button
            className={cn('absolute left-[100%] top-[50%] -ml-3 w-7 h-7 z-10')}
            variant="outline"
            size="icon"
            onClick={onClickSidebarMinimize}
          >
            {isSidebarOpen ? (
              <span className="codicon codicon-chevron-left"></span>
            ) : (
              <span className="codicon codicon-chevron-right"></span>
            )}
          </Button>

          <div className="px-2">
            <Button
              className={cn(
                'w-full items-center justify-start',
                isSidebarOpen === false && 'p-2 h-8'
              )}
              onClick={AddNote}
            >
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
                placeholder={t('searchByNoteNameOrNoteBody')}
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
                  {filterNotesByName(notes).map((note, index) => {
                    return (
                      <NoteCard
                        key={note.id}
                        note={note}
                        index={index}
                        onClick={onNoteCardClick}
                        onNoteCardSetName={onNoteCardSetName}
                        onDeleteNote={DeleteNote}
                      />
                    )
                  })}
                </div>
              </ScrollArea>
            ) : (
              <Drawer
                direction="left"
                open={isDrawerOpen}
                onOpenChange={setDrawerOpen}
                dismissible={false}
              >
                <DrawerTrigger asChild>
                  <Button className={cn(isSidebarOpen === false && 'p-2 h-8')}>
                    <div
                      className="codicon codicon-note"
                      onClick={() => setDrawerOpen(false)}
                    ></div>
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="w-6/12 md:w-4/12 lg:max-2xl:w-3/12 h-full rounded-none py-3">
                  <div className="flex flex-col h-full space-y-4">
                    <div className="px-3">
                      <div className="flex items-center w-full">
                        <Button
                          className="w-full items-center justify-start"
                          onClick={() => setDrawerOpen(false)}
                        >
                          <span className="codicon codicon-close"></span>
                          <span>{t('close')}</span>
                        </Button>
                      </div>
                    </div>

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
                        placeholder={t('searchByNoteNameOrNoteBody')}
                        defaultValue={currentSearchValue}
                        onChange={(e) => setCurrentSearchValue(e.target.value)}
                      />
                    </div>

                    <div className="grow overflow-y-auto px-3">
                      <ScrollArea type="always" className="h-full">
                        <div className="flex flex-col h-full items-start gap-2 text-left text-sm">
                          {filterNotesByName(notes).map((note, index) => {
                            return (
                              <NoteCard
                                key={note.id}
                                note={note}
                                index={index}
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
            <div className="flex flex-col items-center justify-center w-full h-full min-h-0 overflow-y-auto bg-muted/30">
              <div className="text-center max-w-md px-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <img src={appWelcomeIcon} alt="Leavepad" className="w-24 h-24" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-semibold mb-4 text-foreground">{t('welcomeTitle')}</h1>

                {/* Description */}
                <p className="text-muted-foreground mb-8">{t('welcomeDescription')}</p>

                {/* Action Buttons - Row 1 */}
                <div className="flex gap-4 justify-center mb-3">
                  <Button size="lg" onClick={AddNote} className="flex items-center gap-2">
                    <span className="codicon codicon-new-file"></span>
                    <span>{t('createNote')}</span>
                  </Button>

                  {/* File Editor Button - Electron only */}
                  {typeof window.api?.openFileInEditor === 'function' && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => window.api.openFileInEditor('')}
                      className="flex items-center gap-2"
                    >
                      <span className="codicon codicon-file-code"></span>
                      <span>{t('fileEditor')}</span>
                    </Button>
                  )}
                </div>

                {/* Action Buttons - Row 2: Tools */}
                {typeof window.api?.openJsonFormatter === 'function' && (
                  <div className="flex gap-4 justify-center mb-6">
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => window.api.openJsonFormatter()}
                      className="flex items-center gap-2"
                    >
                      <span className="codicon codicon-json"></span>
                      <span>{t('jsonTool')}</span>
                    </Button>
                  </div>
                )}

                {/* Hint Text */}
                <p className="text-sm text-muted-foreground">{t('welcomeHint')}</p>

                {/* Keyboard Shortcuts */}
                <div className="text-xs text-muted-foreground mt-4 inline-grid grid-cols-[auto_auto] gap-x-2 gap-y-1 items-center text-left">
                  <kbd className="px-2 py-0.5 bg-muted rounded border text-xs justify-self-end">
                    {navigator.platform.indexOf('Mac') !== -1 ? '⌘N' : 'Ctrl+N'}
                  </kbd>
                  <span>{t('createNote')}</span>
                  {typeof window.api?.openFileInEditor === 'function' && (<>
                    <kbd className="px-2 py-0.5 bg-muted rounded border text-xs justify-self-end">
                      {navigator.platform.indexOf('Mac') !== -1 ? '⌘⇧O' : 'Ctrl+⇧+O'}
                    </kbd>
                    <span>{t('fileEditor')}</span>
                  </>)}
                  {typeof window.api?.openJsonFormatter === 'function' && (<>
                    <kbd className="px-2 py-0.5 bg-muted rounded border text-xs justify-self-end">
                      {navigator.platform.indexOf('Mac') !== -1 ? '⌘⇧J' : 'Ctrl+⇧+J'}
                    </kbd>
                    <span>{t('jsonTool')}</span>
                  </>)}
                </div>

                {/* Version */}
                <p className="text-xs text-muted-foreground/50 mt-6">
                  v{window.api.getAppVersion()}
                </p>
              </div>
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
                      onTabReorder={onTabReorder}
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

              <div className="grow min-h-0">
                {localeReady && (
                  <NoteEditor
                    currentNote={currentNote}
                    onDidChangeCursorPosition={onDidChangeCursorPosition}
                    onEditorChange={onEditorChange}
                    ref={editorRef}
                  />
                )}
              </div>

              <div className="flex-shrink border-t py-1">
                <div className="flex w-full gap-3 justify-between px-3 text-sm items-center">
                  <div className="flex gap-3">
                    <div>
                      {t('line')}: {cursorPosition?.line}
                    </div>
                    <div>
                      {t('col')}: {cursorPosition?.col}
                    </div>
                  </div>
                  {currentNote && (() => {
                    const currentLanguage = currentNote.language || currentNoteEditorSettings.editorOptions.language
                    const currentLanguageDisplayName = monaco.languages.getLanguages().find((l) => l.id === currentLanguage)?.aliases?.[0] || currentLanguage
                    return (
                      <div className="flex gap-2 items-center">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs hover:bg-muted"
                            >
                              {currentLanguageDisplayName}
                              <span className="codicon codicon-chevron-down ml-1 text-[10px]"></span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0" align="end">
                            <Command>
                              <CommandInput placeholder={t('searchLanguage')} className="h-9" />
                              <CommandList>
                                <CommandEmpty>{t('noLanguageFound')}</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem
                                      value="default"
                                      onSelect={async () => {
                                        const updatedNote = { ...currentNote, language: undefined }
                                        await window.api.updateNote(updatedNote)
                                        setCurrentNote(updatedNote)
                                        setNotes(notes.map((n) => (n.id === currentNote.id ? updatedNote : n)))
                                      }}
                                    >
                                      {t('defaultLanguage')} ({monaco.languages.getLanguages().find((l) => l.id === currentNoteEditorSettings.editorOptions.language)?.aliases?.[0] || currentNoteEditorSettings.editorOptions.language})
                                      {!currentNote.language && (
                                        <span className="ml-auto codicon codicon-check"></span>
                                      )}
                                    </CommandItem>
                                    <Separator className="my-1" />
                                    {monaco.languages.getLanguages().map((lang) => {
                                      const displayName = lang.aliases?.[0] || lang.id
                                      return (
                                        <CommandItem
                                          key={lang.id}
                                          value={`${displayName} ${lang.id}`}
                                          onSelect={async () => {
                                            const updatedNote = { ...currentNote, language: lang.id }
                                            await window.api.updateNote(updatedNote)
                                            setCurrentNote(updatedNote)
                                            setNotes(notes.map((n) => (n.id === currentNote.id ? updatedNote : n)))
                                          }}
                                        >
                                          {displayName}
                                          {currentNote.language === lang.id && (
                                            <span className="ml-auto codicon codicon-check"></span>
                                          )}
                                        </CommandItem>
                                      )
                                    })}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )
                  })()}
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
