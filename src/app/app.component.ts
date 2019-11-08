import { Component, Input } from '@angular/core';

import { Platform, NavController, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  @Input() aktivPage: string;
  @Input() idCustomer: number;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private navCtrl: NavController,
    private menu: MenuController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.navCtrl.navigateRoot('/login');
    });
  }

  getClass(path) {
    if (this.aktivPage == path) {
      return 'active';
    } else {
      return '';
    }
  }

  go(action: any, id: number = 0) {
    // Navigation
    console.log('app.go: ', action, id, this.aktivPage);

    if (this.aktivPage != action) {
      switch (action) {
        case 'Startscreen': // HOME
          this.navCtrl.navigateRoot('/startscreen');
          break;
        case 'Dashboard':
          this.navCtrl.navigateRoot('/dashboard');
          break;
        case 'CustomerTable':
          this.navCtrl.navigateRoot(['/customer-table']);
          break;
        case 'CustomerDetails':
          this.navCtrl.navigateRoot(['/customer-details', id]);
          break;
        case 'ProductList':
          const navigationExtras: NavigationExtras = {
            queryParams: {
              refresh: new Date().getTime()
            }
          };
          this.navCtrl.navigateRoot(['/product-list/' + id], navigationExtras);
          break;
        case 'ProtocolList':
          this.navCtrl.navigateRoot(['/protocol-list/' + id]);
          break;
        case 'OrderForm':
          this.navCtrl.navigateRoot(['/order-form', id]);
          break;
        case 'NoteList':
          this.navCtrl.navigateRoot(['/note-list/' + id]);
          break;
      }
    } else {
      if (this.aktivPage == 'Statistics') {
        this.navCtrl.navigateRoot('/dashboard');
      }
    }
    this.aktivPage = action;
    this.menu.close('menu');
  }
}
