import { atom } from 'jotai'
import { Note } from '../types'
import { leavepadStore } from '@renderer/main'

export const notesAtom = atom<Note[]>([])
export const currentNoteAtom = atom<Note | null>(null)

export const clearCurrentNote = () => {
  leavepadStore.set(currentNoteAtom, null)
}
