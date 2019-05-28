import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from '@ionic/angular';
import { UserdataService } from '../services/userdata';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-product-new',
  templateUrl: './product-new.page.html',
  styleUrls: ['./product-new.page.scss'],
})
export class ProductNewPage {

  public modalTitle: string;
  public idCustomer: number = 0;
  public idOption: number = 0;
  public activOption: any = {
    id: this.userdata.id,
    licensee: this.userdata.licensee,
    user: 1,
    type: 0,
    title: {
      de: "",
      en: "",
      fr: "",
      it: ""
    },
    options: [],
    value:""
  };
  public inputError: boolean = false;
  public inputColor: string = "#EEEEEE";
  public options: any = [{
    de: "",
    en: "",
    fr: "",
    it: ""
  }];
  public maxChar: number = 100;
  public minNumber: number = 0;
  public maxNumber: number = 10;
  public defaultToggle: boolean = true;  
  public defaultTime: string = "";  
  public opdInd: any = 0;
  public lang:string = "";

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public userdata: UserdataService,
    public viewCtrl: ModalController,
    public apiService: ApiService,
    public alertCtrl: AlertController) {

    this.activOption.licensee = userdata.licensee;
    let op = this.navParams.get("option");
    if (op) this.activOption = JSON.parse(JSON.stringify(op));
    console.log("activOption op: ", this.activOption);
    this.idCustomer = this.navParams.get("idCustomer");
    this.idOption = this.navParams.get("id");
    this.lang = localStorage.getItem('lang');
    this.idOption = 0;
    this.modalTitle = translate.instant('Neue Produkt Optionen');    

    console.log("ProductNewPage: ", this.idOption);

  }

  dismiss() {
    this.viewCtrl.dismiss(false);
  }

  productOption() {
    console.log("productOption()");

    if (this.activOption.type == 0)
    {
      this.activOption.options = {
        default: this.defaultToggle,
        color: this.inputColor
      };
      this.activOption.value = this.defaultToggle;
    }
    else if (this.activOption.type == 1)
      this.activOption.options = this.options;
    else if (this.activOption.type == 2)
      this.activOption.options = { max: this.maxChar };
    else if (this.activOption.type == 3)
      this.activOption.options = {
        min: this.minNumber,
        max: this.maxNumber
      };
    else if (this.activOption.type == 4)
      this.activOption.options = { default: this.defaultTime };

    console.log("activOption :", this.activOption);

    this.viewCtrl.dismiss(this.activOption); 

  }

  add_option() {
    this.options.push({
      de: "",
      en: "",
      fr: "",
      it: ""
    });
  }

  remove_option(index) {
    this.options.splice(index, 1); 
    if(this.options.length==0) {
      this.options.push({
        de: "",
        en: "",
        fr: "",
        it: ""
      });
    }          
  }

  promptOptionTitle(title,type,index) {
    console.log('promptOptionTitle(): ', title,type,index);
    console.log('this.activOption: ', this.activOption);
    let myTitel = this.translate.instant('Auswahlmöglichkeiten');
    if(type==1) myTitel = this.translate.instant('Titel');
   
    let alert = this.alertCtrl.create({
      header: myTitel,
      inputs: [
        {
          name: 'de',
          placeholder:  this.translate.instant('Titel')+' (de)',
          value: title.de
        },
        {
          name: 'en',
          placeholder: this.translate.instant('Titel')+' (en)',
          value: title.en
        },
        {
          name: 'fr',
          placeholder: this.translate.instant('Titel')+' (fr)',
          value: title.fr
        },
        {
          name: 'it',
          placeholder: this.translate.instant('Titel')+' (it)',
          value: title.it
        }
      ],
      buttons: [
        {
          text: this.translate.instant('dismiss'),
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked:', data);
          }
        },
        {
          text: this.translate.instant('okay'),
          handler: data => {
            console.log('OK clicked:', data);
            data.de = data.de.trim();
            data.en = data.en.trim();
            data.fr = data.fr.trim();
            data.it = data.it.trim();
            if ((data.de=='') || (data.en=='') || (data.fr=='') ||(data.it=='') ){
              return false;
            } else {
              console.log('options:', this.options);
              if(type==1)
                this.activOption.title = data;
              else
                this.options[index] = data;
              return true;              
            }
          }
        }
      ]
    }).then(x=> x.present());
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }


}
