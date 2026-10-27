import { leavepadStore } from '@renderer/main'
import { atom } from 'jotai'
import type { Note } from '../../../../types'

export const notesAtom = atom<Note[]>([])
export const currentNoteAtom = atom<Note | null>(null)

export const clearCurrentNote = () => {
  leavepadStore.set(currentNoteAtom, null)
}
