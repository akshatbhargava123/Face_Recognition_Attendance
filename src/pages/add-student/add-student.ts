import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, Platform, Config, LoadingController } from 'ionic-angular';

import { Camera, CameraOptions } from '@ionic-native/camera';

import { DynamoDB, User } from '../../providers/providers';

import { Student, dataURItoBlob, StudentGroup } from './../../app/app.models';

declare var AWS: any;
declare const aws_user_files_s3_bucket;
declare const aws_user_files_s3_bucket_region;

@Component({
  selector: 'page-add-student',
  templateUrl: 'add-student.html',
})
export class AddStudentPage {

  @ViewChild('avatar') avatarInput;

  isReadyToSave: boolean;
  student: Student;
  studentGroup: StudentGroup;
  isAndroid: boolean;

  private s3: any;
  public avatarPhoto: string;
  public selectedPhoto: Blob;

  private studentsTable: string = 'students';

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public viewCtrl: ViewController,
              public platform: Platform,
              public user: User,
              public db: DynamoDB,
              public config: Config,
              public camera: Camera,
              public loadingCtrl: LoadingController) {
    this.isAndroid = platform.is('android');
    this.student = {
      'id': navParams.get('id'),
      'groupId': navParams.get('group')['id'],
      'name': '',
      'photoUrl': 'http://placehold.it/255'
    };
    this.studentGroup = navParams.get('group');
    this.avatarPhoto = null;
    this.selectedPhoto = null;
    this.s3 = new AWS.S3({
      'params': {
        'Bucket': aws_user_files_s3_bucket
      },
      'region': aws_user_files_s3_bucket_region
    });

    user.getUser().getUserAttributes((err, data) => {
      // this.refreshAvatar();
    });
  }

  refreshAvatar(updateDb) {
    let dbLoader = this.loadingCtrl.create({
      content: 'Adding student...'
    });
    dbLoader.present();
    this.s3.getSignedUrl('getObject', {'Key': 'uploads/students/' + this.student.id}, (err, url) => {
      this.avatarPhoto = url;
      this.student.photoUrl = url;
      updateDb(dbLoader);
    });
  }

  selectAvatar() {
    const options: CameraOptions = {
      quality: 100,
      targetHeight: 200,
      targetWidth: 200,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      this.selectedPhoto  = dataURItoBlob('data:image/jpeg;base64,' + imageData);
      // console.log(this.selectedPhoto);
      // this.upload();
    }, (err) => {
      this.avatarInput.nativeElement.click();
      // Handle error
    });
  }

  uploadFromFile(event) {
    const files = event.target.files;
    // console.log('Uploading', files)
    var reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
      this.selectedPhoto = dataURItoBlob(reader.result);
      // console.log(this.selectedPhoto);
      // this.upload();
    };
    reader.onerror = (error) => {
      alert('Unable to load file. Please try another.')
    }
  }

  upload(updateDb: any) {
    let loading = this.loadingCtrl.create({
      content: 'Uploading image...'
    });
    loading.present();

    if (this.selectedPhoto) {
      this.s3.upload({
        'Key': 'uploads/students/' + String(this.student.id),
        'Body': this.selectedPhoto,
        'ContentType': 'image/jpeg'
      }).promise().then((data) => {
        this.refreshAvatar(updateDb);
        console.log('upload complete:', data);
        loading.dismiss();
      }, err => {
        console.log('upload failed....', err);
        loading.dismiss();
      });
    }
    else loading.dismiss();

  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  done() {
    this.student.created = new Date().getTime() / 1000;
    let updateDb = (loader) => this.db.getDocumentClient().put({
      'TableName': this.studentsTable,
      'Item': this.student,
      'ConditionExpression': 'attribute_not_exists(id)'
    }, (err, data) => {
      if (err) { console.log(err); }
      loader.dismiss();
      this.viewCtrl.dismiss();
    });
    this.upload(updateDb);
  }

}