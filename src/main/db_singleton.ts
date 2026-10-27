import path from 'node:path'
import { app } from 'electron'
import type { LowSync } from 'lowdb'
import { JSONFileSyncPreset } from 'lowdb/node'
import {
  type AppState,
  defaultAppState,
  defaultNoteEditorSettings,
  type Note,
  type NoteEditorSettings
} from '../types'

type Dbs = {
  notesDb: LowSync<Note[]>
  settingsDb: LowSync<NoteEditorSettings>
  appStateDb: LowSync<AppState>
}

export const safeWrite = async <T>(db: LowSync<T>, retries = 5, delay = 100): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      db.write()
      return
    } catch (err) {
      const code = (err as NodeJS.ErrnoException | undefined)?.code
      if ((code === 'EPERM' || code === 'EBUSY') && i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)))
      } else if (i === retries - 1) {
        console.error(`Failed to write database after ${retries} attempts:`, err)
      } else {
        console.error(`Error writing database:`, err)
        return
      }
    }
  }
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

  static getInstance(): DbSingleton {
    if (!DbSingleton.instance) {
      DbSingleton.instance = new DbSingleton()
      // ... any one time initialization goes here ...
    }
    return DbSingleton.instance
  }

  public async initDbs(): Promise<void> {
    await this.dbs.notesDb.read()
    await this.dbs.settingsDb.read()
    await this.dbs.appStateDb.read()
  }

  public async writeAllDbs(): Promise<void> {
    await safeWrite(this.dbs.notesDb)
    await safeWrite(this.dbs.settingsDb)
    await safeWrite(this.dbs.appStateDb)
  }
}

const instance = DbSingleton.getInstance()
await instance.initDbs()
export const dbInstance = instance
