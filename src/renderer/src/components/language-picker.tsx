import * as monaco from 'monaco-editor'
import { Note } from '../../../types'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { Separator } from './ui/separator'
import { useTranslation } from 'react-i18next'

type LanguagePickerProps = {
  currentNote: Note
  defaultLanguage: string
  onNoteChange: (updatedNote: Note) => void
}

export function LanguagePicker({ currentNote, defaultLanguage, onNoteChange }: LanguagePickerProps) {
  const { t } = useTranslation()
  const currentLanguage = currentNote.language || defaultLanguage
  const allLanguages = monaco.languages.getLanguages()
  const currentLanguageDisplayName =
    allLanguages.find((l) => l.id === currentLanguage)?.aliases?.[0] || currentLanguage

  return (
    <div className="flex gap-2 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-muted">
            {currentLanguageDisplayName}
            <span className="codicon codicon-chevron-down ml-1 text-[10px]"></span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="end">
          <Command>
            <CommandInput placeholder={t('searchLanguage')} className="h-9" />
            <CommandList>
              <CommandEmpty>{t('noLanguageFound')}</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="default"
                  onSelect={async () => {
                    const updatedNote = { ...currentNote, language: undefined }
                    await window.api.updateNote(updatedNote)
                    onNoteChange(updatedNote)
                  }}
                >
                  {t('defaultLanguage')} (
                  {allLanguages.find((l) => l.id === defaultLanguage)?.aliases?.[0] ||
                    defaultLanguage}
                  )
                  {!currentNote.language && (
                    <span className="ml-auto codicon codicon-check"></span>
                  )}
                </CommandItem>
                <Separator className="my-1" />
                {allLanguages.map((lang) => {
                  const displayName = lang.aliases?.[0] || lang.id
                  return (
                    <CommandItem
                      key={lang.id}
                      value={`${displayName} ${lang.id}`}
                      onSelect={async () => {
                        const updatedNote = { ...currentNote, language: lang.id }
                        await window.api.updateNote(updatedNote)
                        onNoteChange(updatedNote)
                      }}
                    >
                      {displayName}
                      {currentNote.language === lang.id && (
                        <span className="ml-auto codicon codicon-check"></span>
                      )}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
