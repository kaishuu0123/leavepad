// Map file extensions to Monaco Editor language IDs
const extensionToLanguage: Record<string, string> = {
  // JavaScript / TypeScript
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.mts': 'typescript',
  '.cts': 'typescript',

  // Web
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.sass': 'scss',
  '.less': 'less',

  // Data formats
  '.json': 'json',
  '.jsonc': 'json',
  '.xml': 'xml',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'ini',

  // Markdown
  '.md': 'markdown',
  '.markdown': 'markdown',

  // Programming languages
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.hh': 'cpp',
  '.cs': 'csharp',
  '.rb': 'ruby',
  '.php': 'php',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.kts': 'kotlin',
  '.scala': 'scala',
  '.lua': 'lua',
  '.r': 'r',
  '.R': 'r',
  '.pl': 'perl',
  '.pm': 'perl',

  // Shell
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.fish': 'shell',
  '.ps1': 'powershell',
  '.psm1': 'powershell',
  '.bat': 'bat',
  '.cmd': 'bat',

  // Config
  '.ini': 'ini',
  '.conf': 'ini',
  '.cfg': 'ini',
  '.env': 'ini',

  // SQL
  '.sql': 'sql',

  // Docker
  dockerfile: 'dockerfile',

  // GraphQL
  '.graphql': 'graphql',
  '.gql': 'graphql',

  // Plain text
  '.txt': 'plaintext',
  '.text': 'plaintext',
  '.log': 'plaintext'
}

export function detectLanguageFromFileName(fileName: string): string {
  // Handle special filenames first
  const lowerFileName = fileName.toLowerCase()
  if (lowerFileName === 'dockerfile') {
    return 'dockerfile'
  }
  if (lowerFileName === 'makefile' || lowerFileName === 'gnumakefile') {
    return 'makefile'
  }
  if (lowerFileName.endsWith('.gitignore') || lowerFileName.endsWith('.dockerignore')) {
    return 'ignore'
  }

  // Get extension
  const lastDotIndex = fileName.lastIndexOf('.')
  if (lastDotIndex === -1) {
    return 'plaintext'
  }

  const extension = fileName.slice(lastDotIndex).toLowerCase()
  return extensionToLanguage[extension] || 'plaintext'
}
