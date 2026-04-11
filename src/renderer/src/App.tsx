import { useCallback, useEffect, useRef, useState } from 'react'
import { FileText } from 'lucide-react'
import { editor } from 'monaco-editor'
import { useForm } from 'react-hook-form'

import * as monaco from 'monaco-editor'
import { Button } from './components/ui/button'
import { ScrollArea } from './components/ui/scroll-area'
import { Input } from './components/ui/input'
import { Separator } from './components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from './components/ui/popover'
import { TooltipProvider } from './components/ui/tooltip'
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
import TitleBar from './components/title-bar'
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
import { AboutDialog } from './components/about-dialog'
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

const DEFAULT_SIDEBAR_RATIO = 0.25
const MIN_SIDEBAR_RATIO = 0.12
const MAX_SIDEBAR_RATIO = 0.4

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
  const [aboutOpen, setAboutOpen] = useState(false)
  const [renamingNoteId, setRenamingNoteId] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocusIdx, setSearchFocusIdx] = useState(0)
  const [sidebarRatio, setSidebarRatio] = useState(DEFAULT_SIDEBAR_RATIO)
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
      setSidebarRatio(appState.sidebarRatio ?? DEFAULT_SIDEBAR_RATIO)
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

  // Menu IPC actions from main process
  useEffect(() => {
    const removeNewNote = window.electron.ipcRenderer.on('menu-new-note', () => AddNote())
    const removeOpenSettings = window.electron.ipcRenderer.on('menu-open-settings', () =>
      setGlobalSettingsOpen(true)
    )
    const removeOpenJsonFormatter = window.electron.ipcRenderer.on(
      'menu-open-json-formatter',
      () => window.api.openJsonFormatter()
    )
    const removeFindInNotes = window.electron.ipcRenderer.on('menu-find-in-notes', () => {
      setIsSearchOpen(true)
      setSearchQuery('')
      setSearchFocusIdx(0)
    })
    const removeFindInEditor = window.electron.ipcRenderer.on('menu-find-in-editor', () => {
      editorRef.current?.getAction('actions.find')?.run()
    })
    const removeAbout = window.electron.ipcRenderer.on('menu-about', () => setAboutOpen(true))
    const removeCheckForUpdates = window.electron.ipcRenderer.on('menu-check-for-updates', () =>
      setAboutOpen(true)
    )
    return () => {
      removeNewNote()
      removeOpenSettings()
      removeOpenJsonFormatter()
      removeFindInNotes()
      removeFindInEditor()
      removeAbout()
      removeCheckForUpdates()
    }
  }, [AddNote])

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
    window.api.updateMenuLanguage(currentNoteEditorSettings.language)
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

      // Ctrl+Shift+F: Find in Notes
      if (isMod && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        setIsSearchOpen(true)
        setSearchQuery('')
        setSearchFocusIdx(0)
      }

      // F2: Rename active note
      if (e.key === 'F2' && renamingNoteId === null && currentNote) {
        e.preventDefault()
        setRenamingNoteId(currentNote.id)
      }

      // Escape: close search modal
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [AddNote, renamingNoteId, isSearchOpen, currentNote])

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

  const filterNotesByQuery = (notes: Note[], query: string) => {
    if (query != null && query !== '') {
      try {
        const regex = new RegExp(query, 'i')
        return notes.filter((note) => regex.test(note.name) || regex.test(note.body))
      } catch {
        return notes.filter(
          (note) =>
            note.name.toLowerCase().includes(query.toLowerCase()) ||
            note.body.toLowerCase().includes(query.toLowerCase())
        )
      }
    }
    return notes
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const containerWidth = window.innerWidth
    const startRatio = sidebarRatio
    let latestRatio = startRatio

    const onMouseMove = (e: MouseEvent) => {
      latestRatio = Math.min(
        MAX_SIDEBAR_RATIO,
        Math.max(MIN_SIDEBAR_RATIO, startRatio + (e.clientX - startX) / containerWidth)
      )
      setSidebarRatio(latestRatio)
      editorRef.current?.layout()
    }
    const onMouseUp = async () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      await window.api.updateAppState({
        isSidebarOpen,
        sidebarRatio: latestRatio,
        windowWidth: window.outerWidth,
        windowHeight: window.outerHeight,
        windowX: appState?.windowX,
        windowY: appState?.windowY
      })
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  const handleResizeDoubleClick = async () => {
    setSidebarRatio(DEFAULT_SIDEBAR_RATIO)
    editorRef.current?.layout()
    await window.api.updateAppState({
      isSidebarOpen,
      sidebarRatio: DEFAULT_SIDEBAR_RATIO,
      windowWidth: window.outerWidth,
      windowHeight: window.outerHeight,
      windowX: appState?.windowX,
      windowY: appState?.windowY
    })
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
    <TooltipProvider delayDuration={400} skipDelayDuration={100}>
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
          'bg-background text-foreground flex flex-col w-full h-full border border-border',
          currentNoteEditorSettings.themeName === 'dark' && 'dark'
        )}
      >
        <TitleBar />
        <div
          className="flex flex-1 items-stretch relative overflow-hidden"
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
            'flex flex-col h-full space-y-2 relative shrink-0 border-r border-border'
          )}
          style={isSidebarOpen ? { width: `${sidebarRatio * 100}%` } : undefined}
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
              title={isSidebarOpen === false ? t('createNote') : undefined}
            >
              <span className="codicon codicon-new-file"></span>
              {isSidebarOpen === true && <span>{t('createNote')}</span>}
            </Button>
          </div>

          <Separator />

          {isSidebarOpen === true ? (
            <div className="px-2">
              <div className="flex items-center w-full gap-1">
                <h2 className="text-lg font-bold grow">Notes</h2>
                <span className="text-sm text-muted-foreground">{notes.length}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => {
                    setIsSearchOpen(true)
                    setSearchQuery('')
                    setSearchFocusIdx(0)
                  }}
                  title={t('searchByNoteNameOrNoteBody')}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M10.5 10.5L14 14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          ) : (
            <></>
          )}

          <div className="grow overflow-y-auto px-2">
            {isSidebarOpen === true ? (
              <ScrollArea type="always" className="h-full">
                <div className="flex flex-col h-full items-start text-left text-sm py-1">
                  {notes.map((note, index) => {
                    return (
                      <NoteCard
                        key={note.id}
                        note={note}
                        index={index}
                        isActive={currentNote?.id === note.id}
                        isRenaming={renamingNoteId === note.id}
                        onClick={onNoteCardClick}
                        onNoteCardSetName={onNoteCardSetName}
                        onDeleteNote={DeleteNote}
                        onRenameStart={(note) => setRenamingNoteId(note.id)}
                        onRenameEnd={() => setRenamingNoteId(null)}
                      />
                    )
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Drawer
                  direction="left"
                  open={isDrawerOpen}
                  onOpenChange={setDrawerOpen}
                  dismissible={false}
                >
                  <DrawerTrigger asChild>
                    <Button className={cn(isSidebarOpen === false && 'p-2 h-8')} title="Notes">
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
                        <div className="flex items-center w-full gap-1">
                          <h2 className="text-lg font-bold grow">Notes</h2>
                          <span className="text-sm text-muted-foreground">{notes.length}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => {
                              setDrawerOpen(false)
                              setIsSearchOpen(true)
                              setSearchQuery('')
                              setSearchFocusIdx(0)
                            }}
                            title={t('searchByNoteNameOrNoteBody')}
                          >
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                              <circle
                                cx="6.5"
                                cy="6.5"
                                r="4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                              />
                              <path
                                d="M10.5 10.5L14 14"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                            </svg>
                          </Button>
                        </div>
                      </div>

                      <div className="grow overflow-y-auto px-3">
                        <ScrollArea type="always" className="h-full">
                          <div className="flex flex-col h-full items-start text-left text-sm py-1">
                            {notes.map((note, index) => {
                              return (
                                <NoteCard
                                  key={note.id}
                                  note={note}
                                  index={index}
                                  isActive={currentNote?.id === note.id}
                                  isRenaming={renamingNoteId === note.id}
                                  onClick={onNoteCardClick}
                                  onNoteCardSetName={onNoteCardSetName}
                                  onDeleteNote={DeleteNote}
                                  onRenameStart={(note) => setRenamingNoteId(note.id)}
                                  onRenameEnd={() => setRenamingNoteId(null)}
                                />
                              )
                            })}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
                <Button
                  className="p-2 h-8"
                  onClick={() => {
                    setIsSearchOpen(true)
                    setSearchQuery('')
                    setSearchFocusIdx(0)
                  }}
                  title={t('searchByNoteNameOrNoteBody')}
                >
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                    <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M10.5 10.5L14 14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </Button>
              </div>
            )}
          </div>

          <div className="flex-shrink border-t h-8">
            <Dialog open={globalSettingsOpen} onOpenChange={setGlobalSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex rounded-none gap-1 w-full h-full items-center justify-center text-sm"
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
                  <GlobalSettingsTabs
                    settingsForm={settingsForm}
                    onClose={() => setGlobalSettingsOpen(false)}
                  />
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
            <AboutDialog
              open={aboutOpen}
              onOpenChange={setAboutOpen}
              theme={currentNoteEditorSettings.themeName}
            />
          </div>
          {isSidebarOpen && (
            <div
              className="absolute inset-y-0 right-0 translate-x-1/2 w-2 cursor-col-resize hover:bg-primary/20 transition-colors z-10 select-none !mt-0"
              onMouseDown={handleResizeMouseDown}
              onDoubleClick={handleResizeDoubleClick}
            />
          )}
        </div>
        <div className="flex h-full flex-1 min-w-0">
          {noteTabs.length === 0 ? (
            <div className="flex flex-col items-center w-full h-full min-h-0 overflow-y-auto bg-muted/30">
              <div className="text-center max-w-lg px-8 my-auto py-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <img src={appWelcomeIcon} alt="Leavepad" className="w-24 h-24" />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-semibold mb-4 text-foreground">{t('welcomeTitle')}</h1>

                {/* Description */}
                <p className="text-muted-foreground mb-4">{t('welcomeDescription')}</p>

                {/* Action Buttons */}
                <div className="inline-flex flex-col gap-3 mb-4">
                  <Button size="lg" onClick={AddNote} className="flex items-center gap-2">
                    <span className="codicon codicon-new-file"></span>
                    <span>{t('createNote')}</span>
                  </Button>

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

                  {typeof window.api?.openJsonFormatter === 'function' && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => window.api.openJsonFormatter()}
                      className="flex items-center gap-2"
                    >
                      <span className="codicon codicon-json"></span>
                      <span>{t('jsonTool')}</span>
                    </Button>
                  )}
                </div>

                {/* Hint Text */}
                <p className="text-sm text-muted-foreground mb-3">{t('welcomeHint')}</p>

                {/* Version */}
                <p className="text-xs text-muted-foreground/50 mt-6">
                  v{window.api.getAppVersion()}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col w-full h-full">
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

              <div className="flex-shrink border-t h-8">
                <div className="flex w-full h-full gap-3 justify-between px-3 text-sm items-center">
                  <div className="flex gap-3">
                    <div>
                      {t('line')}: {cursorPosition?.line}
                    </div>
                    <div>
                      {t('col')}: {cursorPosition?.col}
                    </div>
                  </div>
                  {currentNote &&
                    (() => {
                      const currentLanguage =
                        currentNote.language || currentNoteEditorSettings.editorOptions.language
                      const currentLanguageDisplayName =
                        monaco.languages.getLanguages().find((l) => l.id === currentLanguage)
                          ?.aliases?.[0] || currentLanguage
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
                                        setNotes(
                                          notes.map((n) =>
                                            n.id === currentNote.id ? updatedNote : n
                                          )
                                        )
                                      }}
                                    >
                                      {t('defaultLanguage')} (
                                      {monaco.languages
                                        .getLanguages()
                                        .find(
                                          (l) =>
                                            l.id ===
                                            currentNoteEditorSettings.editorOptions.language
                                        )?.aliases?.[0] ||
                                        currentNoteEditorSettings.editorOptions.language}
                                      )
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
                                            const updatedNote = {
                                              ...currentNote,
                                              language: lang.id
                                            }
                                            await window.api.updateNote(updatedNote)
                                            setCurrentNote(updatedNote)
                                            setNotes(
                                              notes.map((n) =>
                                                n.id === currentNote.id ? updatedNote : n
                                              )
                                            )
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
        {/* Search overlay */}
        {isSearchOpen && (
          <div
            className="absolute inset-0 z-40 bg-black/35"
            onClick={() => {
              setIsSearchOpen(false)
              setSearchQuery('')
            }}
          />
        )}

        {/* Spotlight search modal */}
        {isSearchOpen &&
          (() => {
            const results = filterNotesByQuery(notes, searchQuery)
            const focusedIdx = Math.min(searchFocusIdx, results.length - 1)

            const escapeHtml = (str: string) =>
              str.replace(
                /[&<>"]/g,
                (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c
              )
            const highlight = (text: string, query: string) => {
              if (!query) return escapeHtml(text)
              try {
                const escaped = escapeHtml(text)
                return escaped.replace(
                  new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
                  (m) =>
                    `<mark class="bg-yellow-200 dark:bg-yellow-700 text-inherit rounded px-px">${m}</mark>`
                )
              } catch {
                return escapeHtml(text)
              }
            }

            return (
              <div
                className="absolute top-12 left-1/2 -translate-x-1/2 w-[85%] max-w-[720px] bg-background border border-border rounded-lg z-50 overflow-hidden shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Input row */}
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="text-muted-foreground shrink-0"
                  >
                    <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
                    <path
                      d="M10.5 10.5L14 14"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <Input
                    className="flex-1 text-base border-none bg-transparent shadow-none focus-visible:ring-0 p-0 h-auto"
                    placeholder={t('searchByNoteNameOrNoteBody')}
                    value={searchQuery}
                    autoFocus
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setSearchFocusIdx(0)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsSearchOpen(false)
                        setSearchQuery('')
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        setSearchFocusIdx((i) => Math.min(i + 1, results.length - 1))
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        setSearchFocusIdx((i) => Math.max(i - 1, 0))
                      } else if (e.key === 'Enter' && results.length > 0) {
                        const note = results[focusedIdx]
                        if (note) {
                          onNoteCardClick(note)
                          setIsSearchOpen(false)
                          setSearchQuery('')
                        }
                      }
                    }}
                  />
                </div>

                {/* Results */}
                <div className="max-h-[300px] overflow-y-auto">
                  {results.length === 0 ? (
                    <div className="py-5 text-center text-sm text-muted-foreground">
                      No matching notes found.
                    </div>
                  ) : (
                    results.map((note, i) => (
                      <div
                        key={note.id}
                        className={cn(
                          'px-4 py-2.5 cursor-pointer border-l-2 transition-colors',
                          i === focusedIdx
                            ? 'bg-accent border-l-foreground'
                            : 'border-l-transparent hover:bg-accent'
                        )}
                        onClick={() => {
                          onNoteCardClick(note)
                          setIsSearchOpen(false)
                          setSearchQuery('')
                        }}
                        onMouseEnter={() => setSearchFocusIdx(i)}
                      >
                        <div className="flex items-center gap-1.5">
                          <FileText className="shrink-0 h-3.5 w-3.5 text-muted-foreground" />
                          <div
                            className="text-sm font-medium text-foreground"
                            dangerouslySetInnerHTML={{ __html: highlight(note.name, searchQuery) }}
                          />
                        </div>
                        {note.body.length > 0 && (
                          <div
                            className="text-xs text-muted-foreground mt-0.5 truncate"
                            dangerouslySetInnerHTML={{
                              __html: highlight(note.body.slice(0, 80), searchQuery)
                            }}
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                <div className="px-4 py-1.5 border-t border-border flex gap-3 text-xs text-muted-foreground">
                  <span>↑↓ {t('search.navigate')}</span>
                  <span>Enter {t('search.select')}</span>
                  <span>Esc {t('search.close')}</span>
                </div>
              </div>
            )
          })()}
        </div>
      </div>
    </TooltipProvider>
  )
}

export default App
