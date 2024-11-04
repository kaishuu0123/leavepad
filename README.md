# Leavepad

Leavepad is a multi-platform notepad. focuses on writing memos. File editing is not supported.

- [Motivation](#motivation)
- [Support platform](#support-platform)
- [Screenshots](#screenshots)
  - [Features](#features)
  - [Language](#language)
  - [Theme](#theme)
- [Recommended IDE Setup](#recommended-ide-setup)
- [Project Setup](#project-setup)
  - [Install](#install)
  - [Development](#development)
  - [Build](#build)

## Motivation

1. I wanted to make a simple note that could close the editor without saving like notepad++
1. However, notepad++ is only supported on windows (except using Wine)
1. I wanted a memo application that could be unified to the same usability on multiple platforms.

Therefore, I decided to create a memo application by Electron for my own use.

Note that file (local file) editing is not supported. (I don't need it).

## Support platform

- Windows
- Linux
- macOS

## Screenshots

### Features

| Basic View                                                                                           | Global Settings                                                                                           |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| ![Screenshots](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20241104_basic_view.png) | ![Screenshots](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20241104_global_settings.png) |

### Language

| English                                                                                           | 日本語 (Japanese)                                                                                  |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| ![Screenshots](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20241104_english.png) | ![Screenshots](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20241104_japanese.png) |

### Theme

| light                                                                                                 | dark                                                                                                 |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| ![Screenshots](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20241104_theme_light.png) | ![Screenshots](https://raw.github.com/kaishuu0123/leavepad/main/screenshots/20241104_theme_dark.png) |

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [devcontainer](https://code.visualstudio.com/docs/devcontainers/tutorial)

## Project Setup

### Install

```bash
$ yarn
```

### Development

```bash
$ yarn dev
```

### Build

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```
