import { BrowserWindow, dialog } from 'electron';
import * as fs from 'fs';
import { ApiResponse } from '@shared/types';

export class PrintService {
  async printWindow(window: BrowserWindow, silent = false): Promise<ApiResponse<void>> {
    return new Promise((resolve) => {
      window.webContents.print(
        {
          silent,
          printBackground: true,
          color: true,
          margins: { marginType: 'default' },
        },
        (success, errorType) => {
          if (success) {
            resolve({ success: true, message: 'Print command sent to spooler' });
          } else {
            resolve({ success: false, error: errorType || 'Print failed' });
          }
        }
      );
    });
  }

  async savePDFFile(base64Content: string, defaultName: string): Promise<ApiResponse<string>> {
    try {
      const buffer = Buffer.from(base64Content, 'base64');
      const result = await dialog.showSaveDialog({
        title: 'Save PDF Document',
        defaultPath: defaultName,
        filters: [{ name: 'PDF Documents', extensions: ['pdf'] }],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, message: 'Save cancelled' };
      }

      fs.writeFileSync(result.filePath, buffer);
      return { success: true, data: result.filePath, message: 'PDF document saved successfully' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async saveExcelFile(base64Content: string, defaultName: string): Promise<ApiResponse<string>> {
    try {
      const buffer = Buffer.from(base64Content, 'base64');
      const result = await dialog.showSaveDialog({
        title: 'Save Excel Document',
        defaultPath: defaultName,
        filters: [{ name: 'Excel Sheets', extensions: ['xlsx'] }],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, message: 'Save cancelled' };
      }

      fs.writeFileSync(result.filePath, buffer);
      return { success: true, data: result.filePath, message: 'Excel spreadsheet saved successfully' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async readExcelFile(): Promise<ApiResponse<string>> {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select Excel File to Import',
        properties: ['openFile'],
        filters: [{ name: 'Excel Sheets', extensions: ['xlsx', 'xls'] }],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, message: 'Import cancelled' };
      }

      const filePath = result.filePaths[0];
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');

      return { success: true, data: base64 };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
