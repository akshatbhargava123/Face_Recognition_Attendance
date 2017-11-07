import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, Platform } from 'ionic-angular';

@Component({
  selector: 'page-create-student-group',
  templateUrl: 'create-student-group.html',
})
export class CreateStudentGroupPage {

  isReadyToSave: boolean;
  
  item: any;

  isAndroid: boolean;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController,
              public platform: Platform) {
    this.isAndroid = platform.is('android');
    this.item = {
      'id': navParams.get('id')
    };
    this.isReadyToSave = true;
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  done() { 
    this.viewCtrl.dismiss(this.item);
  }

}