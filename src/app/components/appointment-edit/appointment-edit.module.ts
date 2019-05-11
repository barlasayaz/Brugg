import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

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
    RouterModule.forChild(routes)
  ],
  declarations: [AppointmentEditComponent]
})
export class AppointmentEditComponentModule {}
