import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../components.module';
import { MainNavComponent } from './main-nav.component';
import { TranslateModule } from '@ngx-translate/core';
import {RoundProgressModule} from 'angular-svg-round-progressbar';

const routes: Routes = [
  {
    path: '',
    component: MainNavComponent
  }
];

@NgModule({
 // declarations: [MainNavComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RoundProgressModule,
    RouterModule.forChild(routes),
    //ComponentsModule
  ],
  exports: [
    //MainNavComponentModule
  ]
})
export class MainNavComponentModule {}
