import { useAtom } from 'jotai'
import { useCallback, useEffect, useRef, useState } from 'react'
import { uuidv7 } from 'uuidv7'
import { editor } from 'monaco-editor'
import { FileTab } from '../../../types'
import { fileTabsAtom, activeTabIdAtom, activeTabAtom, unsavedTabsAtom } from './lib/atoms/files'
import { detectLanguageFromFileName } from './lib/languageDetection'
import FileTabs from './components/file-tabs'
import FileEditor, { initializeFileEditor } from './components/file-editor'

// Simple basename function for browser environment
function basename(filePath: string): string {
  const parts = filePath.split(/[/\\]/)
  return parts[parts.length - 1] || filePath
}

// Initialize Monaco editor workers
initializeFileEditor()

function App(): JSX.Element {
  const [fileTabs, setFileTabs] = useAtom(fileTabsAtom)
  const [activeTabId, setActiveTabId] = useAtom(activeTabIdAtom)
  const [activeTab] = useAtom(activeTabAtom)
  const [unsavedTabs] = useAtom(unsavedTabsAtom)
  const editorRef = useRef<editor.IStandaloneCodeEditor | undefined>()
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounterRef = useRef(0)

  const language = activeTab ? detectLanguageFromFileName(activeTab.fileName) : 'plaintext'

  // Update window title based on active tab
  useEffect(() => {
    if (activeTab) {
      const modifiedMark = activeTab.isModified ? ' *' : ''
      const title = `${activeTab.fileName}${modifiedMark} - File Editor - Leavepad`
      window.fileEditorApi.updateTitle(title)
    } else {
      window.fileEditorApi.updateTitle('File Editor - Leavepad')
    }
  }, [activeTab?.fileName, activeTab?.isModified])

  // Open file dialog and add new tab
  const handleOpenFile = useCallback(async (): Promise<void> => {
    const fileInfo = await window.fileEditorApi.openFileDialog()
    if (!fileInfo) return

    // Check if file is already open
    const existingTab = fileTabs.find((tab) => tab.filePath === fileInfo.filePath)
    if (existingTab) {
      setActiveTabId(existingTab.id)
      return
    }

    // Create new tab
    const newTab: FileTab = {
      id: uuidv7(),
      filePath: fileInfo.filePath,
      fileName: fileInfo.fileName,
      content: fileInfo.content,
      originalContent: fileInfo.content,
      isModified: false
    }

    setFileTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [fileTabs, setFileTabs, setActiveTabId])

  // Create new file
  const handleNewFile = useCallback((): void => {
    // Generate a unique untitled file name
    const existingUntitledFiles = fileTabs.filter((tab) => tab.fileName.startsWith('Untitled-'))
    const maxNumber = existingUntitledFiles.reduce((max, tab) => {
      const match = tab.fileName.match(/^Untitled-(\d+)$/)
      if (match) {
        return Math.max(max, parseInt(match[1], 10))
      }
      return max
    }, 0)
    const newFileName = `Untitled-${maxNumber + 1}`

    // Create new tab
    const newTab: FileTab = {
      id: uuidv7(),
      filePath: '', // No file path yet (unsaved)
      fileName: newFileName,
      content: '',
      originalContent: '',
      isModified: false
    }

    setFileTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [fileTabs, setFileTabs, setActiveTabId])

  // Open file from path (called from main process via menu or drag & drop)
  const handleOpenFilePath = useCallback(
    async (filePath: string): Promise<void> => {
      // Check if file is already open
      const existingTab = fileTabs.find((tab) => tab.filePath === filePath)
      if (existingTab) {
        setActiveTabId(existingTab.id)
        return
      }

      try {
        const fileInfo = await window.fileEditorApi.readFile(filePath)

        const newTab: FileTab = {
          id: uuidv7(),
          filePath: fileInfo.filePath,
          fileName: fileInfo.fileName,
          content: fileInfo.content,
          originalContent: fileInfo.content,
          isModified: false
        }

        setFileTabs((prev) => [...prev, newTab])
        setActiveTabId(newTab.id)
      } catch (error) {
        console.error('Failed to open file:', filePath, error)
      }
    },
    [fileTabs, setFileTabs, setActiveTabId]
  )

  // Drag & Drop handlers
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

  const handleDrop = useCallback(
    async (e: React.DragEvent): Promise<void> => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current = 0
      setIsDragOver(false)

      const files = e.dataTransfer.files
      if (files.length === 0) return

      // Open each dropped file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // Use Electron's webUtils to get the file path
        const filePath = window.fileEditorApi.getPathForFile(file)
        if (filePath) {
          await handleOpenFilePath(filePath)
        }
      }
    },
    [handleOpenFilePath]
  )

  // Save current file
  const handleSaveFile = useCallback(async (): Promise<boolean> => {
    if (!activeTab) return false

    let filePath = activeTab.filePath

    // If no file path (new file), show save dialog
    if (!filePath) {
      const savedPath = await window.fileEditorApi.saveDialog(activeTab.fileName)
      if (!savedPath) return false
      filePath = savedPath
    }

    // Write file
    await window.fileEditorApi.writeFile(filePath, activeTab.content)

    // Update tab state
    setFileTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              filePath,
              fileName: basename(filePath!),
              originalContent: tab.content,
              isModified: false
            }
          : tab
      )
    )

    return true
  }, [activeTab, setFileTabs])

  // Save As
  const handleSaveAs = useCallback(async (): Promise<void> => {
    if (!activeTab) return

    const savedPath = await window.fileEditorApi.saveDialog(activeTab.fileName)
    if (!savedPath) return

    await window.fileEditorApi.writeFile(savedPath, activeTab.content)

    setFileTabs((prev) =>
      prev.map((tab) =>
        tab.id === activeTab.id
          ? {
              ...tab,
              filePath: savedPath,
              fileName: basename(savedPath),
              originalContent: tab.content,
              isModified: false
            }
          : tab
      )
    )
  }, [activeTab, setFileTabs])

  // Close tab with confirmation if modified
  const handleCloseTab = useCallback(
    async (tabId: string): Promise<boolean> => {
      const tab = fileTabs.find((t) => t.id === tabId)
      if (!tab) return true

      if (tab.isModified) {
        const result = await window.fileEditorApi.confirmClose(tab.fileName)
        if (result === 'cancel') return false
        if (result === 'save') {
          // Save the file first
          let filePath = tab.filePath
          if (!filePath) {
            const savedPath = await window.fileEditorApi.saveDialog(tab.fileName)
            if (!savedPath) return false
            filePath = savedPath
          }
          await window.fileEditorApi.writeFile(filePath, tab.content)
        }
      }

      // Remove tab
      setFileTabs((prev) => prev.filter((t) => t.id !== tabId))

      // If closing active tab, switch to another tab
      if (tabId === activeTabId) {
        const remainingTabs = fileTabs.filter((t) => t.id !== tabId)
        if (remainingTabs.length > 0) {
          setActiveTabId(remainingTabs[remainingTabs.length - 1].id)
        } else {
          setActiveTabId(null)
        }
      }

      return true
    },
    [fileTabs, activeTabId, setFileTabs, setActiveTabId]
  )

  // Handle window close request
  const handleWindowCloseRequest = useCallback(async (): Promise<void> => {
    // Check all unsaved tabs
    for (const tab of unsavedTabs) {
      const result = await window.fileEditorApi.confirmClose(tab.fileName)
      if (result === 'cancel') {
        window.fileEditorApi.cancelClose()
        return
      }
      if (result === 'save') {
        let filePath = tab.filePath
        if (!filePath) {
          const savedPath = await window.fileEditorApi.saveDialog(tab.fileName)
          if (!savedPath) {
            window.fileEditorApi.cancelClose()
            return
          }
          filePath = savedPath
        }
        await window.fileEditorApi.writeFile(filePath, tab.content)
      }
    }

    // All confirmed, close the window
    window.fileEditorApi.confirmCloseComplete()
  }, [unsavedTabs])

  // Editor change handler
  const handleEditorChange = useCallback(
    (tabId: string, value: string): void => {
      setFileTabs((prev) =>
        prev.map((tab) => {
          if (tab.id === tabId) {
            return {
              ...tab,
              content: value,
              isModified: value !== tab.originalContent
            }
          }
          return tab
        })
      )
    },
    [setFileTabs]
  )

  const handleCursorPositionChange = useCallback(
    (_event: editor.ICursorPositionChangedEvent): void => {
      // Cursor position tracking could be added here if needed
    },
    []
  )

  // Setup IPC listeners
  useEffect(() => {
    const unsubscribeClose = window.fileEditorApi.onRequestClose(handleWindowCloseRequest)
    const unsubscribeOpenFile = window.fileEditorApi.onOpenFilePath(handleOpenFilePath)

    return () => {
      unsubscribeClose()
      unsubscribeOpenFile()
    }
  }, [handleWindowCloseRequest, handleOpenFilePath])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const isMod = e.ctrlKey || e.metaKey

      if (isMod && e.key === 'n') {
        e.preventDefault()
        handleNewFile()
      } else if (isMod && e.key === 'o' && !e.shiftKey) {
        e.preventDefault()
        handleOpenFile()
      } else if (isMod && e.key === 's' && !e.shiftKey) {
        e.preventDefault()
        handleSaveFile()
      } else if (isMod && e.key === 's' && e.shiftKey) {
        e.preventDefault()
        handleSaveAs()
      } else if (isMod && e.key === 'w') {
        e.preventDefault()
        if (activeTabId) {
          handleCloseTab(activeTabId)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNewFile, handleOpenFile, handleSaveFile, handleSaveAs, handleCloseTab, activeTabId])

  return (
    <div
      className="flex flex-col h-screen relative"
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
            <p className="text-lg font-medium text-primary">Drop files here to open</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/30">
        <button
          onClick={handleNewFile}
          className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-muted"
          title="New File (Ctrl+N)"
        >
          <span className="codicon codicon-file-add"></span>
          <span>New</span>
        </button>
        <button
          onClick={handleOpenFile}
          className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-muted"
          title="Open File (Ctrl+O)"
        >
          <span className="codicon codicon-folder-opened"></span>
          <span>Open</span>
        </button>
        <button
          onClick={handleSaveFile}
          className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-muted disabled:opacity-50"
          disabled={!activeTab}
          title="Save (Ctrl+S)"
        >
          <span className="codicon codicon-save"></span>
          <span>Save</span>
        </button>
        <button
          onClick={handleSaveAs}
          className="flex items-center gap-1 px-2 py-1 text-sm rounded hover:bg-muted disabled:opacity-50"
          disabled={!activeTab}
          title="Save As (Ctrl+Shift+S)"
        >
          <span className="codicon codicon-save-as"></span>
          <span>Save As</span>
        </button>
      </div>

      {/* Tabs */}
      <FileTabs
        fileTabs={fileTabs}
        activeTabId={activeTabId}
        onTabClick={setActiveTabId}
        onTabCloseClick={handleCloseTab}
        onTabReorder={setFileTabs}
      />

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <FileEditor
          ref={editorRef}
          currentTab={activeTab}
          language={language}
          onDidChangeCursorPosition={handleCursorPositionChange}
          onEditorChange={handleEditorChange}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 text-xs border-t bg-muted/30 text-muted-foreground">
        <div className="flex items-center gap-3">
          {activeTab && (
            <>
              <span>{activeTab.filePath || 'Untitled'}</span>
              {activeTab.isModified && <span className="text-yellow-600">Modified</span>}
            </>
          )}
        </div>
        <div className="flex items-center gap-3">{activeTab && <span>{language}</span>}</div>
      </div>
    </div>
  )
}

export default App
