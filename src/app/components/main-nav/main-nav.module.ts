import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser'
import { IonicModule } from '@ionic/angular';

import { MainNavComponent } from './main-nav.component';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: MainNavComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MainNavComponent]
})
export class MainNavComponentModule {}
