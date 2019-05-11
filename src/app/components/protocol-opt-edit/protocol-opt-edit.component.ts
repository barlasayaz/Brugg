import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from '@ionic/angular';
import { UserdataService } from '../../services/userdata';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api';
/* import { ProtocolTemplatePage } from '../../pages/protocol-template/protocol-template'; --DP-- */

@Component({
  selector: 'app-protocol-opt-edit',
  templateUrl: './protocol-opt-edit.component.html',
  styleUrls: ['./protocol-opt-edit.component.scss']
})
export class ProtocolOptEditComponent {

  public modalTitle: string;
  public idCustomer: number = 0;
  public idOption: number = 0;
  public itsNew: boolean = false;
  public activOption: any = {
    user: this.userdata.id,
    title: {
      de: "",
      en: "",
      fr: "",
      it: ""
    },
    options: [],
    licensee: this.userdata.licensee,
    type: 0,
    id: 0,
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

    if (this.idOption > 0) {  // Edit
      this.itsNew = false;
      this.modalTitle = translate.instant('Option bearbeiten'); 

      if (this.activOption.type == 0) {
        this.defaultToggle = this.activOption.options.default;
        this.inputColor = this.activOption.options.color;
      }
      else if (this.activOption.type == 1)
        this.options = this.activOption.options;
      else if (this.activOption.type == 2)
        this.maxChar = this.activOption.options.max;
      else if (this.activOption.type == 3) {
        this.minNumber = this.activOption.options.min;
        this.maxNumber = this.activOption.options.max;
      }
      else if (this.activOption.type == 4)
        this.defaultTime = this.activOption.options.default;

    }
    else {  // New
      this.idOption = 0;
      this.itsNew = true;
      this.modalTitle = translate.instant('Neue Option');
    }

    console.log("protocolOptEditComponent: ", this.idOption);

  }

  loadOption() {
    this.apiService.pvs4_get_protocol_opt(1, 1).then((result: any) => {
      this.activOption = result.list[0].data;
      console.log('loadOption: ', this.activOption);
    });
  }

  dismiss() {
    this.viewCtrl.dismiss(false);
  }

  protocolOptionsEdit() {
    console.log("ProtocolOptionsEdit()");

    let obj = {
      user: 1,
      title: "",
      options: "",
      licensee: this.userdata.licensee,
      type: 0,
      id: 0,
      value: ""
    };

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

    if (this.activOption["user"]) obj.user = this.activOption["user"];
    if (this.activOption["licensee"]) obj.licensee = this.activOption["licensee"];
    if (this.activOption["type"]) obj.type = this.activOption["type"];
    if (this.activOption["title"]) obj.title = JSON.stringify(this.activOption["title"]);
    if (this.activOption["options"]) obj.options = JSON.stringify(this.activOption["options"]);

    console.log(obj);
    if (!this.itsNew) {
      obj.id = this.activOption["id"];
      this.idOption = this.activOption["id"];
    } else {
      this.activOption.active = 1;
    }

    this.apiService.pvs4_set_protocol_opt(obj).then((result: any) => {
      console.log('result: ', result);
      this.viewCtrl.dismiss(this.activOption);
      //this.navCtrl.setRoot(ProtocolTemplatePage, { idCustomer: this.idCustomer, itsNew: false });
    });

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
