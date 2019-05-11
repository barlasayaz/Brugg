import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { QrBarcodeComponent } from './qr-barcode.component';

const routes: Routes = [
  {
    path: '',
    component: QrBarcodeComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [QrBarcodeComponent]
})
export class QrBarcodeComponentModule {}
