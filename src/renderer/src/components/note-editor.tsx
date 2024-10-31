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

  const handleEditorDidMount = (editor, _monaco) => {
    if (ref == null) {
      return
    }
    if (typeof ref === 'function') {
      return
    }
    // here is the editor instance
    // you can store it in `useRef` for further usage
    ref.current = editor

    if (ref.current != null) {
      ref.current.onDidChangeCursorPosition(onDidChangeCursorPosition)
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

  return (
    <Editor
      height="100%"
      value={currentNote.body}
      language={settings.editorOptions.language}
      theme={getEditorThemeName(settings.themeName)}
      options={settings.editorOptions}
      onMount={handleEditorDidMount}
      onChange={handleEditorChange}
      path={currentNote.id}
    />
  )
}

export default forwardRef(NoteEditor)
