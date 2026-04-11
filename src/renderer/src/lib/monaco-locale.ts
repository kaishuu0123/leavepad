export async function applyMonacoLocale(language: string): Promise<void> {
  if (language === 'japanese') {
    await import('monaco-editor/esm/nls.messages.ja.js')
  } else {
    await import('monaco-editor/esm/nls.messages.js')
  }
}
