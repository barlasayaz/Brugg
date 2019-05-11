import { Component } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';

/**
 * Generated class for the NoteDetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'app-note-details',
  templateUrl: './note-details.page.html',
  styleUrls: ['./note-details.page.scss'],
})
export class NoteDetailsPage {
  public idNote: number = 0;
  public activNote: any = {};

  public idCustomer: number = 0;
  public company: string = "";
  public categoryNames: string[] = ["Besuchsberichte","Kundenpotential","Kundenbeziehung","Mitbewerber",
  "Dokumentation","Werbegeschenke","Jahreswechsel","Dienstleistungen",
  "Disposition","Sonstiges","Neukundenakquise"];

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              public userdata: UserdataService, 
              public apiService: ApiService,
              public translate: TranslateService,) {

      this.idCustomer = this.navParams.get("idCustomer"); 
      this.idNote = this.navParams.get("idNote");   
      this.company = this.navParams.get("company"); 
      this.loadNote(this.idNote);  

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NoteDetailsPage');
  }

  loadNote(id) {
    this.apiService.pvs4_get_note(id).then((result:any)=>{
        this.activNote = result.obj;  
        this.activNote.category = this.translate.instant(this.categoryNames[this.activNote.category-1]);
        console.log('loadCustomer', this.activNote); 
    });
  }

}
