import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ComponentsModule } from '../components/components.module';
import { IonicModule } from '@ionic/angular';
import { FullCalendarModule } from 'ng-fullcalendar';
import { AppointmentPlanPage } from './appointment-plan.page';

const routes: Routes = [
  {
    path: '',
    component: AppointmentPlanPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ComponentsModule,
    IonicModule,
    FullCalendarModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AppointmentPlanPage]
})
export class AppointmentPlanPageModule {}
