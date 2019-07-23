import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import * as XLSX from 'xlsx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';

/*
  Generated class for the ExcelProvider provider.
  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

@Injectable({
  providedIn: 'root',
})
export class ExcelService {

  constructor(public http: HttpClient,
    public platform: Platform,
    private file: File,
    private fileOpener: FileOpener) {
    console.log('Hello ExcelProvider Provider');
  }

  public exportAsExcelFile(json: any[], excelFileName: string, header: any[] = null): void {
    // console.log('ExcelProvider exportAsExcelFile()',json,excelFileName);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    if (header) {
      for (let i = 0, len = header.length; i < len; i++) {
        const obj = header[i];
        worksheet[obj.key] = { t: 's', v: obj.value, s: { 'bgColor': { rgb: '003d79' } } };
      }
    }
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    if (this.platform.is('ios') || this.platform.is('android')) {
      const wbout = XLSX.write(workbook, {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
      });

      let dirPath = '';
      if (this.platform.is('android')) {
        dirPath = this.file.externalRootDirectory;
      } else if (this.platform.is('ios')) {
        dirPath = this.file.documentsDirectory;
      }

      const dirName = 'ExcelExport';
      const saveDir = dirPath + '/' + dirName + '/';
      const fileName = 'export.xlsx';

      this.file.createDir(dirPath, dirName, true).then((dirEntry) => {
        const saveDir = dirPath + '/' + dirName + '/';
        this.file.createFile(saveDir, fileName, true).then((fileEntry) => {
          fileEntry.createWriter((fileWriter) => {
            fileWriter.onwriteend = () => {
              // this.hideLoading();
              // this.showReportAlert('Report downloaded', saveDir + fileName);
              this.fileOpener.open(saveDir + fileName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                .then(() => console.log('File is opened'))
                .catch(e => console.log('Error openening file', e));
            };
            fileWriter.onerror = (e) => {
              // this.hideLoading();
              // this.showAlert('Cannot write report', e.toString());
            };
            fileWriter.write(this.s2ab(wbout));
          });
        }).catch((error) => { });
      }).catch((error) => { });
    } else {
      XLSX.writeFile(workbook, excelFileName, { bookType: 'xlsx', type: 'array' });
    }
  }

  s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  }

}
