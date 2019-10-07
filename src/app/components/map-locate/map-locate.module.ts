import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { AgmCoreModule } from '@agm/core';
import { MapLocateComponent } from './map-locate.component';

const routes: Routes = [
  {
    path: '',
    component: MapLocateComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AgmCoreModule.forRoot({
        apiKey: 'AIzaSyAkpR6Cay995gCK-4pNxhkfDhJ8G04Tfao'
      }),
    RouterModule.forChild(routes)
  ],
  declarations: [MapLocateComponent]
})
export class MapLocateComponentModule {}
