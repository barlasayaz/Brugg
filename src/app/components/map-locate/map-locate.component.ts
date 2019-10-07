import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, ModalController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-map-locate',
  templateUrl: './map-locate.component.html',
  styleUrls: ['./map-locate.component.scss'],
})
export class MapLocateComponent implements OnInit {
  lat: number = -23.8779431;
  long: number = -49.8046873;
  zoom: number = 15;

  constructor(public navParams : NavParams) { }

  ngOnInit() {
    this.lat = this.navParams.get('lat');
    this.long = this.navParams.get('long');
  }

}
