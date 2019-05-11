import { Injectable } from '@angular/core';
import { Platform} from '@ionic/angular';
import { UserdataService } from './userdata';
import { ApiService } from './api';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';

/*
  Generated class for the PdfExportProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable({
    providedIn: 'root',
  })
export class PdfExportService {
  public specialCustomer: any = [];
    constructor(
        public userdata: UserdataService,
        public apiProvider: ApiService,
        public platform: Platform,
        private file: File,
        private fileOpener: FileOpener) {
          this.specialCustomer = [
            {
                kid: 92734,
                line1: "Musterfirma",
                line2: "Musterstr 12",
                line3: "PLZ Musterland",
                line4: " ",
                logo: "logo_musterfirma.jpg",
                banner: "banner_musterfirma.jpg"
            },
            {
                kid: 29328,
                line1: " ",
                line2: " ",
                line3: " ",
                line4: " ",
                logo: "bischag-logo.svg",
                banner: "banner_bischag.jpg"
            }
        ];
    
    }

    get_ListDocDefinition(bodyArray: any[], widthsArray: any[], title: string, fileName: string) {
        let src = 'assets/imgs/banner.jpg';
        let addr1 = 'Brugg Drahtseil AG';
        let addr2 = 'Wydenstrasse 36';
        let addr3 = 'CH-5242 Birr';
        let addr4 = ' ';

        if (this.userdata.Type >= 20) {
            for (let i = 0, len = this.specialCustomer.length; i < len; i++) {
                if (this.specialCustomer[i].kid == this.userdata.idKunde) {
                    src = 'assets/imgs/' + this.specialCustomer[i].banner;
                    addr1 = this.specialCustomer[i].line1;
                    addr2 = this.specialCustomer[i].line2;
                    addr3 = this.specialCustomer[i].line3;
                    addr4 = this.specialCustomer[i].line4;
                }
            }
        }

        this.toDataURL(src,result => {
                var docDefinition = {
                    pageSize: 'A4',
                    pageOrientation: 'landscape',
                    pageMargins: [20, 140, 20, 20],
                    background: { image: result, width: 800, margin: 20 },
                    header: {
                        columns: [
                            [
                                { text: addr1, margin: [30, 30, 0, 0], fontSize: 12 },
                                { text: addr2, margin: [30, 5, 0, 0], fontSize: 12 },
                                { text: addr3, margin: [30, 5, 0, 0], fontSize: 12 },
                                { text: addr4, margin: [30, 5, 0, 33], fontSize: 12 }
                            ],
                            [{ text: ' ' }, { text: ' ' }, { text: ' ' }, { text: ' ' }]
                        ]
                    },
                    content: [{ text: title, style: 'title' },
                    { text: ' ' },
                    {
                        layout: {
                            hLineColor: function (i, node) { return '#cccccc'; },
                            vLineColor: function (i, node) { return '#cccccc'; },
                            paddingTop: function (i, node) { return 4; },
                            paddingBottom: function (i, node) { return 4; },
                        },
                        table: {
                            headerRows: 1,
                            widths: widthsArray,
                            body: bodyArray
                        }
                    }
                    ],
                    styles: {
                        title: {
                            fontSize: 22,
                            bold: true
                        },
                        header: {
                            fontSize: 16,
                            //bold: true,
                            color: '#ffffff',
                            fillColor: '#009de0'
                        }
                    }
                };

                this.createPdf(docDefinition, fileName)
            });
    }

    toDataURL(url:string,callback) {
  
      var canvas: any = document.createElement("canvas");
      var image = new Image();
      image.src = url;
      image.crossOrigin = "Anonymous";
  
      image.onload = () => {
        var width = image.width;
        var height = image.height;
  
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
   
        ctx.drawImage(image, 0, 0, width, height);
   
        var dataUrl = canvas.toDataURL('image/png', 1);
        callback(dataUrl)
      }   
      /*  return fetch(url, { mode: "no-cors" })
            .then(response => response.blob())
            .then(blob => new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result)
                reader.onerror = reject
                reader.readAsDataURL(blob)
            }));*/
    }

    createPdf(docDefinition, fileName) {
        if (this.platform.is('ios') || this.platform.is('android')) {
            // FOR MOBILE DEVICES
            pdfMake.createPdf(docDefinition).getBuffer((buffer) => {
                var utf8 = new Uint8Array(buffer); // Convert to UTF-8...
                let binaryArray = utf8.buffer; // Convert to Binary...

                let dirPath = "";
                if (this.platform.is('android')) {
                    dirPath = this.file.externalRootDirectory;
                } else if (this.platform.is('ios')) {
                    dirPath = this.file.documentsDirectory;
                }

                let dirName = 'DailySheet';

                this.file.createDir(dirPath, dirName, true).then((dirEntry) => {
                    let saveDir = dirPath + '/' + dirName + '/';
                    this.file.createFile(saveDir, fileName, true).then((fileEntry) => {
                        fileEntry.createWriter((fileWriter) => {
                            fileWriter.onwriteend = () => {
                                // this.hideLoading();
                                // this.showReportAlert('Report downloaded', saveDir + fileName);
                                this.fileOpener.open(saveDir + fileName, 'application/pdf')
                                    .then(() => console.log('File is opened'))
                                    .catch(e => console.log('Error openening file', e));
                            };
                            fileWriter.onerror = (e) => {
                                // this.hideLoading();
                                // this.showAlert('Cannot write report', e.toString());
                            };
                            fileWriter.write(binaryArray);
                        });
                    }).catch((error) => { });
                }).catch((error) => { });
            });
        }
        else {
            //FOR BROWSERS
            pdfMake.createPdf(docDefinition).download(fileName);

        }
    }
}
