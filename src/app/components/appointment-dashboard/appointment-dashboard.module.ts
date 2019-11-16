import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AppointmentDashboardComponent } from './appointment-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: AppointmentDashboardComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FullCalendarModule,
    RouterModule.forChild(routes)
  ],
  declarations: []
})
export class AppointmentDashboardComponentModule {}

