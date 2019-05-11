import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { StartscreenNewPage } from './startscreen-new.page';

const routes: Routes = [
  {
    path: '',
    component: StartscreenNewPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [StartscreenNewPage]
})
export class StartscreenNewPageModule {}
