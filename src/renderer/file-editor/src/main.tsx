import './assets/index.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createStore, Provider } from 'jotai'

export const fileEditorStore: ReturnType<typeof createStore> = createStore()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={fileEditorStore}>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </Provider>
)
