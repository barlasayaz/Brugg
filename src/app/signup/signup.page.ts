import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from '@ionic/angular'; 
import { ApiService } from '../services/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

/**
 * Generated class for the SignupPage page.
 *
 */ 

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {

  translateService: any;
  pushLogin: any;
  signupForm: FormGroup; 

  company: string;
  fname: string;
  phone: string;
  email: string;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public api: ApiService,
              public formBuilder: FormBuilder,
              public alertCtrl: AlertController,
              public translate : TranslateService) {
      this.signupForm = formBuilder.group({
        company: ['', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(80)])],
        fname: ['', Validators.compose([Validators.required, Validators.minLength(1),Validators.maxLength(80)])],
        phone: ['', Validators.compose([Validators.required, Validators.minLength(1), Validators.maxLength(30)])],
        email: ['', Validators.compose([Validators.required, Validators.pattern('^[a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$'), Validators.minLength(6), Validators.maxLength(120)])]
      });
  }

  // Called when the user clicks on the show/hide errors
  timeoutShow : any;
  show_hide_err: boolean= false;
  showHideErrors() {
    clearTimeout(this.timeoutShow);
    this.show_hide_err= true;
    this.timeoutShow = setTimeout(()=>{
        this.show_hide_err= false;
        },5000);
  }

  show_hide_err_pw: boolean= false;

  showAlert() {
    let title = this.translate.instant('information');
    let message = this.translate.instant('Danke für Ihre Anmeldung, Sie werden in Kürze von unseren Kundenberatern kontaktiert.');
    let buttontext = this.translate.instant('okay')
    let alert = this.alertCtrl.create({
      header: title,      
      message: message,
      buttons: [{text: buttontext,
                 handler: data => {
                    this.navCtrl.navigateRoot("/login");
                  }
                }]
    }).then(x=> x.present());
  }

  signup(){
    if(!this.signupForm.valid) {
      this.showHideErrors();
      return;
    }
    
    this.company = this.signupForm.get('company').value.trim();
    this.fname = this.signupForm.get('fname').value.trim();
    this.phone = this.signupForm.get('phone').value.trim();
    this.email = this.signupForm.get('email').value.trim();

     let params = '{"Firma":"'+this.company+'","Name":"'+this.fname+'","Tel":"'+this.phone+'","eMail":"'+this.email+'"}';
     this.api.postData(JSON.parse(params),"anfrage_nutzung.php").then(result=>{
       console.log("1111");
        console.log(result);
    }).catch(error=>{
      console.log("22222");
      this.showAlert();
    }); 

  }

}
