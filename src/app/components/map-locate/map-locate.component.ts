import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController} from '@ionic/angular';

@Component({
  selector: 'app-map-locate',
  templateUrl: './map-locate.component.html',
  styleUrls: ['./map-locate.component.scss'],
})
export class MapLocateComponent implements OnInit {
  lat: number = -23.8779431;
  long: number = -49.8046873;
  zoom: number = 15;
  modalTitle = "GPS";

  constructor(public navParams : NavParams,
              public viewCtrl : ModalController) { }

  ngOnInit() {
    this.lat = parseFloat(this.navParams.get('lat'));
    this.long = parseFloat(this.navParams.get('long'));
    console.log("map init lat,long",this.navParams.get('lat'),this.navParams.get('long'));
  }

  dismiss()
  {
    this.viewCtrl.dismiss(false);
  }

}
