import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NoteEditComponent } from './note-edit.component';
import { ComponentsModule } from '../components.module';

const routes: Routes = [
  {
    path: '',
    component: NoteEditComponent
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
  declarations: [NoteEditComponent]
})
export class NoteEditComponentModule {}
