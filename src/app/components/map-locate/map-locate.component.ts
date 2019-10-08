import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController} from '@ionic/angular';
import { MapsAPILoader } from '@agm/core';
import { TranslateService } from '@ngx-translate/core';

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
  address: string;
  private geoCoder;

  constructor(public navParams : NavParams,
              public translate: TranslateService,
              public viewCtrl : ModalController,
              private mapsAPILoader: MapsAPILoader) { }

  ngOnInit() {
    this.lat = parseFloat(this.navParams.get('lat'));
    this.long = parseFloat(this.navParams.get('long'));
    console.log("map init lat,long",this.navParams.get('lat'),this.navParams.get('long'));
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder;
      this.geoCoder.geocode({ 'location': { lat: this.lat, lng: this.long } }, (results, status) => {
        console.log(results);
        console.log(status);
        if (status === 'OK') {
          if (results[0]) {
            this.address = results[0].formatted_address;
          } else {
            console.log('No results found');
          }
        } else {
          console.log('Geocoder failed due to: ', status);
        }
  
      });
    });
  }

  dismiss()
  {
    this.viewCtrl.dismiss(false);
  }

}
