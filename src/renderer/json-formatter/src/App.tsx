import { useCallback, useEffect, useRef, useState } from 'react'
import { Editor, loader } from '@monaco-editor/react'
import { editor } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import { Button } from './components/ui/button'

// Monaco Editor Workers initialization
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    return new editorWorker()
  }
}
loader.config({ monaco })

type Layout = 'horizontal' | 'vertical'

type IndentOption = { label: string; indent: string | number }

const INDENT_OPTIONS: IndentOption[] = [
  { label: '2 spaces', indent: 2 },
  { label: '4 spaces', indent: 4 },
  { label: '1 tab', indent: '\t' }
]

type ParseResult =
  | { valid: true; formatted: string }
  | { valid: false; error: string; line?: number; column?: number }

function parseJson(value: string, indent: string | number): ParseResult {
  try {
    const parsed = JSON.parse(value)
    return { valid: true, formatted: JSON.stringify(parsed, null, indent) }
  } catch (e) {
    const msg = (e as SyntaxError).message
    const lineColMatch = msg.match(/at line (\d+) column (\d+)/)
    return {
      valid: false,
      error: msg,
      line: lineColMatch ? parseInt(lineColMatch[1]) : undefined,
      column: lineColMatch ? parseInt(lineColMatch[2]) : undefined
    }
  }
}

function App(): JSX.Element {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [lineCount, setLineCount] = useState<number>(0)
  const [charCount, setCharCount] = useState<number>(0)
  const [layout, setLayout] = useState<Layout>('horizontal')
  const [monacoTheme, setMonacoTheme] = useState<string>('vs')
  const [saveToastVisible, setSaveToastVisible] = useState(false)
  const [copyToastVisible, setCopyToastVisible] = useState(false)
  const [indentOption, setIndentOption] = useState<IndentOption>(INDENT_OPTIONS[0])

  // Apply theme from Note Editor settings
  useEffect(() => {
    window.jsonFormatterApi.getSettings().then((settings) => {
      if (settings.themeName === 'vs-dark') {
        setMonacoTheme('vs-dark')
        document.documentElement.classList.add('dark')
      } else {
        setMonacoTheme('vs')
        document.documentElement.classList.remove('dark')
      }
    })
  }, [])

  const handleEditorDidMount = useCallback((monacoEditor: editor.IStandaloneCodeEditor) => {
    editorRef.current = monacoEditor
    monacoEditor.focus()

    monaco.editor.remeasureFonts()
    document.fonts.addEventListener('loadingdone', () => {
      monaco.editor.remeasureFonts()
    })
  }, [])

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!value?.trim()) {
      setResult(null)
      setLineCount(0)
      setCharCount(0)
      return
    }
    setResult(parseJson(value, indentOption.indent))
    setLineCount(value.split('\n').length)
    setCharCount(value.length)
  }, [indentOption])

  const formatJson = useCallback(() => {
    if (!editorRef.current) return
    const value = editorRef.current.getValue()
    if (!value.trim()) return
    const r = parseJson(value, indentOption.indent)
    if (r.valid) {
      editorRef.current.setValue(r.formatted)
    }
  }, [indentOption])

  const copyToClipboard = useCallback(async () => {
    if (!result?.valid) return
    await navigator.clipboard.writeText(result.formatted)
    setCopyToastVisible(true)
    setTimeout(() => setCopyToastVisible(false), 2000)
  }, [result])

  const clearEditor = useCallback(() => {
    if (!editorRef.current) return
    editorRef.current.setValue('')
    setResult(null)
    setLineCount(0)
    setCharCount(0)
    editorRef.current.focus()
  }, [])

  const saveAsNote = useCallback(async () => {
    if (!result?.valid) return
    await window.jsonFormatterApi.saveAsNote(result.formatted)
    setSaveToastVisible(true)
    setTimeout(() => setSaveToastVisible(false), 2000)
  }, [result])

  const toggleLayout = useCallback(() => {
    setLayout((l) => (l === 'horizontal' ? 'vertical' : 'horizontal'))
  }, [])

  const handleIndentChange = useCallback((option: IndentOption) => {
    setIndentOption(option)
    // Re-parse with new indent if there's content
    if (!editorRef.current) return
    const value = editorRef.current.getValue()
    if (!value?.trim()) return
    setResult(parseJson(value, option.indent))
  }, [])

  // Ctrl+S to format
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const isMod = e.ctrlKey || e.metaKey
      if (isMod && e.key === 's') {
        e.preventDefault()
        formatJson()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [formatJson])

  const isHorizontal = layout === 'horizontal'

  const editorOptions: editor.IStandaloneEditorConstructionOptions = {
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily:
      "NOTONOTO, HackGen, Consolas, Menlo, Monaco, 'Courier New', 'Droid Sans Mono', 'monospace', monospace, 'Noto Sans JP', 'Noto Color Emoji'",
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'off',
    scrollBeyondLastLine: false,
    renderWhitespace: 'selection',
    padding: { top: 5, bottom: 5 }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Toast Notifications */}
      {copyToastVisible && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded shadow-md">
          Copied to clipboard
        </div>
      )}
      {saveToastVisible && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded shadow-md">
          Saved as note
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/30">
        <Button
          onClick={formatJson}
          size="sm"
          variant="default"
          title="Format JSON (Ctrl+S)"
        >
          <span className="codicon codicon-symbol-namespace"></span>
          Format
        </Button>
        <Button
          onClick={clearEditor}
          size="sm"
          variant="outline"
          title="Clear editor"
        >
          <span className="codicon codicon-clear-all"></span>
          Clear
        </Button>

        {/* Indent selector */}
        <div className="w-px h-4 bg-border mx-1" />
        <select
          value={INDENT_OPTIONS.indexOf(indentOption)}
          onChange={(e) => handleIndentChange(INDENT_OPTIONS[parseInt(e.target.value)])}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          title="Indentation"
        >
          {INDENT_OPTIONS.map((opt, i) => (
            <option key={opt.label} value={i}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex-1" />
        <Button
          onClick={toggleLayout}
          size="sm"
          variant="ghost"
          title="Toggle layout"
        >
          <span className={`codicon ${isHorizontal ? 'codicon-split-vertical' : 'codicon-split-horizontal'}`}></span>
          {isHorizontal ? 'Split ↕' : 'Split ↔'}
        </Button>
        <Button
          onClick={copyToClipboard}
          size="sm"
          variant="outline"
          disabled={!result?.valid}
          title="Copy formatted JSON"
        >
          <span className="codicon codicon-copy"></span>
          Copy
        </Button>
        <Button
          onClick={saveAsNote}
          size="sm"
          variant="outline"
          disabled={!result?.valid}
          title="Save as note in Note Editor"
        >
          <span className="codicon codicon-save"></span>
          Save as Note
        </Button>
      </div>

      {/* Panes */}
      <div className={`flex flex-1 overflow-hidden ${isHorizontal ? 'flex-row' : 'flex-col'}`}>
        {/* Input Pane */}
        <div className={`${isHorizontal ? 'w-1/2 border-r' : 'h-1/2 border-b'} overflow-hidden`}>
          <Editor
            height="100%"
            defaultLanguage="json"
            defaultValue=""
            theme={monacoTheme}
            options={editorOptions}
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
          />
        </div>

        {/* Output Pane */}
        <div className={`${isHorizontal ? 'w-1/2' : 'h-1/2'} overflow-hidden`}>
          {result === null ? null : result.valid ? (
            // Valid: formatted JSON (read-only)
            <Editor
              height="100%"
              language="json"
              value={result.formatted}
              theme={monacoTheme}
              options={{
                ...editorOptions,
                readOnly: true
              }}
            />
          ) : (
            // Invalid: error display
            <div
              className="flex flex-col items-start justify-start p-6 h-full text-sm font-mono"
              style={{ backgroundColor: monacoTheme === 'vs-dark' ? '#1e1e1e' : '#ffffff' }}
            >
              <div className="flex items-center gap-2 mb-4 text-base font-semibold text-red-500">
                <span className="codicon codicon-error"></span>
                <span>Invalid JSON</span>
              </div>
              <p className="text-red-400 mb-2 break-all">{result.error}</p>
              {(result.line != null || result.column != null) && (
                <p className="text-muted-foreground text-xs mt-1">
                  {result.line != null && `Line ${result.line}`}
                  {result.line != null && result.column != null && ', '}
                  {result.column != null && `Column ${result.column}`}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 text-xs border-t bg-muted/30 text-muted-foreground">
        <div className="flex items-center gap-3">
          {result === null ? (
            <span>Ready</span>
          ) : result.valid ? (
            <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
              <span className="codicon codicon-pass"></span>
              <span>Valid JSON</span>
            </span>
          ) : (
            <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
              <span className="codicon codicon-error"></span>
              <span>Invalid JSON</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>Lines: {lineCount}</span>
          <span>Size: {(charCount / 1024).toFixed(1)} KB</span>
        </div>
      </div>
    </div>
  )
}

export default App
