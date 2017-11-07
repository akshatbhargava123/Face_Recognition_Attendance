import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';

import { HttpModule } from "@angular/http";
import { Camera } from '@ionic-native/camera';

import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { ConfirmPage } from '../pages/confirm/confirm';
import { HomePage } from '../pages/home/home';
import { CreateStudentGroupPage } from "../pages/create-student-group/create-student-group";
import { StudentListPage } from './../pages/student-list/student-list';
import { AddStudentPage } from "../pages/add-student/add-student";
import { StudentDetailPage } from "../pages/student-detail/student-detail";
import { SettingsPage } from '../pages/settings/settings';
import { AboutPage } from '../pages/about/about';
import { AccountPage } from '../pages/account/account';
import { TabsPage } from '../pages/tabs/tabs';
import { AttendanceManagerPage } from "../pages/attendance-manager/attendance-manager";
import { TakeAttendancePage } from "../pages/take-attendance/take-attendance";

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { User } from '../providers/user';
import { Cognito } from '../providers/aws.cognito';
import { DynamoDB } from '../providers/aws.dynamodb';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    CreateStudentGroupPage,
    AttendanceManagerPage,
    TakeAttendancePage,
    StudentListPage,
    StudentDetailPage,
    AddStudentPage,
    LoginPage,
    SignupPage,
    ConfirmPage,
    SettingsPage,
    AboutPage,
    AccountPage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    CreateStudentGroupPage,
    AttendanceManagerPage,
    TakeAttendancePage,
    StudentListPage,
    StudentDetailPage,
    AddStudentPage,
    LoginPage,
    SignupPage,
    ConfirmPage,
    SettingsPage,
    AboutPage,
    AccountPage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    Camera,
    User,
    Cognito,
    DynamoDB
  ]
})
export class AppModule {}

declare var AWS;
AWS.config.customUserAgent = AWS.config.customUserAgent + ' Ionic';
