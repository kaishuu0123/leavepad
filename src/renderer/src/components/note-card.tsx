import { cn } from '@renderer/lib/utils'
import { Button } from './ui/button'
import { useState } from 'react'
import { Input } from './ui/input'
import { formatToISO8601, formatToRecent } from '@renderer/lib/formatDateTime'
import * as runes from 'runes'
import { Note } from '../../../types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from './ui/alert-dialog'
import { currentNoteEditorSettingsAtom } from '@renderer/lib/atoms/note-editor-settings'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'

function NoteCard({ note, onClick, onNoteCardSetName, onDeleteNote, index }): JSX.Element {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [noteName, setNoteName] = useState(note.name)
  const [currentNoteEditorSettings, _] = useAtom(currentNoteEditorSettingsAtom)

  const saveNoteCardName = async (note: Note) => {
    setEditing(false)
    onNoteCardSetName(note, noteName)
  }

  return (
    <div
      key={note.id}
      className={cn(
        'flex flex-col w-full items-start gap-1 border rounded-sm px-3 py-2 text-left text-sm transition-all hover:bg-accent group'
      )}
      role="button"
      tabIndex={index}
      onClick={() => onClick(note)}
    >
      <div className="flex w-full gap-1 justify-center">
        {/*
         * Reason for specifying 'truncate w-0'
         * refs: https://github.com/radix-ui/primitives/issues/926#issuecomment-2763624511
         */}
        <button className="flex items-center flex-grow truncate w-0">
          <div className="flex items-center truncate min-h-6">
            {editing ? (
              <Input
                type="text"
                className="bg-background"
                defaultValue={note.name}
                onChange={(e) => setNoteName(e.target.value)}
                onBlur={(_e) => {
                  saveNoteCardName(note)
                }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.nativeEvent.isComposing === false) {
                    saveNoteCardName(note)
                  }
                }}
                // HACK
                //   Disable click events by doing preventDefault on onKeyUp.
                //   If do preventDefault on onKeyDown, can't input space character.
                //   refs: https://stackoverflow.com/questions/22280139/prevent-space-button-from-triggering-any-other-button-click-in-jquery
                onKeyUp={(e) => {
                  if (e.key === ' ') {
                    // Prevent for onClick
                    e.preventDefault()
                  }
                }}
                autoFocus={true}
              />
            ) : (
              <span className="text-sm font-semibold align-middle truncate">{note.name}</span>
            )}
          </div>
        </button>
        <div className="items-center gap-1 hidden group-hover:flex">
          {editing ? (
            <Button
              key="save"
              variant="outline"
              size="icon"
              title={t('save')}
              className="w-6 h-6"
              onClick={(e) => {
                e.stopPropagation()
                saveNoteCardName(note)
              }}
            >
              <div className="codicon codicon-check"></div>
            </Button>
          ) : (
            <Button
              key="edit"
              variant="outline"
              size="icon"
              title={t('rename')}
              className="w-6 h-6"
              onClick={(e) => {
                e.stopPropagation()
                setEditing(true)
              }}
            >
              <div className="codicon codicon-edit"></div>
            </Button>
          )}

          {/* <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                title="Info"
                className="w-6 h-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="codicon codicon-info"></div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-50">
              <div className="grid">
                <div className="text-muted-foreground text-right text-xs">
                  CreatedAt: {formatDateTimeWithTimezone(note.createdAt)}
                </div>
                <div className="text-muted-foreground text-right text-xs">
                  UpdatedAt: {formatDateTimeWithTimezone(note.updatedAt)}
                </div>
              </div>
            </PopoverContent>
          </Popover> */}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-6 h-6"
                title={t('delete')}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="codicon codicon-trash"></div>
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent
              className={cn(
                'bg-background text-foreground',
                currentNoteEditorSettings.themeName === 'dark' && 'dark'
              )}
            >
              <AlertDialogHeader>
                <AlertDialogTitle>Delete note?</AlertDialogTitle>
                <AlertDialogDescription className="flex items-center gap-2">
                  <div className="codicon codicon-warning"></div>
                  <div>{t('deleteAlertDialogTitleMessage', { noteName: note.name })}</div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={(_e) => onDeleteNote(note)}>
                  {t('ok')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="w-full">
        {note.body.length > 0 ? (
          <span className="text-xs text-wrap break-all text-muted-foreground">
            {runes.substr(note.body, 0, 40)} {note.body.length > 40 ? '...' : ''}
          </span>
        ) : (
          <></>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[min-content_min-content_1fr] gap-x-0.5 text-muted-foreground text-xs">
        <div className="grid grid-cols-subgrid col-span-full">
          <div className="text-nowrap truncate">{t('createdAt')}</div>
          <div className="hidden sm:block">:</div>
          <div className="text-nowrap truncate font-mono" title={formatToISO8601(note.createdAt)}>
            {formatToRecent(note.createdAt)}
          </div>
        </div>
        <div className="grid grid-cols-subgrid col-span-full">
          <div className="text-nowrap truncate">{t('updatedAt')}</div>
          <div className="hidden sm:block">:</div>
          <div className="text-nowrap truncate font-mono" title={formatToISO8601(note.updatedAt)}>
            {formatToRecent(note.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoteCard
