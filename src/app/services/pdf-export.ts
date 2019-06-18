import { Injectable } from '@angular/core';
import { Platform} from '@ionic/angular';
import { UserdataService } from './userdata';
import { ApiService } from './api';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { TranslateService } from '@ngx-translate/core';

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
        public translate: TranslateService,
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
      
      get_ListDocDefinition(bodyArray: any[], 
                            widthsArray: any[], 
                            headerRowVisible: any,
                            title: string, 
                            fileName: string) {
                                
          let src = 'assets/imgs/banner_'+this.userdata.licensee+'.jpg';
          let pageDesc: string = this.translate.instant('Seite');
  /*         let addr1 = 'Brugg Drahtseil AG';
          let addr2 = 'Wydenstrasse 36';
          let addr3 = 'CH-5242 Birr';
          let addr4 = ' '; */
  
          if (this.userdata.Type >= 20) {
              for (let i = 0, len = this.specialCustomer.length; i < len; i++) {
                  if (this.specialCustomer[i].kid == this.userdata.idKunde) {
                      src = 'assets/imgs/' + this.specialCustomer[i].banner;
  /*                     addr1 = this.specialCustomer[i].line1;
                      addr2 = this.specialCustomer[i].line2;
                      addr3 = this.specialCustomer[i].line3;
                      addr4 = this.specialCustomer[i].line4; */
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
  /*                             [
                                  { text: addr1, margin: [30, 30, 0, 0], fontSize: 12 },
                                  { text: addr2, margin: [30, 5, 0, 0], fontSize: 12 },
                                  { text: addr3, margin: [30, 5, 0, 0], fontSize: 12 },
                                  { text: addr4, margin: [30, 5, 0, 33], fontSize: 12 }
                              ], */
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
                              headerRows: headerRowVisible,
                              widths: widthsArray,
                              body: bodyArray
                          },
                          fontSize: 10
                      }
                      ],
                      footer: function (currentPage, pageCount) {
                        return { text: pageDesc + ' ' + currentPage.toString() + ' / ' + pageCount, alignment: 'center' }
                      },
                      styles: {
                          title: {
                              fontSize: 16,
                              bold: true
                          },
                          header: {
                              fontSize: 10,
                              //bold: true,
                              color: '#ffffff',
                              fillColor: '#009de0'
                          }
                      }
                  };
  
                  this.createPdf(docDefinition,'download', fileName);
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
  
      createPdf(docDefinition, pdfMethod, fileName) {
          return new Promise((res) => { 
              if (this.platform.is('ios') || this.platform.is('android')) {
                  // FOR MOBILE DEVICES
                  if(pdfMethod == 'base64') {
                      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
                      pdfDocGenerator.getBase64((data) => {
                          // alert(data);
                          console.log("PDF base64 :", data);
                          res(data);
                      });
                  } else {
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
                          res(buffer);
                      });                    
                  }
              }
              else {
                  //FOR BROWSERS
                  // Download the PDF
                  if(pdfMethod == 'download') {
                      pdfMake.createPdf(docDefinition).download(fileName);
                      res('');
                  }
                  // Open the PDF in a new window 
                  if(pdfMethod == 'open') {
                      pdfMake.createPdf(docDefinition).open();
                      res('');
                  }
                  // Print the PDF 
                  if(pdfMethod == 'print') {
                      pdfMake.createPdf(docDefinition).print({}, window);
                      res('');
                  }
                  // Put the PDF into your own page as URL data
                  if(pdfMethod == 'url') {
                      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
                      pdfDocGenerator.getDataUrl((dataUrl) => {
                          const targetElement = document.querySelector('#iframeContainer');
                          const iframe = document.createElement('iframe');
                          iframe.src = dataUrl;
                          targetElement.appendChild(iframe);
                          console.log("PDF url :", targetElement);
                          res(targetElement);
                      });                
                  }
                  // Get the PDF as base64 data
                  if(pdfMethod == 'base64') {
                      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
                      pdfDocGenerator.getBase64((data) => {
                          // alert(data);
                          console.log("PDF base64 :", data);
                          res(data);
                      });
                  } 
                  // Get the PDF as buffer 
                  if(pdfMethod == 'buffer') {
                      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
                      pdfDocGenerator.getBuffer((buffer) => {
                          // alert(buffer);
                          console.log("PDF buffer :", buffer);
                          res(buffer);
                      });
                  }
                  // Get the PDF as Blob
                  if(pdfMethod == 'blob') {
                      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
                      pdfDocGenerator.getBlob((blob) => {
                          // alert(blob);
                          console.log("PDF Blob :", blob);
                          res(blob);
                      });
                  }
                  // Get PDFKit document object
                  if(pdfMethod == 'pdfkit') {
                      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
                      var document = pdfDocGenerator.getStream();
                      console.log("PDF pdfkit :", document);
                      res(document);
                  }
              }
          });
          }
      }
  