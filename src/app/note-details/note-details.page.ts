import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiService } from '../services/api';
import { TranslateService } from '@ngx-translate/core';
import { UserdataService } from '../services/userdata';
import { ActivatedRoute } from '@angular/router';

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
  public categoryNames: string[] = ['Besuchsberichte', 'Kundenpotential', 'Kundenbeziehung', 'Mitbewerber',
                                    'Dokumentation', 'Werbegeschenke', 'Jahreswechsel', 'Dienstleistungen',
                                    'Disposition', 'Sonstiges', 'Neukundenakquise'];

  constructor(public navCtrl: NavController, 
              public userdata: UserdataService, 
              public apiService: ApiService,
              public translate: TranslateService,
              private route: ActivatedRoute) {

      this.idNote = parseInt(this.route.snapshot.paramMap.get('id'));
      this.loadNote(this.idNote);

  }

  loadNote(id) {
    this.apiService.pvs4_get_note(id).then((result: any) => {
        this.activNote = result.obj;
        this.activNote.category = this.translate.instant(this.categoryNames[this.activNote.category - 1]);
        this.idCustomer = this.activNote.customer;
        this.loadCustomer(this.idCustomer);
        console.log('loadCustomer', this.activNote);
    });
  }

  loadCustomer(id) {
    this.apiService.pvs4_get_customer(id).then((result: any) => {
      this.activNote.company = result.obj.company;
    });
  }
}
