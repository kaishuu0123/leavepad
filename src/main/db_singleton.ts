import { app } from 'electron'
import path from 'path'
import {
  AppState,
  defaultAppState,
  defaultNoteEditorSettings,
  Note,
  NoteEditorSettings
} from '../types'
import { JSONFileSyncPreset } from 'lowdb/node'
import { LowSync } from 'lowdb'

type Dbs = {
  notesDb: LowSync<Note[]>
  settingsDb: LowSync<NoteEditorSettings>
  appStateDb: LowSync<AppState>
}

class DbSingleton {
  private static instance: DbSingleton
  public dbs: Dbs

  private constructor() {
    const userDir = app.getPath('userData')
    const defaultData: Note[] = []
    const notesDb = JSONFileSyncPreset<Note[]>(path.join(userDir, 'notes.json'), defaultData)
    const settingsDb = JSONFileSyncPreset<NoteEditorSettings>(
      path.join(userDir, 'settings.json'),
      defaultNoteEditorSettings
    )
    const appStateDb = JSONFileSyncPreset<AppState>(
      path.join(userDir, 'app-state.json'),
      defaultAppState
    )

    this.dbs = {
      notesDb: notesDb,
      settingsDb: settingsDb,
      appStateDb: appStateDb
    }
  }

  static getInstance() {
    if (!DbSingleton.instance) {
      DbSingleton.instance = new DbSingleton()
      // ... any one time initialization goes here ...
    }
    return DbSingleton.instance
  }

  public async initDbs() {
    await this.dbs.notesDb.read()
    await this.dbs.settingsDb.read()
    await this.dbs.appStateDb.read()
  }
}

const instance = DbSingleton.getInstance()
await instance.initDbs()
export const dbInstance = instance
