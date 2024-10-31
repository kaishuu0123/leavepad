import { atom } from 'jotai'
import { defaultNoteEditorSettings, NoteEditorSettings } from '../../../../types'

export const currentNoteEditorSettingsAtom = atom<NoteEditorSettings>(defaultNoteEditorSettings)
