import { Component } from '@angular/core';
import { NavController, LoadingController, ModalController } from 'ionic-angular';
import { StudentGroup, generateId } from './../../app/app.models';

import { StudentListPage } from './../student-list/student-list';
import { CreateStudentGroupPage } from './../create-student-group/create-student-group';

import { DynamoDB, User } from '../../providers/providers';

declare var AWS: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  public studentGroups: StudentGroup[] = null;
  public refresher: any;
  private studentGroupTable: string = 'studentGroups';

  constructor(public navCtrl: NavController,
              public loadingCtrl: LoadingController,
              public modalCtrl: ModalController,
              public user: User,
              public db: DynamoDB) {
    let dataLoader = this.loadingCtrl.create({
      content: 'Loading Student Groups from db...',
      spinner: 'dots'
    });
    dataLoader.present();
    this.refreshList(dataLoader);
  }

  refreshData(refresher) {
    this.refresher = refresher;
    this.refreshList();
  }

  refreshList(dataLoader?: any) {
    this.db.getDocumentClient().query({
      'TableName': this.studentGroupTable,
      'KeyConditionExpression': "#userId = :userId",
      'ExpressionAttributeNames': {
        '#userId': 'userId',
      },
      'ExpressionAttributeValues': {
        ':userId': AWS.config.credentials.identityId
      }
    }).promise().then((data) => {
      if (dataLoader) dataLoader.dismiss();
      this.studentGroups = data.Items;
      if (this.refresher) {
        this.refresher.complete();
      }
      console.log('studentGroups: ', this.studentGroups);
    }).catch((err) => {
      console.log(err);
    });
  }

  createStudentGroup() {
    let id = generateId();
    let addModal = this.modalCtrl.create(CreateStudentGroupPage, { 'id': id });
    addModal.onDidDismiss(item => {
      if (item) {
        item.userId = AWS.config.credentials.identityId;
        item.created = (new Date().getTime() / 1000);
        this.db.getDocumentClient().put({
          'TableName': this.studentGroupTable,
          'Item': item,
          'ConditionExpression': 'attribute_not_exists(id)'
        }, (err, data) => {
          if (err) { console.log(err); }
          this.refreshList();
        });
      }
    })
    addModal.present();
    // console.log('create student group...');
  }

  deleteGroup(studentGroup: StudentGroup, index: number) {
    this.db.getDocumentClient().delete({
      'TableName': this.studentGroupTable,
      'Key': {
        'userId': AWS.config.credentials.identityId,
        'id': studentGroup.id
      }
    }).promise().then((data) => {
      this.studentGroups.splice(index, 1);
      console.log('deleted the studentGroup.');
    }).catch((err) => {
      console.log('there was an error', err);
    });
  }

  openStudentList(studentGroup: StudentGroup) {
    this.navCtrl.push(StudentListPage, {
      'studentGroup': studentGroup
    });
  }

}
