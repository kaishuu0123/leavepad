<p align="center">
  <img width="128" height="128" src="https://raw.github.com/kaishuu0123/leavepad/main/build/icon.png">
</p>

# Leavepad

<a href="https://github.com/kaishuu0123/leavepad/releases">

![GitHub Release](https://img.shields.io/github/v/release/kaishuu0123/leavepad)

</a>

Leavepad is a multi-platform notepad focused on writing memos with an integrated file editor powered by Monaco Editor.


## Motivation

1. I wanted to make a simple note that could close the editor without saving like notepad++
1. However, notepad++ is only supported on windows (except using Wine)
1. I wanted a memo application that could be unified to the same usability on multiple platforms.

Therefore, I decided to create a memo application by Electron for my own use.

## Features

### 📝 Note Taking

- Quick note creation with `Ctrl+N`
- Full-featured Monaco Editor with syntax highlighting
- **Per-note language mode settings** (changeable via status bar)
- **JSON formatting** (F1 → "Format JSON" or click "Format" button in status bar)
- Search notes by name or content
- Tab-based interface with drag & drop reordering
- Auto-save (close without saving)
- Export / Import notes as JSON
- Delete all notes

### 📁 File Editor

- Open and edit external text files
- Syntax highlighting for 50+ programming languages
- Multiple file tabs with drag & drop support
- Drag & drop files from file explorer
- Auto-detect file encoding
- Unsaved changes detection
- Keyboard shortcuts: `Ctrl+O` (Open), `Ctrl+S` (Save), `Ctrl+Shift+S` (Save As)

### 🎨 Customization

- Dark/Light theme
- Language support: English, 日本語
- Font selection (NOTONOTO, HackGen, Geist Mono, Moralerspace HWJPDOC Neon, M PLUS 1 Code)
- Sort options (created/updated date)
- Collapsible sidebar

## Download

- [Download from releases](https://github.com/kaishuu0123/leavepad/releases)

## Support platform

- Windows
- Linux
- macOS

## Screenshots

### Welcome

<table>
<tr>
<td width="100%">

![Welcome](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260411/welcome.png)

</td>
</tr>
</table>

### Editor

<table>
<thead>
<tr>
<th width="50%">Note Editor</th>
<th width="50%">File Editor</th>
</tr>
</thead>
<tbody>
<tr>
<td>

![Note Editor](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260411/note-editor.png)

</td>
<td>

![File Editor](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260411/file-editor.png)

</td>
</tr>
<tr>
<th>JSON Formatter</th>
<th>Search</th>
</tr>
<tr>
<td>

![JSON Formatter](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260411/json-formatter.png)

</td>
<td>

![Search](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260411/search.png)

</td>
</tr>
</tbody>
</table>

### Language

<table>
<thead>
<tr>
<th width="50%">English</th>
<th width="50%">日本語 (Japanese)</th>
</tr>
</thead>
<tbody>
<tr>
<td>

![English](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260411/english.png)

</td>
<td>

![Japanese](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260411/japanese.png)

</td>
</tr>
</tbody>
</table>

### Theme

<table>
<thead>
<tr>
<th width="50%">Light</th>
<th width="50%">Dark</th>
</tr>
</thead>
<tbody>
<tr>
<td>

![Light Theme](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260411/english.png)

</td>
<td>

![Dark Theme](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260411/dark.png)

</td>
</tr>
</tbody>
</table>

## Tips

### Command Palette

Press `F1` in the editor to open the command palette and access Monaco Editor's built-in commands:

- **Format JSON** — Format JSON documents (custom command)
- **Format Document** — Format any supported language
- **Change Language Mode** — Switch syntax highlighting
- **Toggle Line Comment** — Comment/uncomment code
- **Find & Replace** — Search and replace text
- **Go to Line** — Jump to a specific line number
- And many more...

### Language Mode

Click the language indicator in the status bar (bottom-right of the note editor) to change the syntax highlighting mode for the current note. Each note can have its own language setting independent of the global default.

## Keyboard Shortcuts

### Main Window (Notes)

- `Ctrl+N` - Create new note
- `Ctrl+W` - Close current tab

### File Editor Window

- `Ctrl+N` - New file
- `Ctrl+O` - Open file
- `Ctrl+S` - Save file
- `Ctrl+Shift+S` - Save As
- `Ctrl+W` - Close current tab

## Saved data location (Path)

Notes are stored in electron's `app.getPath("userData")`

- **Windows**
  - `C:\Users\<username>\AppData\Roaming\leavepad`
  - shortcut: `%APPDATA%\leavepad`
- **macOS**
  - `~/Library/Application Support/leavepad`
- **Linux**
  - `~/.config/leavepad/`

**Files:**

- `notes.json` - Note data
- `settings.json` - User settings
- `app-state.json` - Application state

## Development

### Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [devcontainer](https://code.visualstudio.com/docs/devcontainers/tutorial)

### Project Setup

#### Install

```bash
$ yarn
```

#### Development

```bash
$ yarn dev
```

#### Build

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```

## Technology Stack

- **Framework:** Electron
- **UI:** React + TypeScript
- **Editor:** Monaco Editor
- **State Management:** Jotai
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** lowdb
- **Build:** electron-vite

# LICENSE

MIT

## FONT LICENSE

```
"Geist Mono" / "Geist Sans" is licensed under the SIL Open Font License 1.1
Copyright (c) 2023 vercel
by https://github.com/vercel/geist-font

"白源", "HackGen" is licensed under the SIL Open Font License 1.1
Copyright (c) 2019 yuru7, with Reserved Font Name "白源", "HackGen"
by https://github.com/yuru7/HackGen

"NOTONOTO" is licensed under the SIL Open Font License 1.1
Copyright (c) 2024 yuru7, with Reserved Font Name "NOTONOTO"
by https://github.com/yuru7/NOTONOTO

"Moralerspace HWJPDOC Neon" is licensed under the SIL Open Font License 1.1
Copyright (c) 2023 yuru7
by https://github.com/yuru7/moralerspace

"M PLUS 1 Code" is licensed under the SIL Open Font License 1.1
Copyright 2021 coz-m
by https://github.com/coz-m/MPLUS_FONTS

"Noto Color Emoji" is licensed under the SIL Open Font License 1.1
Copyright 2021 googlefonts
by https://github.com/googlefonts/noto-emoji

"Noto Sans JP" is licensed under the SIL Open Font License 1.1
Copyright 2014-2021 googlefonts
by https://github.com/googlefonts/noto-cjk
```

---

Made by [kaishuu0123](https://github.com/kaishuu0123) ✨
