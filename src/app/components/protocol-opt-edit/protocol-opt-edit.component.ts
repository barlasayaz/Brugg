import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from '@ionic/angular';
import { UserdataService } from '../../services/userdata';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../../services/api';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-protocol-opt-edit',
  templateUrl: './protocol-opt-edit.component.html',
  styleUrls: ['./protocol-opt-edit.component.scss']
})
export class ProtocolOptEditComponent implements OnInit {

  public modalTitle: string;
  public idCustomer = 0;
  public idOption = 0;
  public itsNew = false;
  public activOption: any = {
    user: this.userdata.id,
    title: {
      de: '',
      en: '',
      fr: '',
      it: ''
    },
    options: [],
    licensee: this.userdata.licensee,
    type: 0,
    id: 0
  };
  public inputColor = '#EEEEEE';
  public options: any = [{
    de: '',
    en: '',
    fr: '',
    it: ''
  }];
  public maxChar: any = 100;
  public minNumber: any = 0;
  public maxNumber: any = 10;
  public defaultToggle: boolean = false;
  public defaultTime: string;
  public opdInd: any = 0;
  public lang = '';
  public mandatoryToogle: boolean = false;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public translate: TranslateService,
    public userdata: UserdataService,
    public viewCtrl: ModalController,
    public apiService: ApiService,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController) {

    }

    ngOnInit() {
      this.defaultTime = '';
      this.defaultToggle = false;
      this.activOption.licensee = this.userdata.licensee;
      const op = this.navParams.get('option');
      if (op) { this.activOption = JSON.parse(JSON.stringify(op)); }
      console.log('activOption op: ', this.activOption);
      this.idCustomer = this.navParams.get('idCustomer');
      this.idOption = this.navParams.get('id');
      this.lang = localStorage.getItem('lang');
      console.log('idOption :', this.idCustomer, this.idOption, this.lang);

      if (this.idOption > 0) {  // Edit
        console.log('Edit');
        this.itsNew = false;
        this.modalTitle = this.translate.instant('Option bearbeiten');

        if (this.activOption.type == 0) {
          if (this.activOption.options.default == 'true') {
            this.defaultToggle = true;
          }
          if (this.activOption.options.default == 'false') {
            this.defaultToggle = false;
          }
          this.inputColor = this.activOption.options.color;
        } else if (this.activOption.type == 1) {
          this.options = this.activOption.options;
        } else if (this.activOption.type == 2) {
          this.maxChar = this.activOption.options.max;
        } else if (this.activOption.type == 3) {
          this.minNumber = this.activOption.options.min;
          this.maxNumber = this.activOption.options.max;
        } else if (this.activOption.type == 4) {
          this.defaultTime = this.activOption.options.default;
        }

        if (this.activOption.mandatory == 'true') {
          this.mandatoryToogle = true;
        } else {
          this.mandatoryToogle = false;
        }

      } else {  // New
        console.log('New');
        this.idOption = 0;
        this.itsNew = true;
        this.modalTitle = this.translate.instant('Neue Option');
        this.activOption.type = '0';
      }

      console.log('protocolOptEditComponent: ', this.idOption);

    }

    dismiss() {
      this.viewCtrl.dismiss(false);
    }

    protocolOptionsEdit() {
      console.log('ProtocolOptionsEdit()');
      if (this.activOption.title['de'] == '') {
        this.mandatoryMsg();
        return;
      }

      console.log('optionen :', this.activOption.type);

      if (this.activOption.type == 1) {
        let itemNull = 0;
        this.options.forEach(element => {
          console.log('element["de"] :', element, element['de']);
          if (element['de'] == '') {
            itemNull = 1;
          }
        });
        if (itemNull == 1) {
          this.mandatoryMsg();
          return;
        }
      }

      if (this.activOption.type == 2) {
        console.log('maxChar :', this.maxChar);
        if (this.maxChar == null) {
          this.mandatoryMsg();
          return;
        }
      }
      if (this.activOption.type == 3) {
        console.log('minNumber :', this.minNumber);
        if (this.minNumber == null) {
          this.mandatoryMsg();
          return;
        }
        console.log('maxNumber :', this.maxNumber);
        if (this.maxNumber == null) {
          this.mandatoryMsg();
          return;
        }
      }
      if (this.activOption.type == 4) {
        console.log('defaultTime :', this.defaultTime);
        if (this.defaultTime == '') {
          this.mandatoryMsg();
          return;
        }
      }

      const obj = {
        user: 1,
        title: '',
        mandatory: 0,
        options: '',
        licensee: this.userdata.licensee,
        type: 0,
        id: 0,
        active: '1'
      };

      if (this.activOption.type == 0) {
        this.activOption.options = {
          default: this.defaultToggle,
          color: this.inputColor
        };
      } else if (this.activOption.type == 1) {
        this.activOption.options = this.options;
      } else if (this.activOption.type == 2) {
        this.activOption.options = { max: this.maxChar };
      } else if (this.activOption.type == 3) {
        this.activOption.options = {
          min: this.minNumber,
          max: this.maxNumber
        };
      } else if (this.activOption.type == 4) {
        this.activOption.options = { default: this.defaultTime };
      }

      this.activOption.mandatory = this.mandatoryToogle;

      if (this.activOption['user']) { obj.user = this.activOption['user']; }
      if (this.activOption['licensee']) { obj.licensee = this.activOption['licensee']; }
      if (this.activOption['type']) { obj.type = this.activOption['type']; }
      if (this.activOption['mandatory'] == true) { obj.mandatory = 1; }
      if (this.activOption['mandatory'] == false) { obj.mandatory = 0; }
      if (this.activOption['title']) { obj.title = JSON.stringify(this.activOption['title']); }
      if (this.activOption['options']) { obj.options = JSON.stringify(this.activOption['options']); }

      if (!this.itsNew) {
        obj.id = this.activOption['id'];
        this.idOption = this.activOption['id'];
      } else {
        obj.active = '1';
        this.activOption.active = 1;
      }

      this.apiService.pvs4_set_protocol_opt(obj).then((result: any) => {
        console.log('result: ', result);
        this.activOption.id = result.id;
        if (obj.mandatory == 1) {
          this.activOption.mandatory = 'true';
        }
        if (obj.mandatory == 0) {
          this.activOption.mandatory = 'false';
        }
        if (this.activOption.options.default == true) {
          this.activOption.options.default = 'true';
        }
        if (this.activOption.options.default == false) {
          this.activOption.options.default = 'false';
        }
        this.viewCtrl.dismiss(this.activOption);
      });

    }

    add_option() {
      this.options.push({
        de: '',
        en: '',
        fr: '',
        it: ''
      });
    }

    remove_option(index) {
      this.options.splice(index, 1);
      if (this.options.length == 0) {
        this.options.push({
          de: '',
          en: '',
          fr: '',
          it: ''
        });
      }
    }

    promptOptionTitle(title, type, index) {
      console.log('promptOptionTitle(): ', title, type, index);
      console.log('this.activOption: ', this.activOption);
      let myTitel = this.translate.instant('Auswahlmöglichkeiten');
      if (type == 1) { myTitel = this.translate.instant('Titel'); }

      const alert = this.alertCtrl.create({
        header: myTitel,
        cssClass: 'promptClass',
        inputs: [
          {
            name: 'de',
            placeholder: this.translate.instant('German'),
            value: title.de
          },
          {
            name: 'en',
            placeholder: this.translate.instant('English'),
            value: title.en
          },
          {
            name: 'fr',
            placeholder: this.translate.instant('French'),
            value: title.fr
          },
          {
            name: 'it',
            placeholder: this.translate.instant('Italian'),
            value: title.it
          }
        ],
        buttons: [
          {
            text: this.translate.instant('abbrechen'),
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
              if ((data.de == '') || (data.en == '') || (data.fr == '') || (data.it == '') ) {
                return false;
              } else {
                console.log('options:', this.options);
                if (type == 1) {
                  this.activOption.title = data;
                } else {
                  this.options[index] = data;
                }
                return true;
              }
            }
          }
        ]
      }).then(x => x.present());
    }

    closeModal() {
      this.viewCtrl.dismiss();
    }

    prodtocolOptionsDeactivate() {
      let alert = this.alertCtrl.create({
        header: this.translate.instant('Achtung'),
        message: this.translate.instant('Möchten Sie diesen Option wirklich deaktivieren?'),
        buttons: [
          {
            text: this.translate.instant('nein'),
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: this.translate.instant('ja'),
            handler: () => {
              const obj = {
                user: 1,
                title: '',
                mandatory: 0,
                options: '',
                licensee: this.userdata.licensee,
                type: 0,
                id: 0,
                active: '0'
              };

              if (this.activOption.type == 0) {
                this.activOption.options = {
                  default: this.defaultToggle,
                  color: this.inputColor
                };
              } else if (this.activOption.type == 1) {
                this.activOption.options = this.options;
              } else if (this.activOption.type == 2) {
                this.activOption.options = { max: this.maxChar };
              } else if (this.activOption.type == 3) {
                this.activOption.options = {
                  min: this.minNumber,
                  max: this.maxNumber
                };
              } else if (this.activOption.type == 4) {
                this.activOption.options = { default: this.defaultTime };
              }

              this.activOption.mandatory = this.mandatoryToogle;

              if (this.activOption['user']) { obj.user = this.activOption['user']; }
              if (this.activOption['licensee']) { obj.licensee = this.activOption['licensee']; }
              if (this.activOption['type']) { obj.type = this.activOption['type']; }
              if (this.activOption['mandatory'] == true) { obj.mandatory = 1; }
              if (this.activOption['mandatory'] == false) { obj.mandatory = 0; }
              if (this.activOption['title']) { obj.title = JSON.stringify(this.activOption['title']); }
              if (this.activOption['options']) { obj.options = JSON.stringify(this.activOption['options']); }

              obj.id = this.activOption['id'];
              obj.active = '0';
              this.activOption.active = 0;

              this.apiService.pvs4_set_protocol_opt(obj).then((result: any) => {
                console.log('result: ', result);
                this.viewCtrl.dismiss(this.activOption);
              });

            }
          }
        ]
      }).then(x => x.present());
    }

    mandatoryMsg() {
      const toast = this.toastCtrl.create({
        message: this.translate.instant('Bitte füllen Sie alle Pflichtfelder aus.'),
        cssClass: 'toast-mandatory',
        duration: 3000,
        position: 'top'
      }).then(x => x.present());
    }

  }
