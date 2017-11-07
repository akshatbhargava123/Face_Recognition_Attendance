import { TakeAttendancePage } from './../take-attendance/take-attendance';
import { AddStudentPage } from './../add-student/add-student';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';

import { Student, StudentGroup, generateId } from './../../app/app.models';

import { DynamoDB, User } from '../../providers/providers';

declare var AWS: any;
declare const aws_user_files_s3_bucket;
declare const aws_user_files_s3_bucket_region;

@Component({
  selector: 'page-student-list',
  templateUrl: 'student-list.html',
})
export class StudentListPage {

  private s3: any;

  public studentList: Student[] = null;
  public studentGroup: StudentGroup;
  public refresher: any;
  private studentsTable: string = 'students';


  constructor(public navCtrl: NavController,
              public loadingCtrl: LoadingController,
              public modalCtrl: ModalController,
              public navParams: NavParams,
              public user: User,
              public db: DynamoDB) {
    this.s3 = new AWS.S3({
      'params': {
        'Bucket': aws_user_files_s3_bucket
      },
      'region': aws_user_files_s3_bucket_region
    });

    this.studentGroup = navParams.get('studentGroup');
    let dataLoader = this.loadingCtrl.create({
      content: 'Loading Students...'
    });
    dataLoader.present();
    this.refreshList(dataLoader);
  }

  refreshData(refresher) {
    this.refresher = refresher;
    this.refreshList();
  }

  refreshPhotoUrls() {
    for (let i = 0; i < this.studentList.length; i++) {
      this.s3.getSignedUrl('getObject', {'Key': 'uploads/students/' + this.studentList[i].id}, (err, url) => {
        this.studentList[i].photoUrl = url;
      });
    }
  }

  refreshList(dataLoader?: any) {
    this.db.getDocumentClient().query({
      'TableName': this.studentsTable,
      'KeyConditionExpression': "#groupId = :groupId",
      'ExpressionAttributeNames': {
        '#groupId': 'groupId',
      },
      'ExpressionAttributeValues': {
        ':groupId': this.studentGroup.id
      }
    }).promise().then((data) => {
      if (dataLoader) dataLoader.dismiss();
      this.studentList = data.Items;
      this.refreshPhotoUrls();
      if (this.refresher) {
        this.refresher.complete();
      }
      console.log('studentList: ', this.studentList);
    }).catch((err) => {
      console.log(err);
    });
  }

  addStudent() {
    let id = generateId();
    let addModal = this.modalCtrl.create(AddStudentPage, {
      'id': id,
      'group': this.studentGroup
    });
    addModal.onDidDismiss(() => {
      this.refreshList();
    });
    addModal.present();
    // console.log('create student...');
  }

  deleteStudent(student: Student, index: number) {
    this.db.getDocumentClient().delete({
      'TableName': this.studentsTable,
      'Key': {
        'userId': AWS.config.credentials.identityId,
        'id': student.id
      }
    }).promise().then((data) => {
      this.studentList.splice(index, 1);
      console.log('deleted the student.');
    }).catch((err) => {
      console.log('there was an error', err);
    });
  }

  openStudentDetail() {

  }

  registerAttendance() {
    this.navCtrl.push(TakeAttendancePage, {
      'studentGroup': this.studentGroup,
      'studentList': this.studentList
    });
  }

}
