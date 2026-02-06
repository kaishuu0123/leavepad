# Leavepad: Complete User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Features](#features)
5. [Advanced Usage](#advanced-usage)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Settings](#settings)
8. [Tips and Tricks](#tips-and-tricks)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)

## Introduction

Welcome to Leavepad, a modern note-taking application designed for
developers and writers who value simplicity and efficiency.

Leavepad combines the best features of traditional text editors with
modern UI design, offering a seamless experience across all platforms.

### Key Features

- **Fast and Lightweight**: Built with performance in mind
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Monaco Editor**: Professional-grade editing experience
- **Tab Management**: Organize multiple notes efficiently
- **File Editor**: Edit external files with syntax highlighting
- **Dark Mode**: Easy on the eyes during late-night coding sessions

## Installation

### Windows

1. Download the installer from the releases page
2. Run the `.exe` file
3. Follow the installation wizard
4. Launch Leavepad from the Start menu

### macOS

1. Download the `.dmg` file
2. Open the disk image
3. Drag Leavepad to Applications
4. Launch from Applications folder

### Linux

1. Download the `.AppImage` or `.deb` package
2. Make it executable: `chmod +x Leavepad.AppImage`
3. Run the application

## Quick Start

### Creating Your First Note

1. Launch Leavepad
2. Click "New Note" or press `Ctrl+N`
3. Start typing your content
4. Your note is auto-saved

### Opening Existing Files

1. Click "File Editor" on the welcome screen
2. Select a file from your system
3. Edit and save with `Ctrl+S`

## Features

### Note Management

#### Creating Notes

Notes are created instantly with `Ctrl+N`. Each note is automatically
saved as you type, eliminating the fear of losing your work.

#### Organizing Notes

Use the sidebar to view all your notes. Search functionality helps
you find notes quickly by name or content.

#### Tab System

Multiple notes can be open simultaneously in tabs. Drag and drop
to reorder tabs according to your preference.

### File Editor

#### Syntax Highlighting

The file editor supports over 50 programming languages with
intelligent syntax highlighting powered by Monaco Editor.

#### Multiple Files

Open multiple files in separate tabs. Each file maintains its
own undo/redo history and cursor position.

#### Auto-Detection

File language is automatically detected based on file extension.
The editor adjusts syntax highlighting accordingly.

### Customization

#### Themes

Choose between light and dark themes. The theme applies
consistently across the entire application.

#### Fonts

Select from multiple font options:
- HackGen (Japanese programming font)
- NOTONOTO (Japanese display font)
- Geist (Modern sans-serif)

#### Language

Interface language can be switched between:
- English
- 日本語 (Japanese)

## Advanced Usage

### Keyboard Shortcuts

Master these shortcuts to boost your productivity:

#### Note Operations
- `Ctrl+N` - New note
- `Ctrl+W` - Close tab
- `Ctrl+Tab` - Switch between tabs

#### File Operations
- `Ctrl+O` - Open file
- `Ctrl+S` - Save file
- `Ctrl+Shift+S` - Save as

#### Editor Operations
- `Ctrl+F` - Find
- `Ctrl+H` - Replace
- `Ctrl+/` - Toggle comment

### Search and Filter

Use regex patterns in the search box to find notes:
- `/\d{4}-\d{2}-\d{2}/` - Find dates
- `/TODO/i` - Case-insensitive search
- `/^#/` - Find headings

### Data Management

#### Backup

Notes are stored in:
- Windows: `%APPDATA%\leavepad`
- macOS: `~/Library/Application Support/leavepad`
- Linux: `~/.config/leavepad`

#### Export

Export notes by copying the JSON files from the data directory.

## Settings

### Editor Settings

Configure the editor behavior:
- Tab size
- Line wrapping
- Auto-save interval
- Font size

### Appearance

Customize the visual appearance:
- Theme selection
- Font family
- Sidebar visibility
- Tab style

### Performance

Adjust performance settings:
- Memory usage
- Cache size
- Auto-save frequency

## Tips and Tricks

### Markdown Preview

Write notes in Markdown for better formatting.
The editor provides syntax highlighting for Markdown.

### Code Snippets

Use the file editor to store reusable code snippets.
Create a dedicated folder for your snippet collection.

### Project Notes

Create separate notes for each project.
Use consistent naming conventions for easy searching.

### Daily Journal

Use date-based note names like `2026-02-06` for daily journaling.

## Troubleshooting

### Performance Issues

If the application feels slow:
1. Close unused tabs
2. Clear old notes
3. Restart the application

### Sync Problems

Notes are stored locally. To sync across devices:
1. Copy the data folder
2. Use cloud storage (Dropbox, Google Drive)
3. Paste to the target device

### Display Issues

If UI elements appear incorrectly:
1. Check your display scaling
2. Try switching themes
3. Restart the application

## FAQ

**Q: Is my data encrypted?**
A: Notes are stored as plain text. Implement your own encryption if needed.

**Q: Can I use it offline?**
A: Yes, Leavepad works completely offline.

**Q: How do I backup my notes?**
A: Copy the data folder to a safe location regularly.

**Q: Does it support plugins?**
A: Not currently, but it's planned for future releases.

**Q: Can I collaborate with others?**
A: Leavepad is designed for personal use. Collaboration features
may be added in the future.

## Support

For issues, questions, or feature requests:
- GitHub Issues: https://github.com/kaishuu0123/leavepad/issues
- Email: kaishuu0123@gmail.com

---

Thank you for using Leavepad!
Built with ❤️ by kaishuu0123
