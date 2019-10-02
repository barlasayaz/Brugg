import { Component } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-old-browser',
  templateUrl: './old-browser.page.html',
  styleUrls: ['./old-browser.page.scss'],
})
export class OldBrowserPage {

  constructor(public navCtrl: NavController,
    public viewCtrl: ModalController,
    public translate: TranslateService) {

  }

}
