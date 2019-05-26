import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { AssignmentPage } from './assignment.page';
const routes: Routes = [
  {
    path: '',
    component: AssignmentPage
  }
];
@NgModule({
  declarations: [
    AssignmentPage,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
})
export class AssignmentPageModule {}
