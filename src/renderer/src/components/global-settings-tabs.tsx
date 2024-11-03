import * as monaco from 'monaco-editor'

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

const LanguageComboboxForm = ({ form, field }) => {
  const languages = monaco.languages.getLanguages()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            role="combobox"
            className={cn('w-[200px] justify-between', !field.value && 'text-muted-foreground')}
          >
            {field.value
              ? languages.find((language) => language.id === field.value)?.id
              : 'Select language'}
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." className="h-9" />
          <CommandList>
            <CommandEmpty>No language found.</CommandEmpty>
            <CommandGroup>
              {languages.map((language) => (
                <CommandItem
                  value={language.id}
                  key={language.id}
                  onSelect={() => {
                    form.setValue('editorOptions.language', language.id)
                  }}
                >
                  {language.id}
                  <div
                    className={cn(
                      'ml-auto h-4 w-4',
                      language.id === field.value ? 'opacity-100' : 'opacity-0'
                    )}
                  >
                    <div className="codicon codicon-check" />
                  </div>
                </CommandItem>
              ))}
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
        </TabsList>
      </div>
      <div className="grow h-full overflow-y-auto">
        <GeneralTabsContent settingsForm={settingsForm} />
        <NotesTabsContent settingsForm={settingsForm} />
        <EditorTabsContent settingsForm={settingsForm} />
      </div>
    </Tabs>
  )
}

GlobalSettingsTabs.displayName = 'GlobalSettingsTabs'

export { GlobalSettingsTabs }
