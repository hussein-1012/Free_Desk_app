import { ElectronAPI } from '@electron-toolkit/preload';
import { ApiBridge } from './index';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: ApiBridge;
  }
}
