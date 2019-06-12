import { Component,OnInit } from '@angular/core';
import { NavController, ModalController, AlertController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { DragulaService } from 'ng2-dragula';
import { ProductOptEditComponent } from '../components/product-opt-edit/product-opt-edit.component';
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
  public templateTitleObj: any = { de: "", en: "", fr: "", it: "" };
  public menuItems: any[] = [];
  public idCustomer: number = 0;
  public idTemplate: number = 0;
  public searchText: string = "";
  public selectedTemplate: any[] = [];
  public selectedTmplt: any = 0;
  public selectTemplate: any = 0;
  public editOption: any[];
  public selectedOption: any[] = [];
  public selectedOptionId: any = 0;
  public selectOption: any = 0;
  public tmpInd: any = 0;
  public downClick: any = 0;
  public template: Array<any> = [];
  public options: Array<any> = [];
  public optionsAll: Array<any> = [];
  public types: Array<string> = ["Toggle", "Select", "Textarea", "Number","Time","Date"];
  public lang: string = "";
  public itsNew: boolean = true;
  public activTemplate: any = {};
  public company: string = "";
  public mandatory: string = "false"; 

  constructor(public navCtrl: NavController,
    public route: ActivatedRoute,
    public apiService: ApiService,
    public translate: TranslateService,
    public userdata: UserdataService,
    private dragulaService: DragulaService,
    public modalCtrl: ModalController,
    public alertCtrl: AlertController) {
  }

  ngOnInit()
  {

    this.dragulaService.destroy("COLUMNS");

    this.dragulaService.createGroup('COLUMNS', {
      copy: (el, source) => {
        return source.id === 'options';
      },
      copyItem: (optionsAll) => {
        this.selectedTemplate[this.tmpInd] = 0;
        this.tmpInd++;
        return optionsAll;
      },
      accepts: (el, target, source, sibling) => {
        // To avoid dragging from right to left container
        return target.id !== 'options';
      }
    });
    this.route.queryParams.subscribe(params => {
      this.idCustomer = params["idCustomer"];
      //this.company = params["company"];
      this.idTemplate = params["idTemplate"];
      this.itsNew = params["itsNew"];
      this.activTemplate = params["activTemplate"];
      if (this.activTemplate)
        this.activTemplate = JSON.parse(this.activTemplate);
        this.loadOption();
        this.loadTemplate();
    });

    this.lang = localStorage.getItem('lang');
    console.log('template: ', this.template);
  }

  promptTitel() {
    let alert = this.alertCtrl.create({
      header: this.translate.instant('Titel'),
      cssClass: 'promptClass',
      inputs: [
        {
          name: 'de',
          placeholder: 'Deutsch',
          value: this.templateTitleObj.de
        },
        {
          name: 'en',
          placeholder: 'English',
          value: this.templateTitleObj.en
        },
        {
          name: 'fr',
          placeholder: 'Français',
          value: this.templateTitleObj.fr
        },
        {
          name: 'it',
          placeholder: 'Italiano',
          value: this.templateTitleObj.it
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
    }
    else {
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
    }
    else {
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
    }
    else {
      this.selectedOption[option.id] = 0;
      this.selectOption = 0;
    }
    this.selectedOptionId = option.id;
  }

  search_all() {
    this.options = JSON.parse(JSON.stringify(this.optionsAll));
    for (let i = this.options.length - 1; i >= 0; i--) {
      if (this.options[i].title[this.lang].toLowerCase().indexOf(this.searchText.toLowerCase()) < 0 && this.types[this.options[i].type].toLowerCase().indexOf(this.searchText.toLowerCase()) < 0)
        this.options.splice(i, 1);
    }
  }

  loadOption() {
    this.options = [];
    this.apiService.pvs4_get_protocol_opt(this.userdata.licensee, 0).then((result: any) => {
      result.list.forEach(element => {
        element.data.options = JSON.parse(element.data.options);
        element.data.title = JSON.parse(element.data.title);
        if(element.data.mandatory == 0) element.data.mandatory = "false";
        if(element.data.mandatory == 1) element.data.mandatory = "true";
        this.options.push(element.data);
        this.selectedOption[element.data.id] = 0;
        console.log("elemet data :", element.data.id, ' - ', element.data);
        console.log("selectedOption :", this.selectedOption[element.data.id]);
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
      }
      this.templateTitleObj = this.activTemplate.title;

      console.log('Template Title :', this.template);
    }
    else if (this.itsNew == undefined) this.promptTitel();
  }

  async option_new() {
    let obj = { id: 0, idCustomer: this.idCustomer };
    const modal: HTMLIonModalElement =
      await this.modalCtrl.create({
        component: ProtocolOptEditComponent,
        componentProps: {
          obj: obj
        }
      });
    modal.onDidDismiss().then(data => {
      if (data)
        this.options.push(data['data']);
    });
    modal.present();
  }

  async option_edit(option) {
    console.log("option :", option);
    let obj = { id: option.id, option: option, idCustomer: this.idCustomer };
    const modal: HTMLIonModalElement =
      await this.modalCtrl.create({
        component: ProductOptEditComponent,
        componentProps: {
          obj: obj
        }
      });

    modal.onDidDismiss().then(data => {
      if (data) {
        const optionData = data['data'];
        for (let index = 0; index < this.options.length; index++) {
          if (option.id == this.options[index].id) {
            this.options[index] = optionData;
            this.editOption = optionData;
          }
        }
      }
    });
    await modal.present();
  }

  template_remove(ind) {
    console.log("index :", ind);
    this.selectedTemplate[ind] = 0;
    this.selectTemplate = 0;
    this.template = this.template.filter(function (value: any, index: number, array: any[]) { return index != ind; });
  }

  template_save() {
    console.log("templateTitle : ", this.templateTitleObj[this.lang]);
    if (this.templateTitleObj[this.lang] != "") {
      let obj = {
        user: this.userdata.id,
        title: "",
        options: "",
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
        let alert = this.alertCtrl.create({
          header: this.translate.instant('Speichern Sie erfolgreich'),
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

  loeschen() {

  }

  pdf_ansicht() {

  }
}
