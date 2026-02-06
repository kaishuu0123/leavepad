<p align="center">
  <img width="128" height="128" src="https://raw.github.com/kaishuu0123/leavepad/main/build/icon.png">
</p>

# Leavepad

<a href="https://github.com/kaishuu0123/leavepad/releases">

![GitHub Release](https://img.shields.io/github/v/release/kaishuu0123/leavepad)

</a>

Leavepad is a multi-platform notepad focused on writing memos with an integrated file editor powered by Monaco Editor.

- [Motivation](#motivation)
- [Features](#features)
- [Download](#download)
- [Support platform](#support-platform)
- [Screenshots](#screenshots)
  - [Basic View](#basic-view)
  - [File Editor](#file-editor)
  - [Language](#language)
  - [Theme](#theme)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Saved data location (Path)](#saved-data-location-path)
- [Development](#development)
  - [Recommended IDE Setup](#recommended-ide-setup)
  - [Project Setup](#project-setup)
    - [Install](#install)
    - [Development](#development-1)
    - [Build](#build)
- [LICENSE](#license)
  - [FONT LICENSE](#font-license)

## Motivation

1. I wanted to make a simple note that could close the editor without saving like notepad++
1. However, notepad++ is only supported on windows (except using Wine)
1. I wanted a memo application that could be unified to the same usability on multiple platforms.

Therefore, I decided to create a memo application by Electron for my own use.

**Update (v1.5.0+):** File editing is now supported with an integrated Monaco Editor-based file editor window!

## Features

### 📝 Note Taking

- Quick note creation with `Ctrl+N`
- Full-featured Monaco Editor with syntax highlighting
- Search notes by name or content
- Tab-based interface with drag & drop reordering
- Auto-save (close without saving)
- Multiple font options (HackGen, NOTONOTO, Geist)

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
- Font selection
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

| Welcome Screen                                                                                |
| --------------------------------------------------------------------------------------------- |
| ![Welcome](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260206/welcome.png) |

### Editor

| Note Editor                                                                                          | File Editor                                                                                           |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| ![Note Editor](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260206/basic_view.png) | ![File Editor](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260206/file_editor.png) |

### Language

| English                                                                                          | 日本語 (Japanese)                                                                               |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| ![English](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260206/basic_view.png) | ![Japanese](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260206/japanese.png) |

### Theme

| Light                                                                                                | Dark                                                                                          |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| ![Light Theme](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260206/basic_view.png) | ![Dark Theme](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20260206/dark.png) |

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
"Geist Mono" is licensed under the SIL Open Font License 1.1
Copyright (c) 2023 Vercel, in collaboration with basement.studio
by https://github.com/vercel/geist-font

"Geist Sans" is licensed under the SIL Open Font License 1.1
Copyright (c) 2023 Vercel, in collaboration with basement.studio
by https://github.com/vercel/geist-font

"白源", "HackGen" is licensed under the SIL Open Font License 1.1
Copyright (c) 2019, Yuko OTAWARA. with Reserved Font Name "白源", "HackGen"
by https://github.com/yuru7/HackGen/

"NOTONOTO" is licensed under the SIL Open Font License 1.1
Copyright (c) 2024 Yuko Otawara, with Reserved Font Name "NOTONOTO"
by https://github.com/yuru7/NOTONOTO/

"Noto Color Emoji" is licensed under the SIL Open Font License 1.1
Copyright 2021 Google Inc. All Rights Reserved.
by https://fonts.google.com/noto/specimen/Noto+Color+Emoji/

"Noto Sans Japanese" is licensed under the SIL Open Font License 1.1
Copyright 2014-2021 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source'
by https://fonts.google.com/noto/specimen/Noto+Sans+JP
```

---

Made by [kaishuu0123](https://github.com/kaishuu0123) ✨
