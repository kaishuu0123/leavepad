import { atom } from 'jotai'
import { FileTab } from '../../../../../types'

// All open file tabs
export const fileTabsAtom = atom<FileTab[]>([])

// Currently active tab ID
export const activeTabIdAtom = atom<string | null>(null)

// Derived atom: current active tab
export const activeTabAtom = atom((get) => {
  const tabs = get(fileTabsAtom)
  const activeId = get(activeTabIdAtom)
  if (!activeId) return null
  return tabs.find((tab) => tab.id === activeId) || null
})

// Check if any tab has unsaved changes
export const hasUnsavedChangesAtom = atom((get) => {
  const tabs = get(fileTabsAtom)
  return tabs.some((tab) => tab.isModified)
})

// Get all unsaved tabs
export const unsavedTabsAtom = atom((get) => {
  const tabs = get(fileTabsAtom)
  return tabs.filter((tab) => tab.isModified)
})
