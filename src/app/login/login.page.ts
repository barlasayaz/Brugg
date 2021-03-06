import { Component, NgZone } from '@angular/core';
import { Platform, NavController, LoadingController, ModalController, MenuController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { UserdataService } from '../services/userdata';
import { SystemService } from '../services/system';
import { ImprintPage } from './imprint/imprint.page';
import { OldBrowserPage } from './old-browser/old-browser.page';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage {
  public username: AbstractControl;
  public password: AbstractControl;
  public pvs4_username: AbstractControl;
  public pvs4_password: AbstractControl;

  public lang: string;
  public authForm: FormGroup;
  public pushRegister: any;
  public userData: any;
  public login_nok: boolean;
  public saveLogin: boolean;
  public loader: HTMLIonLoadingElement;
  public timeoutShow: any = 0;
  public show_hide_err = true;
  public construction = false;
  public winWidth: any;
  public winHeight: any;

  constructor(public navCtrl: NavController,
    public api: ApiService,
    public translate: TranslateService,
    public loadingCtrl: LoadingController,
    public userdata: UserdataService,
    public system: SystemService,
    public platform: Platform,
    public formBuilder: FormBuilder,
    public modalCtrl: ModalController,
    public menuCtrl: MenuController,
    private ngZone: NgZone) {

    

    this.winWidth = window.innerWidth;
    this.winHeight = window.innerHeight;
    console.log('with - height 1:', this.winWidth, this.winHeight);

    window.onresize = (e) => {
      // ngZone.run will help to run change detection
      this.ngZone.run(() => {
          this.winWidth = window.innerWidth;
          this.winHeight = window.innerHeight;
          console.log('with - height 2:', this.winWidth, this.winHeight);
      });
    };

    this.authForm = formBuilder.group({
      pvs4_username: ['', Validators.compose([Validators.required, Validators.minLength(5)])],
      pvs4_password: ['', Validators.compose([Validators.required, Validators.minLength(1)])]
    });

    if (localStorage.getItem('lang')) {
      const x = localStorage.getItem('lang');
      console.log('localStorage.getItem(\'lang\'): ' + x);
      if ((x == 'de') || (x == 'en') || (x == 'fr') || (x == 'it')) {
        this.translate.use(x);
        this.lang = x;
      } else {
        localStorage.setItem('lang', 'en');
        this.translate.use('en');
        this.lang = 'en';
      }
    } else {
      const x = translate.getBrowserLang();
      console.log('translate.getBrowserLang(): ' + x);
      if ((x == 'de') || (x == 'en') || (x == 'fr') || (x == 'it')) {
        this.translate.use(x);
        localStorage.setItem('lang', x);
        this.lang = x;
      } else {
        this.translate.use('en');
        localStorage.setItem('lang', 'en');
        this.lang = 'en';
      }
    }

    platform.ready().then(() => {
      let isin: boolean;
      isin = false;
      if (!this.construction) {
          let slUser: any = localStorage.getItem('UserInfo');
          if (slUser) {
            slUser = JSON.parse(slUser);
            console.log('userdata: slUser ', slUser);
            if ((slUser.token) && (slUser.token.length > 10)) {
              this.userdata.set(slUser);
              isin = true;
            }
          }
          if (!isin) {
            let llUser: any = localStorage.getItem('saveLogin');
            if (llUser) {
              llUser = JSON.parse(llUser);
              console.log('userdata: llUser ', llUser);
              if ((llUser.token) && (llUser.token.length > 10)) {
                this.userdata.set(llUser);
                isin = true;
              }
            }
          }
          // PVS4
          isin = false;
          let pvs4_user: any = localStorage.getItem('pvs4_user');
          if (pvs4_user) {
            pvs4_user = JSON.parse(pvs4_user);
            this.userdata.first_name = pvs4_user.first_name;
            this.userdata.last_name = pvs4_user.last_name;
            this.userdata.email = pvs4_user.email;
            this.userdata.phone = pvs4_user.phone;
            console.log('userdata: pvs4_user ', pvs4_user);
            this.api.pvs4_get_my_profile(pvs4_user.email).then((result: any) => {
              console.log('pvs4_get_my_profile ok: ', result);
              //this.navCtrl.navigateRoot('/customer-table');
              this.navCtrl.navigateRoot('/startscreen');
            }, // success path
              error => {
                // connection failed
                console.log('pvs4_get_my_profile error: ', error);
              }); // error path);
          }
      }

      // Get IE or Edge browser version
      const version = detectIE();

      if (version === false) {
        console.log('kein IE/EDGE');
      } else if (version >= 12) {
        console.log('Edge ' + version);
      } else {
        console.log('IE ' + version);
        this.oldBrowserModal();
      }

      function detectIE() {
        const ua = window.navigator.userAgent;

        const msie = ua.indexOf('MSIE ');
        if (msie > 0) {
          // IE 10 or older => return version number
          return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
        }

        const trident = ua.indexOf('Trident/');
        if (trident > 0) {
          // IE 11 => return version number
          const rv = ua.indexOf('rv:');
          return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
        }

        const edge = ua.indexOf('Edge/');
        if (edge > 0) {
          // Edge (IE 12+) => return version number
          return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
        }

        // other browser
        return false;
      }
    });
    
  }

  showHideErrors() {
    console.log('showHideErrors() ' , this.timeoutShow );
    if (this.timeoutShow) { clearTimeout(this.timeoutShow); }
    this.show_hide_err = true;
    this.timeoutShow = setTimeout(() => {
      console.log('timeoutShow ');
      this.show_hide_err = false;
    }, 8000);
  }

  changeLanguage() {
    const x = this.lang;
    console.log('changeLanguage(): ' + x);
    if ((x == 'de') || (x == 'en') || (x == 'fr') || (x == 'it')) {
      this.translate.use(x);
      localStorage.setItem('lang', x);
    } else {
      this.translate.use('en');
      localStorage.setItem('lang', x);
    }
    localStorage.removeItem('split_filter_product');
    localStorage.removeItem('show_columns_product');
  }

  async signIn() {
    console.log('this.authForm.valid: ', this.authForm.valid);
    if (!this.authForm.valid) {
      this.showHideErrors();
      return;
    }
    this.pvs4_username = this.authForm.get('pvs4_username');
    this.pvs4_password = this.authForm.get('pvs4_password');
    this.userData = {
      info: 'WebVersion 4.1.8',
      user: 'test-1',
      password: '1234test'
    };

    const loader = await this.loadingCtrl.create({ spinner: 'circles' });

    loader.present().then(done => {
      this.userdata.reset();
      this.api.bid_login(this.pvs4_username.value, this.pvs4_password.value).then((result: any) => {
        console.log('bid_login OK: ', result);
        loader.dismiss();
        //this.navCtrl.navigateRoot('/customer-table');
        this.navCtrl.navigateRoot('/startscreen');
      }, // success path
        error => {
          // connection failed
          this.login_nok = true;
          this.showHideErrors();
          this.userdata.reset();
          loader.dismiss();
        }); // error path);
    });
  }

  signUp() {
    this.navCtrl.navigateForward('/signup');
  }

  // IMPRINT
  async imprintModal() {
    const modal =
      await this.modalCtrl.create({
        component: ImprintPage,
        cssClass: 'imprint-modal-css',
        componentProps: {
        }
      }).then(x => x.present());
  }

  // OLD-Browser-Info
  async oldBrowserModal() {
    const modal =
      await this.modalCtrl.create({
        component: OldBrowserPage,
        cssClass: 'oldbrowser-modal-css',
        backdropDismiss: false,
        componentProps: {
        }
      }).then(x => x.present());
  }

}

