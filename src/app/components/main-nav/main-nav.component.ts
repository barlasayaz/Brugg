import { Component, OnInit, Input , Output, EventEmitter, NgModule  } from '@angular/core';
import { UserdataService } from '../../services/userdata';
import { ApiService } from '../../services/api';
import { NavController, Events, MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { SystemService } from '../../services/system';
import { FormsModule } from '@angular/forms';

/**
 * Generated class for the MainNavComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */

@Component({
  selector: 'main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit {
  @Input() aktivPage: string;
  @Input() idCustomer: number;
  @Output() ping: EventEmitter<any> = new EventEmitter<any>();

  public progressBar: any = 0;
  public rowRecords: any = 0;
  public totalRecords: any = 0;
  public customerName = '';
  public searchText="";
 
  constructor(
    public userdata: UserdataService,
    public navCtrl: NavController,
    public translate: TranslateService,
    public events: Events,
    public systemService: SystemService,
    private menu: MenuController,
    public apiService: ApiService) {

    console.log('Hello MainNavComponent Component');
    this.events.subscribe('progressBar', (progressBar) => {
      if (progressBar >= 0) {
        this.progressBar = progressBar;
      }
    });
    this.events.subscribe('rowRecords', (rowRecords) => {
      this.rowRecords = rowRecords;
    });
    this.events.subscribe('totalRecords', (totalRecords) => {
      this.totalRecords = totalRecords;
    });

  }

  ngOnInit() {
    if (this.idCustomer > 0) {
      this.apiService.pvs4_get_customer(this.idCustomer).then((result: any) => {
        if (result && result.obj) {
          this.customerName = result.obj.company;
        }
      });
    }
  }

  search(event:any){
    console.log('search',event.target.value);
    this.searchText = event.target.value;
    const eventObj = {
      lable:"searchText",
      text:this.searchText
    }
    this.ping.emit(eventObj);
  }

  openMenu() {
    this.menu.enable(true, 'menu');
    this.menu.open('menu');
    console.log('menu opend');
  }

  
  shrinkMenu() {
    console.log('menu shrinked');
    this.systemService.shrinkMenu = !this.systemService.shrinkMenu ;
  }

  showdashfirst() {
    this.events.publish('className', 'showdashfirst');
    document.getElementById('dashfirst').className = 'active';
    document.getElementById('dashsecond').className = 'inactive';
  }

  showdashsecond() {
    this.events.publish('className', 'showdashsecond');
    document.getElementById('dashsecond').className = 'active';
    document.getElementById('dashfirst').className = 'inactive';
  }


}
