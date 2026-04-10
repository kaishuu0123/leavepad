import { cn } from '@renderer/lib/utils'
import { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Note } from '../../../types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { currentNoteEditorSettingsAtom } from '@renderer/lib/atoms/note-editor-settings'
import { useAtom } from 'jotai'
import { useTranslation } from 'react-i18next'
import { FileText, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Separator } from './ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

type Props = {
  note: Note
  index: number
  isActive: boolean
  isRenaming: boolean
  onClick: (note: Note) => void
  onNoteCardSetName: (note: Note, title: string) => void
  onDeleteNote: (note: Note) => void
  onRenameStart: (note: Note) => void
  onRenameEnd: () => void
}

function NoteCard({
  note,
  index,
  isActive,
  isRenaming,
  onClick,
  onNoteCardSetName,
  onDeleteNote,
  onRenameStart,
  onRenameEnd
}: Props): JSX.Element {
  const { t } = useTranslation()
  const [noteName, setNoteName] = useState(note.name)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [currentNoteEditorSettings] = useAtom(currentNoteEditorSettingsAtom)

  useEffect(() => {
    if (isRenaming) {
      setNoteName(note.name)
    }
  }, [isRenaming])

  const saveNoteCardName = () => {
    onNoteCardSetName(note, noteName)
    onRenameEnd()
  }

  const bodyLines = note.body.split('\n')
  const previewText = bodyLines.slice(0, 5).join('\n')
  const isTruncated = bodyLines.length > 5
  const createdAtStr = note.createdAt ? format(new Date(note.createdAt), 'yyyy/MM/dd HH:mm') : ''
  const updatedAtStr = note.updatedAt ? format(new Date(note.updatedAt), 'yyyy/MM/dd HH:mm') : ''

  const cardClassName = cn(
    'flex items-center w-full px-2.5 py-1.5 cursor-pointer group border-l-2 transition-colors',
    isActive ? 'bg-accent border-l-foreground' : 'border-l-transparent hover:bg-accent'
  )

  const tooltipContent = (
    <TooltipContent side="right" align="start" className="max-w-[280px] p-0" sideOffset={20}>
      <div className="flex flex-col">
        <p className="px-3 py-2 text-xs font-medium">{note.name}</p>
        <Separator />
        <div className="px-3 py-2">
          {note.body.trim().length > 0 ? (
            <p className="font-mono text-xs whitespace-pre-wrap leading-relaxed">
              {isTruncated ? previewText + '\n…' : previewText}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">{t('emptyNote')}</p>
          )}
        </div>
        <Separator />
        <div className="px-3 py-2 flex flex-col gap-0.5 font-mono text-xs text-muted-foreground">
          <div className="flex justify-between gap-4">
            <span>{t('createdAt')}</span>
            <span>{createdAtStr}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>{t('updatedAt')}</span>
            <span>{updatedAtStr}</span>
          </div>
        </div>
      </div>
    </TooltipContent>
  )

  const cardInner = (
    <>
      <FileText className="shrink-0 h-3.5 w-3.5 text-muted-foreground mr-1.5" />
      <span className="flex-1 w-0 text-sm truncate">{note.name}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 h-6 w-6 shrink-0 text-xs"
            onClick={(e) => e.stopPropagation()}
            title="More actions"
          >
            ···
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation()
              onRenameStart(note)
            }}
          >
            <Pencil className="mr-2 h-3.5 w-3.5" />
            {t('rename')}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              setDeleteOpen(true)
            }}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            {t('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )

  return (
    <>
      {isRenaming ? (
        <div key={note.id} className={cardClassName} role="button" tabIndex={index} onClick={() => onClick(note)} onDoubleClick={() => onRenameStart(note)}>
          <Input
            type="text"
            className="bg-background text-sm h-6 px-1 py-0 flex-1"
            defaultValue={note.name}
            onChange={(e) => setNoteName(e.target.value)}
            onBlur={saveNoteCardName}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                saveNoteCardName()
              }
              if (e.key === 'Escape') {
                setNoteName(note.name)
                onRenameEnd()
              }
              e.stopPropagation()
            }}
            onKeyUp={(e) => {
              if (e.key === ' ') e.preventDefault()
            }}
            autoFocus
          />
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <div key={note.id} className={cardClassName} role="button" tabIndex={index} onClick={() => onClick(note)} onDoubleClick={() => onRenameStart(note)}>
              {cardInner}
            </div>
          </TooltipTrigger>
          {tooltipContent}
        </Tooltip>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
            <AlertDialogAction
              onClick={() => {
                setDeleteOpen(false)
                onDeleteNote(note)
              }}
            >
              {t('ok')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default NoteCard
