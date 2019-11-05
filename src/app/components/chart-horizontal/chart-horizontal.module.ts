import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { ChartModule } from 'primeng/chart';
import { ChartHorizontalComponent } from './chart-horizontal.component';

const routes: Routes = [
  {
    path: '',
    component: ChartHorizontalComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChartModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ChartHorizontalComponent]
})
export class ChartHorizontalComponentModule {}
