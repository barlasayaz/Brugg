import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { DragulaService } from 'ng2-dragula';
import { ProtocolOptEditComponent } from '../components/protocol-opt-edit/protocol-opt-edit.component';
import { ActivatedRoute } from '@angular/router';

/**
 * Generated class for the ProtocolTemplatePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-protocol-template',
  templateUrl: './protocol-template.page.html',
  styleUrls: ['./protocol-template.page.scss'],
})
export class ProtocolTemplatePage implements OnInit {

  public availableOptions: any[];
  public draggedOption: any = {};
  public templateTitleObj: any = { de: '', en: '', fr: '', it: '' };
  public menuItems: any[] = [];
  public idCustomer = 0;
  public idTemplate = 0;
  public searchText = '';
  public selectedTemplate: any[] = [];
  public selectedTmplt: any = 0;
  public selectTemplate: any = 0;
  public editOption: any = {};
  public selectedOption: any[] = [];
  public selectedOptionId: any = 0;
  public selectOption: any = 0;
  public tmpInd: any = 0;
  public downClick: any = 0;
  public template: Array<any> = [];
  public options: Array<any> = [];
  public optionsAll: Array<any> = [];
  public types: Array<string> = ['Toggle', 'Select', 'Textarea', 'Number', 'Time', 'Date'];
  public lang = '';
  public itsNew = true;
  public activTemplate: any = {};
  public company = '';
  public mandatory = 'false';

  constructor(public navCtrl: NavController,
    public route: ActivatedRoute,
    public apiService: ApiService,
    public translate: TranslateService,
    public userdata: UserdataService,
    private dragulaService: DragulaService,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController) {
  }

  ngOnInit() {

    this.dragulaService.destroy('COLUMNS');

    this.dragulaService.createGroup('COLUMNS', {
      copy: (el, source) => {
        return source.id == 'options';
      },
      copyItem: (optionsAll) => {
        this.selectedTemplate[this.tmpInd] = 0;
        this.tmpInd++;
        return optionsAll;
      },
      accepts: (el, target, source, sibling) => {
        // To avoid dragging from right to left container
        return target.id != 'options';
      }
    });

    if (this.route.snapshot.data['special']) {
      let params = this.route.snapshot.data['special'];
      this.idCustomer = params['idCustomer'];
      this.idTemplate = params['idTemplate'];
      this.itsNew = params['itsNew'];
      this.activTemplate = params['activTemplate'];
      if (this.activTemplate) {
        this.activTemplate = JSON.parse(this.activTemplate);
      }
      this.loadOption();
      this.loadTemplate();
    }

    this.lang = localStorage.getItem('lang');
    console.log('template: ', this.template);
  }

  promptTitel() {
    const alert = this.alertCtrl.create({
      header: this.translate.instant('Titel'),
      cssClass: 'promptClass',
      inputs: [
        {
          name: 'de',
          placeholder: 'German',
          value: this.templateTitleObj.de
        },
        {
          name: 'en',
          placeholder: 'English',
          value: this.templateTitleObj.en
        },
        {
          name: 'fr',
          placeholder: 'French',
          value: this.templateTitleObj.fr
        },
        {
          name: 'it',
          placeholder: 'Italian',
          value: this.templateTitleObj.it
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
            if ((data.de == '') || (data.en == '') || (data.fr == '') || (data.it == '')) {
              return false;
            } else {
              this.templateTitleObj = data;

              return true;
            }
          }
        }
      ]
    }).then(x => x.present());
  }

  down_click() {
    if (this.downClick == 0) {
      this.downClick = 1;
      this.options.sort(function (a, b) {
        if (a.title[localStorage.getItem('lang')].toLowerCase() < b.title[localStorage.getItem('lang')].toLowerCase()) { return -1; }
        if (a.title[localStorage.getItem('lang')].toLowerCase() > b.title[localStorage.getItem('lang')].toLowerCase()) { return 1; }
        return 0;
      }
      );
    } else {
      this.downClick = 0;
      this.options.reverse();
    }
  }

  onclickTemplate(tmpId) {
    if (tmpId != this.selectedTmplt) {
      this.selectedTemplate[this.selectedTmplt] = 0;
    }
    if (this.selectedTemplate[tmpId] == 0) {
      this.selectedTemplate[tmpId] = 1;
      this.selectTemplate = 1;
    } else {
      this.selectedTemplate[tmpId] = 0;
      this.selectTemplate = 0;
    }
    this.selectedTmplt = tmpId;
  }

  onclickOption(option) {
    this.editOption = option;
    if (option.id != this.selectedOptionId) {
      this.selectedOption[this.selectedOptionId] = 0;
    }
    if (this.selectedOption[option.id] == 0) {
      this.selectedOption[option.id] = 1;
      this.selectOption = 1;
    } else {
      this.selectedOption[option.id] = 0;
      this.selectOption = 0;
    }
    this.selectedOptionId = option.id;
  }

  search_all() {
    this.options = JSON.parse(JSON.stringify(this.optionsAll));
    for (let i = this.options.length - 1; i >= 0; i--) {
      if (this.options[i].title[this.lang].toLowerCase().indexOf(this.searchText.toLowerCase()) < 0 &&
          this.types[this.options[i].type].toLowerCase().indexOf(this.searchText.toLowerCase()) < 0) {
        this.options.splice(i, 1);
      }
    }
  }

  loadOption() {
    this.options = [];
    this.apiService.pvs4_get_protocol_opt(this.userdata.licensee, 0).then((result: any) => {
      result.list.forEach(element => {
        element.data.options = JSON.parse(element.data.options);
        if (element.data.mandatory == 1) {
          element.data.mandatory = 'true';
        }
        if (element.data.mandatory == 0) {
          element.data.mandatory = 'false';
        }
        if (element.data.type == '0') {
          if (element.data.options.default == true) {
            element.data.options.default = 'true';
          }
          if (element.data.options.default == false) {
            element.data.options.default = 'false';
          }
        }
        element.data.title = JSON.parse(element.data.title);
        this.options.push(element.data);
        this.selectedOption[element.data.id] = 0;
      });
      this.optionsAll = JSON.parse(JSON.stringify(this.options));
      console.log('loadOption: ', result.list);
    });
  }

  loadTemplate() {
    if (this.idTemplate && this.idTemplate > 0 && this.activTemplate) {
      this.template = this.activTemplate.options;
      for (let index = 0; index < this.template.length; index++) {
        this.selectedTemplate[index] = 0;
        console.log('element.data.options :', this.template[index]);
        if (this.template[index].mandatory == 1) {
          this.template[index].mandatory = 'true';
        }
        if (this.template[index].mandatory == 0) {
          this.template[index].mandatory = 'false';
        }
        if (this.template[index].type == '0') {
          if (this.template[index].options.default == true) {
            this.template[index].options.default = 'true';
          }
          if (this.template[index].options.default == false) {
            this.template[index].options.default = 'false';
          }
        }
      }
      this.templateTitleObj = this.activTemplate.title;

      console.log('Template Title :', this.template);
    } else if (this.itsNew == undefined) { this.promptTitel(); }
  }

  async option_new() {
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
        component: ProtocolOptEditComponent,
        cssClass: 'protocoloptedit-modal-css',
        componentProps: { id: 0, idCustomer: this.idCustomer }
      });
    modal.onDidDismiss().then(data => {
      if (data['data']) {
        this.options.push(data['data']);
      }
    });
    await modal.present();
  }

  async option_edit(option) {
    console.log('option :', option);
    const modal: HTMLIonModalElement = await this.modalCtrl.create({
      component: ProtocolOptEditComponent,
      cssClass: 'protocoloptedit-modal-css',
      componentProps: { id: option.id, option: option, idCustomer: this.idCustomer }
    });

    modal.onDidDismiss().then(data => {
      console.log('data :', data['data']);
      if (data['data']) {
        for (let index = 0; index < this.options.length; index++) {
          if (option.id == this.options[index].id) {
            if (data['data'].active == 1) {
              this.options[index] = data['data'];
              this.editOption = data['data'];
            }
            if (data['data'].active == 0) {
              this.options.splice(index, 1);
              this.editOption = [];
            }
          }
        }
        this.optionsAll = JSON.parse(JSON.stringify(this.options));
      }
    });
    await modal.present();
  }

  template_remove(ind) {
    console.log('index :', ind);
    this.selectedTemplate[ind] = 0;
    this.selectTemplate = 0;
    this.template = this.template.filter(function (value: any, index: number, array: any[]) { return index != ind; });
  }

  template_save() {
    console.log('templateTitle : ', this.templateTitleObj[this.lang]);
    if (this.templateTitleObj[this.lang] != '') {
      const obj = {
        user: this.userdata.id,
        title: '',
        options: '',
        licensee: this.userdata.licensee,
        id: 0
      };

      obj.title = JSON.stringify(this.templateTitleObj);
      obj.options = JSON.stringify(this.template);
      /*  for (let index = 0; index < this.template.length; index++) {
          if(index!=0)
              obj.options+=",";
              obj.options+= this.template[index].id;
          }*/

      console.log(obj);
      if (this.idTemplate > 0) {
        obj.id = this.idTemplate;
      }

      this.apiService.pvs4_set_protocol_tem(obj).then((result: any) => {
        this.idTemplate = result.id;
        const alert = this.alertCtrl.create({
          header: this.translate.instant('information'),
          message: this.translate.instant('Vorlage wurde erfolgreich gespeichert'),
          buttons: [
            {
              text: this.translate.instant('okay'),
              handler: () => {
              }
            }
          ]
        }).then(x => x.present());
        console.log('result: ', result);
      });
    }
  }

  move_left() {
    this.template.push(this.options.find(x => x.id == this.selectedOptionId));
    this.selectedTemplate[this.template.length - 1] = 0;
  }

  option_deactive(option) {
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

            if (option['user']) { obj.user = option['user']; }
            if (option['licensee']) { obj.licensee = option['licensee']; }
            if (option['type']) { obj.type = option['type']; }
            if (option['mandatory'] == 'true') { obj.mandatory = 1; }
            if (option['mandatory'] == 'false') { obj.mandatory = 0; }
            if (option['title']) { obj.title = JSON.stringify(option['title']); }
            if (option['options']) { obj.options = JSON.stringify(option['options']); }

            obj.id = option['id'];
            obj.active = '0';
            console.log('deactive obj :', obj);

            this.apiService.pvs4_set_protocol_opt(obj).then((result: any) => {
              console.log('result: ', result);
              this.selectedOption[option.id] = 0;
              this.selectOption = 0;
              this.selectedOptionId = 0;
              this.editOption = [];
              this.loadOption();
            });
          }
        }
      ]
    }).then(x => x.present());
  }

  /* option_deactive(option) {
    const obj = {
      user: 1,
      title: '',
      mandatory: 0,
      options: '',
      licensee: this.userdata.licensee,
      type: 0,
      id: 0,
      value: '',
      active: '0'
    };

    if (option['user']) { obj.user = option['user']; }
    if (option['licensee']) { obj.licensee = option['licensee']; }
    if (option['type']) { obj.type = option['type']; }
    if (option['mandatory']) {
      if (option['mandatory'] == true) { obj.mandatory = 1; }
      if (option['mandatory'] == false) { obj.mandatory = 0; }
    }
    if (option['title']) { obj.title = JSON.stringify(option['title']); }
    if (option['options']) { obj.options = JSON.stringify(option['options']); }

    obj.id = option['id'];
    obj.active = '0';
    option.active = 0;
    console.log('deactive obj :', obj);

    this.apiService.pvs4_set_protocol_opt(obj).then((result: any) => {
      console.log('result: ', result);
      this.selectedOption[option.id] = 0;
      this.selectOption = 0;
      this.selectedOptionId = 0;
      this.editOption = [];
      this.loadOption();
    });
  } */

}
