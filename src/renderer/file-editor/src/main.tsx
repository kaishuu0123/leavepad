import './assets/index.css'

import { createStore, Provider } from 'jotai'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

export const fileEditorStore: ReturnType<typeof createStore> = createStore()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={fileEditorStore}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
)
