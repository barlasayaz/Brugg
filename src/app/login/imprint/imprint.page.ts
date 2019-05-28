import { Component } from '@angular/core';
import { NavController, ModalController} from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-imprint',
  templateUrl: './imprint.page.html',
  styleUrls: ['./imprint.page.scss'],
})
export class ImprintPage {

  constructor(public navCtrl: NavController,
              public viewCtrl: ModalController,
              public translate: TranslateService) {
       
    }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
