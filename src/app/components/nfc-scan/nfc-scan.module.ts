import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { NfcScanComponent } from './nfc-scan.component';

const routes: Routes = [
  {
    path: '',
    component: NfcScanComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [NfcScanComponent]
})
export class NfcScanComponentModule {}
