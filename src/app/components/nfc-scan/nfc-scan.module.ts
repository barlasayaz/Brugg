import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ColorPickerModule } from 'primeng/primeng';
import { NfcScanComponent } from './nfc-scan.component';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';

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
    ColorPickerModule,
    TableModule,
    TranslateModule,
    RouterModule.forChild(routes)
  ],
  declarations: [NfcScanComponent]
})
export class NfcScanComponentModule {}
