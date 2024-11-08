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
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from './ui/alert-dialog'
import { currentNoteEditorSettingsAtom } from '@renderer/lib/atoms/note-editor-settings'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'

function NoteCard({ note, onClick, onNoteCardSetName, onDeleteNote }): JSX.Element {
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
        'flex flex-col w-full items-start gap-2 border rounded-sm px-3 py-2 text-left text-sm transition-all hover:bg-accent group'
      )}
      onClick={() => onClick(note)}
    >
      <div className="flex w-full gap-1 justify-center">
        <button className="flex items-center flex-grow truncate">
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.nativeEvent.isComposing === false) {
                    saveNoteCardName(note)
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
              onClick={(_e) => {
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
              onClick={(_e) => {
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
                <AlertDialogTitle className="flex items-center gap-2">
                  <div className="codicon codicon-warning"></div>
                  <div>{t('deleteAlertDialogTitleMessage', { noteName: note.name })}</div>
                </AlertDialogTitle>
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

      <div className="flex flex-col w-full">
        <div className="grid grid-rows-1 grid-cols-3 space-x-1 justify-start text-muted-foreground text-xs">
          <div className="text-nowrap truncate">
            <div className="flex">
              <div>{t('createdAt')}</div>
              <div className="grow text-right">:</div>
            </div>
          </div>
          <div
            className="col-span-2 text-nowrap truncate font-mono"
            title={formatToISO8601(note.createdAt)}
          >
            {formatToRecent(note.createdAt)}
          </div>
        </div>
        <div className="grid grid-rows-1 grid-cols-3 space-x-1 justify-start text-muted-foreground text-xs">
          <div className="text-nowrap truncate">
            <div className="flex">
              <div>{t('updatedAt')}</div>
              <div className="grow text-right">:</div>
            </div>
          </div>
          <div
            className="col-span-2 text-nowrap truncate font-mono"
            title={formatToISO8601(note.updatedAt)}
          >
            {formatToRecent(note.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoteCard
