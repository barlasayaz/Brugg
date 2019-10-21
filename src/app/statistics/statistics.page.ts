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
  public statistics: any;
  public email: any;
  public listStatistic: any[] = [];
  public cols: any[] = [];

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
      { field: 'company', header: this.translate.instant('Firma') },
      { field: 'name_user', header: this.translate.instant('Wertung') },
      { field: 'name_contact', header: this.translate.instant('PLZ') },
      { field: 'category', header: this.translate.instant('Branche') },
      { field: 'appointment_type', header: this.translate.instant('Anzahl Besuchsberichte') },
    ];
    this.startDate = new Date();
    this.endDate = new Date();
    this.startDate.setDate(this.endDate.getDate() - 30);
    this.startDate = this.startDate.toISOString();
    this.endDate = this.endDate.toISOString();
    this.statistics = '0';
    this.email = this.userdata.email;
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

    this.apiService.pvs4_get_statistics(1,
                                        this.userdata.id,
                                        this.startDate.substr(0, 10),
                                        this.endDate.substr(0, 10)).then((result: any) => {
      let statisticList = result.list;
      console.log('list notes:', statisticList);
      statisticList.forEach(event => {
        this.listStatistic.push(event.data);
      });
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
