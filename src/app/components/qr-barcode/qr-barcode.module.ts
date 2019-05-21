import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
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
    TranslateModule,
    TableModule,
    NgxQRCodeModule,
    RouterModule.forChild(routes)
  ],
  declarations: [QrBarcodeComponent]
})
export class QrBarcodeComponentModule {}
