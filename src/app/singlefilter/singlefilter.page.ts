import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';


/**
 * Generated class for the SinglefilterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-singlefilter',
  templateUrl: './singlefilter.page.html',
  styleUrls: ['./singlefilter.page.scss'],
})
export class SinglefilterPage {

  zuteling_menu: any;
  public selectedFilter: any = 'alle';

  constructor(public navCtrl: NavController) {
    this.zuteling_menu = 'my Current Position';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SinglefilterPage');
  }

}
