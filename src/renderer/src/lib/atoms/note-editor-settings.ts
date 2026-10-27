import { atom } from 'jotai'
import { defaultNoteEditorSettings, type NoteEditorSettings } from '../../../../types'

export const currentNoteEditorSettingsAtom = atom<NoteEditorSettings>(defaultNoteEditorSettings)
