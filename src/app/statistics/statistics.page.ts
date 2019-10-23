import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { AlertController, LoadingController } from '@ionic/angular';
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
  public ratingD: any;
  public visitReport: any;
  public visitReportSum: any;

  constructor(public userdata: UserdataService,
              public translate: TranslateService,
              private alertCtrl: AlertController,
              public apiService: ApiService,
              public excelService: ExcelService,
              private loadingCtrl: LoadingController,
              public pdf: PdfExportService) {

   }

  ngOnInit() {
    this.cols = [
      { field: 'name_user', header: this.translate.instant('Benutzername') },
      { field: 'company', header: this.translate.instant('Firma') },
      { field: 'rating', header: this.translate.instant('Wertung') },
      { field: 'zipcode_place', header: this.translate.instant('PLZ') },
      { field: 'sector', header: this.translate.instant('Branche') },
      { field: 'name_contact', header: this.translate.instant('Ansprechpartner') },
      { field: 'appointment_type', header: this.translate.instant('Besuchsberichte') },
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

  statistic() {
    this.maxStartDate = this.endDate;
    this.minEndDate = this.startDate;
    this.maxEndDate = new Date().toISOString();

    console.log('Dates :', this.userdata.id, this.startDate.substr(0, 10), this.endDate.substr(0, 10));

    this.listStatistic = [];
    if (this.statisticType == '3') {
      this.apiService.pvs4_get_statistics(1,
                                          this.userdata.id,
                                          this.startDate.substr(0, 10),
                                          this.endDate.substr(0, 10)).then((result: any) => {
        let statisticList = result.list;
        console.log('list notes:', statisticList);
        statisticList.forEach(event => {
          event.data.visitReport = '1';
          this.listStatistic.push(event.data);
        });

        this.apiService.pvs4_get_statistics(2,
                                            this.userdata.id,
                                            this.startDate.substr(0, 10),
                                            this.endDate.substr(0, 10)).then((result: any) => {
          let statisticList = result.list;
          console.log('list notes:', statisticList);
          statisticList.forEach(event => {
            event.data.visitReport = '1';
            this.listStatistic.push(event.data);
          });

          this.statisticSummary(this.listStatistic);

        });
      });
    } else {
      this.apiService.pvs4_get_statistics(this.statisticType,
                                          this.userdata.id,
                                          this.startDate.substr(0, 10),
                                          this.endDate.substr(0, 10)).then((result: any) => {
        let statisticList = result.list;
        console.log('list notes:', statisticList);
        statisticList.forEach(event => {
          event.data.visitReport = '1';
          this.listStatistic.push(event.data);
        });

        this.statisticSummary(this.listStatistic);

      });
    }

  }

  statisticSummary(statisticList: any) {
    let i: any = 0;
    let companyArr: any = [];
    this.ratingA = 0;
    this.ratingB = 0;
    this.ratingC = 0;
    this.ratingD = 0;
    this.visitReportSum = 0;
    statisticList.forEach(event => {
      if (event.rating == 'A') {
        this.ratingA++;
      }
      if (event.rating == 'B') {
        this.ratingB++;
      }
      if (event.rating == 'C') {
        this.ratingC++;
      }
      if (event.rating == 'D') {
        this.ratingD++;
      }
      companyArr[i] = event.company;
      i++;
      this.visitReportSum = this.visitReportSum + parseInt(event.visitReport);
    });
    companyArr = companyArr.sort();

    let companyName = '';
    this.companyCount = 0;
    companyArr.forEach(event => {
      if (event != companyName) {
        this.companyCount++;
        companyName = event;
      }
    });
  }

  async exportExcel() {
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
    this.excelService.exportAsExcelFile(data, 'statistic.xlsx');
    loader.dismiss();
  }

  sendEmail() {
    if (this.email != '') {
      if (this.validateEmail(this.email) == true) {
          // send mail
      } else {
        this.showMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      }
    } else {
      this.showMessage('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
    }
  }

  async pdf_export() {
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
                                   this.translate.instant('Statistik') + '.pdf');
    loader.dismiss();
  }

}
