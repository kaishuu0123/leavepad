<p align="center">
  <img width="256" height="256" src="https://raw.github.com/kaishuu0123/leavepad/main/build/icon.png">
</p>

# Leavepad

<a href="https://github.com/kaishuu0123/leavepad/releases">

![GitHub Release](https://img.shields.io/github/v/release/kaishuu0123/leavepad)

</a>

Leavepad is a multi-platform notepad. focuses on writing memos. File editing is not supported.

- [Motivation](#motivation)
- [Download](#download)
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
- [LICENSE](#license)
  - [FONT LICENSE](#font-license)

## Motivation

1. I wanted to make a simple note that could close the editor without saving like notepad++
1. However, notepad++ is only supported on windows (except using Wine)
1. I wanted a memo application that could be unified to the same usability on multiple platforms.

Therefore, I decided to create a memo application by Electron for my own use.

Note that file (local file) editing is not supported. (I don't need it).

## Download

- [Download from releases](https://github.com/kaishuu0123/leavepad/releases)

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

# LICENSE

MIT

## FONT LICENSE

```
"Geist Mono" is lisenced under the SIL Open Font License 1.1
Copyright (c) 2023 Vercel, in collaboration with basement.studio
by https://github.com/vercel/geist-font

"Geist Sans" is lisenced under the SIL Open Font License 1.1
Copyright (c) 2023 Vercel, in collaboration with basement.studio
by https://github.com/vercel/geist-font

"白源", "HackGen" is lisenced under the SIL Open Font License 1.1
Copyright (c) 2019, Yuko OTAWARA. with Reserved Font Name "白源", "HackGen"
by https://github.com/yuru7/HackGen/

"NOTONOTO" is lisenced under the SIL Open Font License 1.1
Copyright (c) 2024 Yuko Otawara, with Reserved Font Name "NOTONOTO"
by https://github.com/yuru7/NOTONOTO/

"Noto Color Emoji" is lisenced under the SIL Open Font License 1.1
Copyright 2021 Google Inc. All Rights Reserved.
by https://fonts.google.com/noto/specimen/Noto+Color+Emoji/

"Noto Sans Japanese" is lisenced under the SIL Open Font License 1.1
Copyright 2014-2021 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source'
by https://fonts.google.com/noto/specimen/Noto+Sans+JP
```
