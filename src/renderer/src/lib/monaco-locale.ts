export async function applyMonacoLocale(language: string): Promise<void> {
  if (language === 'japanese') {
    await import('monaco-editor/nls/lang/ja.js')
  }
}
