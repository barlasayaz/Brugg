import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from '../components/components.module';
import { IonicModule } from '@ionic/angular';

import { ProtocolDetailsPage } from './protocol-details.page';

const routes: Routes = [
  {
    path: '',
    component: ProtocolDetailsPage
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
  declarations: [ProtocolDetailsPage]
})
export class ProtocolDetailsPageModule {}
