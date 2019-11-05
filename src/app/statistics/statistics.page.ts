import { Component, OnInit, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { ApiService } from '../services/api';
import { ExcelService } from '../services/excel';
import { PdfExportService } from '../services/pdf-export';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
})
export class StatisticsPage implements OnInit {

  public startDate: any;
  public maxStartDate: any;
  public endDate: any;
  public exportDate: any;
  public minEndDate: any;
  public maxEndDate: any;
  public statisticType: any;
  public email: any;
  public listStatistic: any[] = [];
  public cols: any[] = [];
  public companyCount: any;
  public ratingA: any;
  public ratingB: any;
  public ratingC: any;
  public ratingF: any;
  public visitReport: any;
  public visitReportSum: any;
  public listStatisticMaster: any[] = [];
  public listStatisticMasterDetail: any[] = [];
  public mouseoverButton1: boolean;
  public mouseoverButton2: boolean;
  public mouseoverButton3: boolean;
  public mobilePlatform: boolean;
  public specialCustomer: any = [];
  public winWidth: any;
  public winHeight: any;
  public statisticHeight: any;
  public pieOK: boolean;

  constructor(public userdata: UserdataService,
              public translate: TranslateService,
              private alertCtrl: AlertController,
              public apiService: ApiService,
              public excelService: ExcelService,
              private loadingCtrl: LoadingController,
              public platform: Platform,
              public pdf: PdfExportService,
              private ngZone: NgZone) {

      this.mobilePlatform = false;
      this.pieOK = false;

      platform.ready().then(() => {
        if ( this.platform.is('ios') ||
          this.platform.is('android') ) {
          this.mobilePlatform = true;
          this.mouseoverButton1 = true;
          this.mouseoverButton2 = true;
          this.mouseoverButton3 = true;
          console.log('platform mobile:', this.platform.platforms());
        } else {
          console.log('platform not mobile:', this.platform.platforms());
          this.mobilePlatform = false;
          this.mouseoverButton1 = false;
          this.mouseoverButton2 = false;
          this.mouseoverButton3 = false;
        }
      });

      this.winWidth = window.innerWidth;
      this.winHeight = window.innerHeight;
      this.statisticHeight = this.winHeight - 190;
      window.onresize = (e) => {
        // ngZone.run will help to run change detection
        this.ngZone.run(() => {
            this.winWidth = window.innerWidth;
            this.winHeight = window.innerHeight;
        });
        console.log('with - height :', this.winWidth, this.winHeight);
        this.statisticHeight = this.winHeight - 190;
        console.log('statisticHeight :', this.statisticHeight);
      };

   }

  mouseover(buttonNumber) {
    if (buttonNumber == 1) {
      this.mouseoverButton1 = true;
    } else if (buttonNumber == 2) {
      this.mouseoverButton2 = true;
    } else if (buttonNumber == 3) {
      this.mouseoverButton3 = true;
    }
  }

  mouseout(buttonNumber) {
    if (this.mobilePlatform == false) {
      if (buttonNumber == 1) {
        this.mouseoverButton1 = false;
      } else if (buttonNumber == 2) {
        this.mouseoverButton2 = false;
      } else if (buttonNumber == 3) {
        this.mouseoverButton3 = false;
      }
    }
  }

  ngOnInit() {

    this.cols = [
      { field: 'name_user', header: this.translate.instant('Benutzername') },
      { field: 'company', header: this.translate.instant('Firma') },
      { field: 'rating', header: this.translate.instant('Wertung') },
      { field: 'zipcode_place', header: this.translate.instant('PLZ') },
      { field: 'sector', header: this.translate.instant('Branche') },
      { field: 'visitReport', header: this.translate.instant('Anzahl') },
    ];
    this.startDate = new Date();
    this.endDate = new Date();
    this.startDate.setDate(this.endDate.getDate() - 30);
    this.startDate = this.startDate.toISOString();
    this.endDate = this.endDate.toISOString();
    this.statisticType = '1';
    this.email = this.userdata.email;
    this.companyCount = 0;
    this.visitReport = 0;
    this.visitReportSum = 0;
    this.statistic();
   }

  validateEmail(email) {
    let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    if (reg.test(email) == false) {
        return (false);
    } else {
        return (true);
    }
  }

  showMessage(msg: any) {
    const alert = this.alertCtrl.create({
      header: this.translate.instant('information'),
      message: this.translate.instant(msg),
      buttons: [
        {
          text: this.translate.instant('okay'),
          handler: () => {
          }
        }
      ]
    }).then(x => x.present());
  }

  async statistic() {
    this.pieOK = false;
    const loader = await this.loadingCtrl.create({
        message: this.translate.instant('Bitte warten')
    });
    loader.present();

    this.maxStartDate = this.endDate;
    this.minEndDate = this.startDate;
    this.maxEndDate = new Date().toISOString();

    console.log('Dates :', this.userdata.id, this.startDate.substr(0, 10), this.endDate.substr(0, 10));

    this.apiService.pvs4_get_colleagues_list(this.userdata.role, this.userdata.role_set, this.userdata.licensee)
    .then((result: any) => {
      console.log('pvs4_get_colleagues_list result:', result);
      const k = result['obj'];
      result['amount'] = parseInt(result['amount']);
      this.listStatisticMaster = [];

      if (result['amount'] > 0) {
        for (let i = 0, len = k.length; i < len; i++) {
          const item = k[i];
          const obj: any = {};
          obj.id = parseInt(item.id);
          obj.header = item.first_name + ' ' + item.last_name;
          this.listStatisticMaster.push(obj);
        }
      }
      console.log('listStatisticMaster', this.listStatisticMaster);

      this.listStatisticMaster.sort((a, b) => {
        if (a.header != null) {
          return a.header.localeCompare(b.header);
        } else if (b.header != null) {
          return b.header.localeCompare(a.header);
        }
      });

      const x = this.listStatisticMaster.length;
      let y = 0;
      this.listStatisticMaster.forEach(eventX => {
        console.log('listStatisticMaster event ', eventX);

        this.listStatistic = [];
        this.listStatisticMasterDetail = [];
        if (this.statisticType == '3') {
          this.apiService.pvs4_get_statistics(1,
                                              eventX.id,
                                              this.startDate.substr(0, 10),
                                              this.endDate.substr(0, 10)).then((result: any) => {
            this.listStatisticMasterDetail = [];
            let statisticList = result.list;
            console.log('list notes:', statisticList);
            statisticList.forEach(event => {
              event.data.visitReport = '1';
              //this.listStatistic.push(event.data);
              this.listStatisticMasterDetail.push(event.data);
            });
          });

          this.apiService.pvs4_get_statistics(2,
                                              eventX.id,
                                              this.startDate.substr(0, 10),
                                              this.endDate.substr(0, 10)).then((result: any) => {
            let statisticList = result.list;
            y++;
            console.log('list appointment:', statisticList);
            statisticList.forEach(event => {
              event.data.visitReport = '1';
              //this.listStatistic.push(event.data);
              this.listStatisticMasterDetail.push(event.data);
            });

            //this.statisticSummary(this.listStatistic);
            //this.statisticSummaryItem(eventX, this.listStatisticMasterDetail);
            eventX.data = this.listStatisticMasterDetail;
            eventX.count = this.listStatisticMasterDetail.length;
            if (x==y) {
              console.log('OK NOTE & APP', x, y);
              this.listItemGroup();
            }
            loader.dismiss();
          });
        } else {
          this.apiService.pvs4_get_statistics(this.statisticType,
                                              eventX.id,
                                              this.startDate.substr(0, 10),
                                              this.endDate.substr(0, 10)).then((result: any) => {
            this.listStatisticMasterDetail = [];
            y++;
            let statisticList = result.list;
            console.log('list notes:', statisticList);

            statisticList.forEach(event => {
              event.data.visitReport = '1';
              //this.listStatistic.push(event.data);
              this.listStatisticMasterDetail.push(event.data);
            });

            //this.statisticSummary(this.listStatistic);
            //this.statisticSummaryItem(eventX, this.listStatisticMasterDetail);
            eventX.data = this.listStatisticMasterDetail;
            eventX.count = this.listStatisticMasterDetail.length;
            if (x==y) {
              console.log('OK NOTE', x, y);
              this.listItemGroup();
            }
            loader.dismiss();
          });
        }
      });
    }).catch(err => {
      loader.dismiss();
      console.log('pvs4_get_colleagues_list err: ', err);
    });
  }

  // statisticSummary(statisticList: any) {
  //   var sortarray = [{field:'name_user', direction:'asc'}, {field:'company', direction:'asc'}];
  //   statisticList.sort(function(a,b){
  //     for(var i=0; i<sortarray.length; i++){
  //         let retval = a[sortarray[i].field] < b[sortarray[i].field] ? -1 : a[sortarray[i].field] > b[sortarray[i].field] ? 1 : 0;
  //         if (sortarray[i].direction == "desc") {
  //             retval = retval * -1;
  //         }
  //         if (retval !== 0) {
  //             return retval;
  //         }
  //     }
  //   });
  //   let i: any = 0;
  //   let companyArr: any = [];
  //   this.ratingA = 0;
  //   this.ratingB = 0;
  //   this.ratingC = 0;
  //   this.ratingF = 0;
  //   this.visitReportSum = 0;
  //   statisticList.forEach(event => {
  //     if (event.rating == 'A') {
  //       this.ratingA++;
  //     }
  //     if (event.rating == 'B') {
  //       this.ratingB++;
  //     }
  //     if (event.rating == 'C') {
  //       this.ratingC++;
  //     }
  //     if (event.rating == 'F') {
  //       this.ratingF++;
  //     }
  //     companyArr[i] = event.company;
  //     i++;
  //     this.visitReportSum = this.visitReportSum + parseInt(event.visitReport);
  //   });
  //   companyArr = companyArr.sort();

  //   let companyName = '';
  //   this.companyCount = 0;
  //   companyArr.forEach(event => {
  //     if (event != companyName) {
  //       this.companyCount++;
  //       companyName = event;
  //     }
  //   });
  // }

  statisticSummaryItem(item, statisticList: any) {
    let i: any = 0;
    let companyArr: any = [];
    let ratingA = 0;
    let ratingB = 0;
    let ratingC = 0;
    let ratingF = 0;
    let visitReportSum = 0;
    let companyCount = 0;
    statisticList.forEach(event => {
      if (event.rating == 'A') {
        ratingA++;
      }
      if (event.rating == 'B') {
        ratingB++;
      }
      if (event.rating == 'C') {
        ratingC++;
      }
      if (event.rating == 'F') {
        ratingF++;
      }
      companyCount++;
      //companyArr[i] = event.company;
      i++;
      visitReportSum = visitReportSum + parseInt(event.visitReport);
    });
    companyArr = companyArr.sort();

    // let companyName = '';
    // let companyCount = 0;
    // companyArr.forEach(event => {
    //   if (event != companyName) {
    //     companyCount++;
    //    companyName = event;
    //   }
    //   console.log('companyName', event, companyCount)
    // });

    item.ratingA = ratingA;
    item.ratingB = ratingB;
    item.ratingC = ratingC;
    item.ratingF = ratingF;
    item.visitReportSum = visitReportSum;
    item.companyCount = companyCount;
  }

  listItemGroup() {
    console.log('this.listStatisticMaster', this.listStatisticMaster);
    function groupBy(data, fields, sumBy = 'visitReport') {
      const r = [], cmp = (x, y) => fields.reduce((a, b) => a && x[b]==y[b], true);
      data.forEach(x => {
        const y = r.find(z => cmp(x, z));
        const w = [...fields, sumBy].reduce((a, b) => (a[b] = x[b], a), {})
        y ? y[sumBy] = +y[sumBy] + (+x[sumBy]) : r.push(w);
      });
      return r;
    }

    this.listStatistic = [];

    for (let i = 0; i < this.listStatisticMaster.length; i++ ) {
      this.listStatisticMaster[i].data.sort((a, b) => {
        if (a.company != null) {
          return a.company.localeCompare(b.company);
        } else if (b.company != null) {
          return b.company.localeCompare(a.company);
        }
      });
      this.listStatisticMaster[i].data = groupBy(this.listStatisticMaster[i].data, ['company', 'rating', 'zipcode_place', 
      'sector', 'name_user']);
      this.listStatisticMaster[i].data.forEach(event => {
        this.listStatistic.push(event);
      });
      this.statisticSummaryItem(this.listStatisticMaster[i], this.listStatisticMaster[i].data);
    }
    this.pieOK = true;
    console.log('listStatistic', this.listStatistic);
  }

  async exportExcel() {
    if (this.listStatistic.length > 0) {
      // export excel
      this.exportDate = new Date();
      this.exportDate = this.exportDate.toISOString();

      const loader = await this.loadingCtrl.create({
        message: this.translate.instant('Bitte warten')
      });
      loader.present();

      const data: any = [];
      for (var i = 0, len = this.listStatistic.length; i < len; i++) {
        let obj = this.listStatistic[i];
        if (!obj.company) { obj.company = ''; }
        obj.company = obj.company.replace(/(\\r\\n|\\n|\\r)/gm, ' ');
        let json: any = {};
        for (var j = 0; j < this.cols.length; j++) {
            if (obj[this.cols[j].field]) {
                json[this.cols[j].header] = obj[this.cols[j].field];
            } else {
                json[this.cols[j].header] = '';
            }
        }
        console.log('>>json :', json);
        data.push(json);
      }
      this.excelService.exportAsExcelFile(data, 'statistic_' + this.exportDate.substr(0, 19) + '.xlsx');
      loader.dismiss();
    } else {
      this.showMessage('No data.');
    }
  }

  sendEmail() {
    if (this.listStatistic.length > 0) {
      // check email
      if (this.email != '') {
        if (this.validateEmail(this.email) == true) {
          // send mail

          this.exportDate = new Date();
          this.exportDate = this.exportDate.toISOString();

          this.pdf_export_toEMail('base64').then(async (result: string) => {
            console.log('pdf result :', result);

            let subject = this.startDate.substr(0, 10) + ' - ' + this.endDate.substr(0, 10) + ', ' +
            this.translate.instant('Statistik') + '_' + this.exportDate.substr(0, 19) + '.pdf';

            // Datumsbereich -- Date Range
            // Empfangsdatum -- Received Date
            let altBody = this.translate.instant('Datumsbereich') + ' : ' + this.startDate.substr(0, 10) + ' / ' + this.endDate.substr(0, 10)
            + '\n' + this.translate.instant('Empfangsdatum') + ' : ' + this.exportDate.substr(0, 19);

            let params = {
              Betreff: subject,
              Empfaenger: this.email,
              Copy: '',
              AltBody: altBody,
              pdfBase64: result,
              ExportDate: this.exportDate.substr(0, 19),
              UserVorname: this.userdata.first_name,
              UserName: this.userdata.last_name,
              UserEmail: this.userdata.email,
              Type: this.userdata.licensee
            };
            console.log('params', params);
            this.send(params);
          });
        } else {
          this.showMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
        }
      } else {
        this.showMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      }
    } else {
      this.showMessage('No data.');
    }
  }

  async send(params) {
    console.log('send params :', params);

    console.log(JSON.stringify(params));
    this.apiService.pvs4_set_statistic_send(params).then(async (result: any) => {
      console.log('pvs4_set_statistic_send :', result);
      if (result != null) {
        if (result['status'] == 1) {
          // OK
          let alert = await this.alertCtrl.create({ header: this.translate.instant('information'),
              message: this.translate.instant('Die Nachricht wurde erfolgreich versendet.'),
              buttons: [
                {
                  text: this.translate.instant('okay'),
                  handler: () => {

                  }
                }
              ]
          });
          alert.present();
        } else {
          // NOK
          console.log('set_statistic_send.php NOK:', result);
          let alert = await this.alertCtrl.create({ header: this.translate.instant('information'),
                                              message: this.translate.instant('Die Nachricht konnte nicht versandt werden!'),
                                              buttons: [
                                                {
                                                  text: this.translate.instant('okay'),
                                                  handler: () => {

                                                  }
                                                }
                                              ]
          });
          alert.present();
        }
      } else {
        // NOK
        console.log('set_statistic_send.php NOK:', result);
        let alert = await this.alertCtrl.create({ header: this.translate.instant('information'),
                                            message: this.translate.instant('Die Nachricht konnte nicht versandt werden!'),
                                            buttons: [
                                              {
                                                text: this.translate.instant('okay'),
                                                handler: () => {

                                                }
                                              }
                                            ]
        });
        alert.present();
      }
    });
  }

  async pdf_export_toEMail(pdfMethod: any) {

    this.exportDate = new Date();
    this.exportDate = this.exportDate.toISOString();

    const loader = await this.loadingCtrl.create({
        message: this.translate.instant('Bitte warten')
    });
    loader.present();
    return new Promise((res) => {
      let columns: any[] = [];
      let widthsArray: string[] = [];
      let bodyArray: any[] = [];
      let headerRowVisible: any = 1;
      for (var k = 0; k < this.cols.length; k++) {
          columns.push({ text: this.cols[k].header, style: 'header' });
          widthsArray.push('*');
      }
      bodyArray.push(columns);

      let obj: any;
      let rowArray: any[] = [];
      for (var i = 0, len = this.listStatistic.length; i < len; i++) {
          obj = this.listStatistic[i];
          rowArray = [];
          for (var j = 0; j < this.cols.length; j++) {
              if (obj[this.cols[j].field]) {
                  rowArray.push(obj[this.cols[j].field]);
              } else {
                  rowArray.push('');
              }
          }

          bodyArray.push(rowArray);
      }

      this.specialCustomer = [
        {
            kid: 92734,
            line1: 'Musterfirma',
            line2: 'Musterstr 12',
            line3: 'PLZ Musterland',
            line4: ' ',
            logo: 'logo_musterfirma.jpg',
            banner: 'banner_musterfirma.jpg'
        },
        {
            kid: 29328,
            line1: ' ',
            line2: ' ',
            line3: ' ',
            line4: ' ',
            logo: 'bischag-logo.svg',
            banner: 'banner_bischag.jpg'
        }
      ];

      let src = 'assets/imgs/banner_' + this.userdata.licensee + '.jpg';
      let pageDesc: string = this.translate.instant('Seite');

      if (this.userdata.Type >= 20) {
          for (let i = 0, len = this.specialCustomer.length; i < len; i++) {
              if (this.specialCustomer[i].kid == this.userdata.idKunde) {
                  src = 'assets/imgs/' + this.specialCustomer[i].banner;
              }
          }
      }

      let title = this.translate.instant('Statistik');

      this.pdf.toDataURL(src, result => {
        let docDefinition = {
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
                  // bold: true,
                  color: '#ffffff',
                  fillColor: '#009de0'
              }
          }
        };

        this.pdf.createPdf(docDefinition,
                           pdfMethod,
                           this.translate.instant('Statistik') + '_' + this.exportDate.substr(0, 19) + '.pdf').then((result) => {
            // console.log('pdf result :', result);
          loader.dismiss();
          res(result);
        });
      });

    });
  }

  async pdf_export() {
    if (this.listStatistic.length > 0) {
      // export pdf

      this.exportDate = new Date();
      this.exportDate = this.exportDate.toISOString();

      const loader = await this.loadingCtrl.create({
          message: this.translate.instant('Bitte warten')
      });
      loader.present();

      let columns: any[] = [];
      let widthsArray: string[] = [];
      let bodyArray: any[] = [];
      let headerRowVisible: any = 1;
      for (var k = 0; k < this.cols.length; k++) {
          columns.push({ text: this.cols[k].header, style: 'header' });
          widthsArray.push('*');
      }
      bodyArray.push(columns);

      let obj: any;
      let rowArray: any[] = [];
      for (var i = 0, len = this.listStatistic.length; i < len; i++) {
          obj = this.listStatistic[i];
          rowArray = [];
          for (var j = 0; j < this.cols.length; j++) {
              if (obj[this.cols[j].field]) {
                  rowArray.push(obj[this.cols[j].field]);
              } else {
                  rowArray.push('');
              }
          }

          bodyArray.push(rowArray);
      }

      this.pdf.get_ListDocDefinition(bodyArray,
                                     widthsArray,
                                     headerRowVisible,
                                     this.translate.instant('Statistik'),
                                     this.translate.instant('Statistik') + '_' + this.exportDate.substr(0, 19) + '.pdf');
      loader.dismiss();
    } else {
      this.showMessage('No data.');
    }
  }

}
