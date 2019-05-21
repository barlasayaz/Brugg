import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from '../components.module';
import { IonicModule } from '@ionic/angular';

import { ProtocolOptEditComponent } from './protocol-opt-edit.component';

const routes: Routes = [
  {
    path: '',
    component: ProtocolOptEditComponent
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
  declarations: [ProtocolOptEditComponent]
})
export class ProtocolOptEditComponentModule {}
