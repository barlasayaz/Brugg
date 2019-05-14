import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from '../components/components.module';
import { IonicModule } from '@ionic/angular';

import { ProtocolHistoryPage } from './protocol-history.page';

const routes: Routes = [
  {
    path: '',
    component: ProtocolHistoryPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProtocolHistoryPage]
})
export class ProtocolHistoryPageModule {}
