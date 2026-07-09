/// <reference types="vite/client" />

import type { ApiBridge } from '../preload'

declare global {
  interface Window {
    api: ApiBridge
    electron: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void
        on: (channel: string, listener: (...args: any[]) => void) => void
        removeAllListeners: (channel: string) => void
      }
    }
  }
}
