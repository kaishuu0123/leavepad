import * as monaco from 'monaco-editor'
import { useEffect, useState } from 'react'

import { cn } from '@renderer/lib/utils'
import { Button, buttonVariants } from './ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from './ui/form'
import { Tabs, TabsList, TabsContent, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Switch } from './ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { useAtom } from 'jotai'
import { notesAtom } from '@renderer/lib/atoms/notes'
import { useTranslation } from 'react-i18next'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import appIcon from '../../../../resources/icon.png'

type UpdateStatus = 'checking' | 'up-to-date' | 'available' | 'downloaded' | 'error'

const fontCredits = [
  {
    name: 'Geist Sans / Geist Mono',
    copyright: 'Copyright (c) 2023 Vercel, in collaboration with basement.studio',
    url: 'https://github.com/vercel/geist-font'
  },
  {
    name: '白源 (HackGen)',
    copyright: 'Copyright (c) 2019 Yuko OTAWARA',
    url: 'https://github.com/yuru7/HackGen'
  },
  {
    name: 'Noto Sans JP',
    copyright: 'Copyright 2014-2021 Adobe',
    url: 'https://fonts.google.com/noto/specimen/Noto+Sans+JP'
  },
  {
    name: 'NOTONOTO',
    copyright: 'Copyright (c) 2024 Yuko Otawara',
    url: 'https://github.com/yuru7/NOTONOTO'
  },
  {
    name: 'Noto Color Emoji',
    copyright: 'Copyright 2021 Google Inc.',
    url: 'https://fonts.google.com/noto/specimen/Noto+Color+Emoji'
  }
]

const AboutTabContent = () => {
  const { t } = useTranslation()
  const [version] = useState(() => window.api.getAppVersion())
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('checking')
  const [latestVersion, setLatestVersion] = useState('')
  const [isDevError, setIsDevError] = useState(false)

  useEffect(() => {
    window.api.checkForUpdates()

    const onChecking = () => setUpdateStatus('checking')
    const onNotAvailable = () => setUpdateStatus('up-to-date')
    const onAvailable = (_e, info: { version: string }) => {
      setUpdateStatus('available')
      setLatestVersion(info.version)
    }
    const onDownloaded = (_e, info: { version: string }) => {
      setUpdateStatus('downloaded')
      setLatestVersion(info.version)
    }
    const onError = (_e, msg: string) => {
      setIsDevError(msg === 'dev')
      setUpdateStatus('error')
    }

    window.electron.ipcRenderer.on('update-checking', onChecking)
    window.electron.ipcRenderer.on('update-not-available', onNotAvailable)
    window.electron.ipcRenderer.on('update-available', onAvailable)
    window.electron.ipcRenderer.on('update-downloaded', onDownloaded)
    window.electron.ipcRenderer.on('update-error', onError)

    return () => {
      window.electron.ipcRenderer.removeListener('update-checking', onChecking)
      window.electron.ipcRenderer.removeListener('update-not-available', onNotAvailable)
      window.electron.ipcRenderer.removeListener('update-available', onAvailable)
      window.electron.ipcRenderer.removeListener('update-downloaded', onDownloaded)
      window.electron.ipcRenderer.removeListener('update-error', onError)
    }
  }, [])

  const renderUpdateStatus = () => {
    switch (updateStatus) {
      case 'checking':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{t('about.checking')}</span>
          </div>
        )
      case 'up-to-date':
        return <p className="text-sm text-green-600">{t('about.upToDate')}</p>
      case 'available':
        return (
          <p className="text-sm text-blue-500">{t('about.available', { version: latestVersion })}</p>
        )
      case 'downloaded':
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-green-600">{t('about.downloaded', { version: latestVersion })}</p>
            <Button size="sm" onClick={() => window.api.installUpdate()}>
              {t('restartAndUpdate')}
            </Button>
          </div>
        )
      case 'error':
        return (
          <p className="text-sm text-muted-foreground">
            {isDevError ? t('about.devError') : t('about.error')}
          </p>
        )
    }
  }

  return (
    <TabsContent value="about" className="p-1">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 pt-2">
          <img src={appIcon} className="w-20 h-20 rounded-2xl" alt="Leavepad" />
          <div className="text-center">
            <h2 className="text-xl font-semibold">Leavepad</h2>
            <p className="text-sm text-muted-foreground mt-1">Version {version}</p>
          </div>
          <div>{renderUpdateStatus()}</div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{t('about.fontCredits')}</p>
          <div className="flex flex-col items-center gap-5">
            {fontCredits.map((font) => (
              <div key={font.name} className="text-center space-y-0.5">
                <p className="text-sm font-semibold font-mono">{font.name}</p>
                <p className="text-xs text-muted-foreground">{font.copyright}</p>
                <p className="text-xs text-muted-foreground">SIL Open Font License 1.1</p>
                <a
                  href={font.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-500 hover:underline"
                >
                  {font.url}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TabsContent>
  )
}

const LanguageComboboxForm = ({ form, field }) => {
  const languages = monaco.languages.getLanguages()
  const { t } = useTranslation()

  const getDisplayName = (id: string) =>
    languages.find((l) => l.id === id)?.aliases?.[0] || id

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn('w-[200px] justify-between', !field.value && 'text-muted-foreground')}
          >
            {field.value ? getDisplayName(field.value) : 'Select language'}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={t('searchLanguage')} className="h-9" />
          <CommandList>
            <CommandEmpty>{t('noLanguageFound')}</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => {
                const displayName = language.aliases?.[0] || language.id
                return (
                  <CommandItem
                    value={`${displayName} ${language.id}`}
                    key={language.id}
                    onSelect={() => {
                      form.setValue('editorOptions.language', language.id)
                    }}
                  >
                    {displayName}
                    <div
                      className={cn(
                        'ml-auto h-4 w-4',
                        language.id === field.value ? 'opacity-100' : 'opacity-0'
                      )}
                    >
                      <div className="codicon codicon-check" />
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const EditorTabsContent = ({ settingsForm }) => {
  const { t } = useTranslation()

  return (
    <TabsContent value="editor" className="p-1">
      <div className="flex flex-col space-y-6">
        <Form {...settingsForm}>
          <FormField
            control={settingsForm.control}
            name="editorOptions.fontSize"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('globalSettingsGroup.fontSize')}</FormLabel>
                <Input {...field} />
              </FormItem>
            )}
          />

          <FormField
            control={settingsForm.control}
            name="editorOptions.language"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('globalSettingsGroup.languageMode')}</FormLabel>
                <LanguageComboboxForm form={settingsForm} field={field} />
              </FormItem>
            )}
          />

          <FormField
            control={settingsForm.control}
            name="editorOptions.insertSpaces"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('globalSettingsGroup.spaceOrTab')}</FormLabel>
                <FormControl>
                  <RadioGroup
                    className="flex items-center"
                    defaultValue={field.value.toString()}
                    onValueChange={(value: 'true' | 'false') => {
                      settingsForm.setValue('editorOptions.insertSpaces', value === 'true')
                    }}
                  >
                    <FormItem className="space-y-0 flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value="true" onChange={() => field.onChange(true)} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {t('globalSettingsGroup.space')}
                      </FormLabel>
                    </FormItem>
                    <FormItem className="space-y-0 flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value="false" onChange={() => field.onChange(false)} />
                      </FormControl>
                      <FormLabel className="font-normal">{t('globalSettingsGroup.tab')}</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={settingsForm.control}
            name="editorOptions.tabSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('globalSettingsGroup.tabSize')}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>{t('globalSettingsGroup.tabSizeDescription')}</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={settingsForm.control}
            name="editorOptions.useTabStops"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('globalSettingsGroup.useTabStops')}</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormDescription>{t('globalSettingsGroup.useTabStopsDescription')}</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={settingsForm.control}
            name="editorOptions.wordWrap"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{t('globalSettingsGroup.wordWrap')}</FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value === 'on'}
                    onCheckedChange={(event) => {
                      field.onChange(event ? 'on' : 'off')
                    }}
                  />
                </FormControl>
                <FormDescription>{t('globalSettingsGroup.wordWrapDescription')}</FormDescription>
              </FormItem>
            )}
          />
        </Form>
      </div>
    </TabsContent>
  )
}

const NotesTabsContent = ({ settingsForm }) => {
  const { t } = useTranslation()

  return (
    <TabsContent value="notes" className="p-1">
      <div className="flex flex-col space-y-6">
        <Form {...settingsForm}>
          <FormField
            control={settingsForm.control}
            name="sortBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('globalSettingsGroup.sortBy')}</FormLabel>
                <FormControl>
                  <select
                    className={cn(buttonVariants({ variant: 'outline' }), 'w-full font-normal')}
                    {...field}
                  >
                    <option value="createdAt">{t('createdAt')}</option>
                    <option value="updatedAt">{t('updatedAt')}</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={settingsForm.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('globalSettingsGroup.sortOrder')}</FormLabel>
                <FormControl>
                  <select
                    className={cn(buttonVariants({ variant: 'outline' }), 'w-full font-normal')}
                    {...field}
                  >
                    <option value="desc">{t('descending')}</option>
                    <option value="asc">{t('ascending')}</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      </div>
    </TabsContent>
  )
}
const GeneralTabsContent = ({ settingsForm }) => {
  const [notes, _] = useAtom(notesAtom)
  const { t } = useTranslation()

  const exportNotes = () => {
    const fileName = 'notes.json'
    const data = new Blob([JSON.stringify(notes, null, 2)], { type: 'text/json' })
    const jsonURL = window.URL.createObjectURL(data)
    const link = document.createElement('a')
    document.body.appendChild(link)
    link.href = jsonURL
    link.setAttribute('download', fileName)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <TabsContent value="general" className="p-1">
      <div className="flex flex-col space-y-6">
        <Form {...settingsForm}>
          <FormField
            control={settingsForm.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('globalSettingsGroup.language')}</FormLabel>
                <FormControl>
                  <select
                    className={cn(buttonVariants({ variant: 'outline' }), 'w-full font-normal')}
                    {...field}
                  >
                    <option value="english">English</option>
                    <option value="japanese">日本語 (Japanese)</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={settingsForm.control}
            name="themeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('globalSettingsGroup.theme')}</FormLabel>
                <FormControl>
                  <select
                    className={cn(buttonVariants({ variant: 'outline' }), 'w-full font-normal')}
                    {...field}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {t('globalSettingsGroup.backup')}
            </label>
            <div className="flex">
              <Button size="sm" onClick={exportNotes}>
                {t('globalSettingsGroup.exportNotes')}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </TabsContent>
  )
}

const GlobalSettingsTabs = ({ settingsForm }) => {
  const { t } = useTranslation()

  return (
    <Tabs defaultValue="general" className="flex flex-col w-full space-y-6 h-full">
      <div>
        <TabsList className="flex w-full">
          <TabsTrigger value="general" className="grow">
            {t('globalSettingsGroup.general')}
          </TabsTrigger>
          <TabsTrigger value="notes" className="grow">
            {t('globalSettingsGroup.notes')}
          </TabsTrigger>
          <TabsTrigger value="editor" className="grow">
            {t('globalSettingsGroup.editor')}
          </TabsTrigger>
          <TabsTrigger value="about" className="grow">
            {t('about.title')}
          </TabsTrigger>
        </TabsList>
      </div>
      <div className="grow h-full overflow-y-auto">
        <ScrollArea type="always" className="h-full">
          <GeneralTabsContent settingsForm={settingsForm} />
          <NotesTabsContent settingsForm={settingsForm} />
          <EditorTabsContent settingsForm={settingsForm} />
          <AboutTabContent />
        </ScrollArea>
      </div>
    </Tabs>
  )
}

GlobalSettingsTabs.displayName = 'GlobalSettingsTabs'

export { GlobalSettingsTabs }
