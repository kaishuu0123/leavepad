import { Editor, loader } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { ForwardedRef, forwardRef } from 'react'
import { FileTab } from '../../../../types'

export function initializeFileEditor(): void {
  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker()
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return new cssWorker()
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return new htmlWorker()
      }
      if (label === 'typescript' || label === 'javascript') {
        return new tsWorker()
      }
      return new editorWorker()
    }
  }

  loader.config({ monaco })
}

type FileEditorProps = {
  currentTab: FileTab | null
  language: string
  onDidChangeCursorPosition: (event: editor.ICursorPositionChangedEvent) => void
  onEditorChange: (tabId: string, value: string) => void
}

function FileEditor(
  { currentTab, language, onDidChangeCursorPosition, onEditorChange }: FileEditorProps,
  ref: ForwardedRef<editor.IStandaloneCodeEditor | undefined>
): JSX.Element {
  const handleEditorDidMount = (
    monacoEditor: editor.IStandaloneCodeEditor,
    _monaco: typeof monaco
  ): void => {
    if (ref == null) {
      return
    }
    if (typeof ref === 'function') {
      return
    }
    ref.current = monacoEditor

    if (ref.current != null) {
      ref.current.onDidChangeCursorPosition(onDidChangeCursorPosition)

      monaco.editor.remeasureFonts()
      document.fonts.addEventListener('loadingdone', () => {
        monaco.editor.remeasureFonts()
      })
    }
  }

  const handleEditorChange = (value: string | undefined, _event: editor.IModelContentChangedEvent): void => {
    if (currentTab != null && value !== undefined) {
      onEditorChange(currentTab.id, value)
    }
  }

  if (currentTab == null) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <div className="codicon codicon-file text-4xl mb-2"></div>
          <p>Open a file to start editing</p>
          <p className="text-sm mt-1">Ctrl+O or File &gt; Open File...</p>
        </div>
      </div>
    )
  }

  return (
    <Editor
      value={currentTab.content}
      language={language}
      theme="vs"
      options={{
        automaticLayout: true,
        minimap: { enabled: false },
        padding: { top: 5, bottom: 5 },
        fontSize: 14,
        fontFamily:
          "NOTONOTO, HackGen, Consolas, Menlo, Monaco, 'Courier New', 'Droid Sans Mono', 'monospace', monospace, 'Noto Sans JP', 'Noto Color Emoji'",
        wordWrap: 'off',
        renderWhitespace: 'selection',
        scrollBeyondLastLine: false
      }}
      onMount={handleEditorDidMount}
      onChange={handleEditorChange}
      path={currentTab.id}
    />
  )
}

export default forwardRef(FileEditor)
