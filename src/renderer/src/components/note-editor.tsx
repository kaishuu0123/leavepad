import { Editor, loader } from '@monaco-editor/react'
import { currentNoteEditorSettingsAtom } from '@renderer/lib/atoms/note-editor-settings'
import { Note } from '../../../types'
import { useAtom } from 'jotai'
import { editor } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import { ForwardedRef, forwardRef } from 'react'

export function initializeNoteEditor() {
  if ((self as unknown as { MonacoEnvironment?: unknown }).MonacoEnvironment) return
  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return import('monaco-editor/esm/vs/language/json/json.worker?worker').then(
          ({ default: JsonWorker }) => new JsonWorker()
        ) as unknown as Worker
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return import('monaco-editor/esm/vs/language/css/css.worker?worker').then(
          ({ default: CssWorker }) => new CssWorker()
        ) as unknown as Worker
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return import('monaco-editor/esm/vs/language/html/html.worker?worker').then(
          ({ default: HtmlWorker }) => new HtmlWorker()
        ) as unknown as Worker
      }
      if (label === 'typescript' || label === 'javascript') {
        return import('monaco-editor/esm/vs/language/typescript/ts.worker?worker').then(
          ({ default: TsWorker }) => new TsWorker()
        ) as unknown as Worker
      }
      return new editorWorker()
    }
  }

  loader.config({ monaco })
}

type NoteEditorProps = {
  currentNote: Note | null
  onDidChangeCursorPosition: (event: editor.ICursorPositionChangedEvent) => void
  onEditorChange: (currentNote: Note, value: string) => void
}

const getEditorThemeName = (themeName: 'light' | 'dark') => {
  switch (themeName) {
    case 'light':
      return 'vs'
    case 'dark':
      return 'vs-dark'
  }
}

function NoteEditor(
  { currentNote, onDidChangeCursorPosition, onEditorChange }: NoteEditorProps,
  ref: ForwardedRef<editor.IStandaloneCodeEditor | undefined>
): JSX.Element {
  const [settings] = useAtom(currentNoteEditorSettingsAtom)

  const handleEditorDidMount = (monacoEditor, _monaco) => {
    if (ref == null) {
      return
    }
    if (typeof ref === 'function') {
      return
    }
    // here is the editor instance
    // you can store it in `useRef` for further usage
    ref.current = monacoEditor

    if (ref.current != null) {
      ref.current.onDidChangeCursorPosition(onDidChangeCursorPosition)

      monacoEditor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyP,
        () => monacoEditor.getAction('editor.action.quickCommand')?.run()
      )

      monaco.editor.remeasureFonts()
      // Exec remeasureFonts func for custom fonts
      document.fonts.addEventListener('loadingdone', () => {
        monaco.editor.remeasureFonts()
      })

      // @ts-ignore for DEBUG
      window.editor = monacoEditor
      // @ts-ignore for DEBUG
      window.monaco = monaco
    }
  }

  const handleEditorChange = (value, _event) => {
    if (currentNote != null) {
      onEditorChange(currentNote, value)
    }
  }

  if (currentNote == null) {
    return <></>
  }

  const editorLanguage = currentNote.language || settings.editorOptions.language

  return (
    <Editor
      height="100%"
      value={currentNote.body}
      language={editorLanguage}
      theme={getEditorThemeName(settings.themeName)}
      options={settings.editorOptions}
      onMount={handleEditorDidMount}
      onChange={handleEditorChange}
      path={currentNote.id}
    />
  )
}

export default forwardRef(NoteEditor)

// Auto-initialize when this module is loaded
initializeNoteEditor()
