import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components.module';
import { AppointmentEditComponent } from './appointment-edit.component';

const routes: Routes = [
  {
    path: '',
    component: AppointmentEditComponent
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
  declarations: [AppointmentEditComponent]
})
export class AppointmentEditComponentModule {}
