import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ToastController } from 'ionic-angular';

import { StudentGroup, Student, dataURItoBlob, Attendance, generateId } from './../../app/app.models';
import { CameraOptions, Camera } from '@ionic-native/camera';

import { Http } from "@angular/http";
import { DynamoDB } from '../../providers/providers';

declare var AWS: any;
declare const aws_user_files_s3_bucket;
declare const aws_user_files_s3_bucket_region;

@Component({
  selector: 'page-take-attendance',
  templateUrl: 'take-attendance.html',
})
export class TakeAttendancePage {

  private s3: any;
  attendanceTableName: string = 'attendanceRecords';

  @ViewChild('avatar') avatarInput;
  selectedGroupPhoto: any = null;
  studentGroup: StudentGroup;
  studentList: Student[];

  present: boolean[] = []; // if present[i], studentList[i] student is present
  numPresentStudents: number = 0;
  processingStatus = 'Image not uploaded!';

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public toastCtrl: ToastController,
              public db: DynamoDB,
              public http: Http,
              public camera: Camera) {

    this.s3 = new AWS.S3({
      'params': {
        'Bucket': aws_user_files_s3_bucket
      },
      'region': aws_user_files_s3_bucket_region
    });

    this.studentGroup = navParams.get('studentGroup');
    this.studentList = navParams.get('studentList');
    for (let i = 0; i < this.studentList.length; i++) {
      this.present.push(false);
    }
  }

  updatePresentCount() {
    this.numPresentStudents = 0;
    for (let i = 0; i < this.present.length; i++) {
      if (this.present[i]) this.numPresentStudents++;
    }
  }

  selectAvatar() {
    const options: CameraOptions = {
      quality: 100,
      targetHeight: 200,
      targetWidth: 200,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      this.selectedGroupPhoto  = dataURItoBlob('data:image/jpeg;base64,' + imageData);
      this.upload();
    }, (err) => {
      this.avatarInput.nativeElement.click();
    });
  }

  uploadFromFile(event) {
    const files = event.target.files;
    var reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = () => {
      this.selectedGroupPhoto = dataURItoBlob(reader.result);
      this.upload();
    };
    reader.onerror = (error) => {
      alert('Unable to load file. Please try another.')
    }
  }

  upload() {
    this.processingStatus = 'Processing...';
    if (this.selectedGroupPhoto) {
      this.s3.upload({
        'Key': 'uploads/attendanceRecords/' + String(this.studentGroup.name),
        'Body': this.selectedGroupPhoto,
        'ContentType': 'image/jpeg'
      }).promise().then((data) => {
        console.log('upload complete:', data);
        this.markAttendance();
      }, err => {
        console.log('upload failed....', err);
      });
    }
  }

  markAttendance() {
    let toast = this.toastCtrl.create({
      message: 'Finding matches...',
      duration: 2000
    });
    toast.present();
    for (let i = 0; i < this.studentList.length; i++) {
      let url = `http://192.168.0.19:80/aws?sfn=uploads/students/${this.studentList[i].id}&tfn=uploads/attendanceRecords/${this.studentGroup.name}`;
      let req = this.http.get(url).subscribe((res) => {
        this.checkPresent(res, i);
        req.unsubscribe();
        if (i == this.studentList.length - 1) {
          this.processingStatus = this.numPresentStudents + ' present out of ' + this.studentList.length + '!';
          let finishToast = this.toastCtrl.create({
            message: 'Processed all faces...',
            duration: 2000
          });
          finishToast.present();
        }
      });
    }
  }

  checkPresent(res: any, i: number) {
    let resBody = JSON.parse(res['_body']);
    let matchedFace = resBody['FaceMatches'][0];
    if (matchedFace != null) {
      if (matchedFace['Face']['Confidence'] > 80) {
        this.present[i] = true;
        console.log(this.studentList[i].name + " present!");
      }
    } else {
      console.log(this.studentList[i].name + " absent!");
    }
    this.updatePresentCount();
  }

  registerAttendance() {
    for (let i = 0; i < this.present.length; i++) {
      if (this.present[i]) {
        let record = {
          date: new Date().toISOString(),
          id: generateId(),
          studentId: this.studentList[i].id,
          studentGroupId: this.studentGroup.id
        } as Attendance;
        this.db.getDocumentClient().put({
          'TableName': this.attendanceTableName,
          'Item': record,
          'ConditionExpression': 'attribute_not_exists(id)'
        }, (err, data) => {
          if (err) { console.log(err); }
        });
      }
    }
  }

}