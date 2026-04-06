import { Editor, loader } from '@monaco-editor/react'
import { currentNoteEditorSettingsAtom } from '@renderer/lib/atoms/note-editor-settings'
import { Note } from '../../../types'
import { useAtom } from 'jotai'
import { editor } from 'monaco-editor'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { ForwardedRef, forwardRef } from 'react'

export function initializeNoteEditor() {
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

      monacoEditor.addAction({
        id: 'format-json',
        label: 'Format JSON',
        run: (ed) => {
          const model = ed.getModel()
          if (model?.getLanguageId() === 'json') {
            ed.getAction('editor.action.formatDocument')?.run()
          } else {
            try {
              const content = ed.getValue()
              const parsed = JSON.parse(content)
              const formatted = JSON.stringify(parsed, null, 2)
              ed.setValue(formatted)
            } catch (e) {
              // silently fail for invalid JSON
            }
          }
        }
      })

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
