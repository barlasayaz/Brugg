import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

/**
 * Generated class for the DialogproduktbildmodalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-dialogproduktbildmodal',
  templateUrl: './dialogproduktbildmodal.component.html',
  styleUrls: ['./dialogproduktbildmodal.component.scss'],
})
export class DialogproduktbildmodalPage {

  public dir: any = '';
  public plist: any [];
  public plist_old: any [];
  public Bild: any = '=';
  public modalTitle: string;
  public redDirect: any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public translate: TranslateService,
              public modalCtrl: ModalController,
              private httpService: HttpClient) {

  }

  ngOnInit () {

    this.redDirect = this.navParams.get('redDirect');
    if (this.redDirect == 1) {
      this.modalTitle = this.translate.instant('Produktbild');
    }
    if (this.redDirect == 2) {
      this.modalTitle = this.translate.instant('Protokollebild');
    }

    this.httpService.get('./assets/img/file_list.json').subscribe(
      data => {
        this.plist = data as object [];
        this.plist_old = this.plist;
        this.Bild = this.navParams.get('Bild');
      },
      (err: HttpErrorResponse) => {
        console.log (err.message);
      }
    );
  }

  back() {
    this.plist = this.plist_old;
    this.dir = '';
  }

  get_img(file) {
    let datei = 'assets/img/' + this.dir + file;
    this.Bild = datei;
    this.dismiss();
  }

  go_dir(dir) {
    for (let i = 0, len = this.plist.length; i < len; i++) {
      if (this.plist[i].filename == dir) {
         this.plist_old = this.plist;
         this.plist = this.plist[i].file_list;
         this.dir += dir + '/';
         return;
      }
    }
  }

  dismiss() {
    const data = this.Bild;
    this.modalCtrl.dismiss(data);
  }

}
