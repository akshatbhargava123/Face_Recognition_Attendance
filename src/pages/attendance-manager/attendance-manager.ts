import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-attendance-manager',
  templateUrl: 'attendance-manager.html',
})
export class AttendanceManagerPage {

  selectedDate: string = new Date().toISOString(); 

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    
  }

}