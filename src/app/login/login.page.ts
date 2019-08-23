import { Component } from '@angular/core';
import { Platform, NavController, LoadingController, ModalController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { UserdataService } from '../services/userdata';
import { SystemService } from '../services/system';
import { ImprintPage } from './imprint/imprint.page';

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
  // public loc: any = [];
  username: AbstractControl;
  password: AbstractControl;
  pvs4_username: AbstractControl;
  pvs4_password: AbstractControl;

  lang: string;
  authForm: FormGroup;
  pushRegister: any;
  userData: any;
  login_nok: boolean;
  saveLogin: boolean;
  private loader: HTMLIonLoadingElement;
  timeoutShow: any;
  show_hide_err: boolean = false;
  construction: boolean = false;

  constructor(public navCtrl: NavController,
    public api: ApiService,
    private translate: TranslateService,
    private loadingCtrl: LoadingController,
    public userdata: UserdataService,
    public system: SystemService,
    public platform: Platform,
    public formBuilder: FormBuilder,
    public modalCtrl: ModalController) {

    this.authForm = formBuilder.group({
      /*
      username: ['', Validators.compose([Validators.required, Validators.minLength(5)])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(1)])],
      */
      pvs4_username: ['', Validators.compose([Validators.required, Validators.minLength(5)])],
      pvs4_password: ['', Validators.compose([Validators.required, Validators.minLength(1)])]
    });

    if (localStorage.getItem('lang')) {
      let x = localStorage.getItem('lang');
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
      let x = translate.getBrowserLang();
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
      let isin: boolean = false;
      if (!this.construction){
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
              this.navCtrl.navigateRoot('/customer-table');
            }, // success path
              error => {
                // connection failed
                console.log('pvs4_get_my_profile error: ', error);
              }); // error path);
          }
      }
    });
  }

  showHideErrors() {
    clearTimeout(this.timeoutShow);
    this.show_hide_err = true;
    this.timeoutShow = setTimeout(() => {
      this.show_hide_err = false;
    }, 8000);
  }

  changeLanguage() {
    let x = this.lang;
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
    if (!this.authForm.valid) {
      this.showHideErrors();
      return;
    }
    this.pvs4_username = this.authForm.get('pvs4_username');
    this.pvs4_password = this.authForm.get('pvs4_password');
    // this.saveLogin = this.authForm.controls['saveLogin'].value;
    this.userData = {
      info: 'WebVersion 4.1.8',
      user: 'test-1',
      password: '1234test'
    };

    let loader = await this.loadingCtrl.create({ spinner: 'circles' });

    loader.present().then(done => {
      this.userdata.reset();
      this.api.bid_login(this.pvs4_username.value, this.pvs4_password.value).then((result: any) => {
        console.log('bid_login OK: ', result);
        loader.dismiss();
        this.navCtrl.navigateRoot('/customer-table');

      }, // success path
        error => {
          // connection failed
          this.login_nok = true;
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
        componentProps: {
        }
      }).then(x => x.present());
  }

}
