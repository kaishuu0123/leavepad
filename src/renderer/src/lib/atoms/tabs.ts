import { atom } from 'jotai'
import { NoteTab } from '../types'
import { clearCurrentNote } from './notes'
import { leavepadStore } from '@renderer/main'

export const noteTabsAtom = atom<NoteTab[]>([])
export const contextSelectedTabIdAtom = atom<string | undefined>()

export const onTabCloseClick = (tabId: string) => {
  const noteTabs = leavepadStore.get(noteTabsAtom)

  const newTabs = noteTabs.filter((tab, _index) => tab.id !== tabId)
  leavepadStore.set(noteTabsAtom, newTabs)
  clearCurrentNote()
}

export const onCloseTab = () => {
  const noteTabs = leavepadStore.get(noteTabsAtom)
  const contextSelectedTabId = leavepadStore.get(contextSelectedTabIdAtom)
  if (contextSelectedTabId == null) {
    return
  }

  const newTabs = noteTabs.filter((tab) => contextSelectedTabId !== tab.id)
  leavepadStore.set(noteTabsAtom, newTabs)
  clearCurrentNote()
}

export const onCloseOthersTab = () => {
  const noteTabs = leavepadStore.get(noteTabsAtom)
  const contextSelectedTabId = leavepadStore.get(contextSelectedTabIdAtom)
  if (contextSelectedTabId == null) {
    return
  }

  const newTabs = noteTabs.filter((tab) => contextSelectedTabId === tab.id)
  leavepadStore.set(noteTabsAtom, newTabs)
  clearCurrentNote()
}

export const onCloseToTheRightTab = () => {
  const noteTabs = leavepadStore.get(noteTabsAtom)
  const contextSelectedTabId = leavepadStore.get(contextSelectedTabIdAtom)
  if (contextSelectedTabId == null) {
    return
  }

  const index = noteTabs.findIndex((tab) => contextSelectedTabId === tab.id)
  leavepadStore.set(noteTabsAtom, [...noteTabs.slice(0, index + 1)])
  clearCurrentNote()
}

export const onCloseAllTab = () => {
  leavepadStore.set(noteTabsAtom, [])
  clearCurrentNote()
}
