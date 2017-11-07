import { Component } from '@angular/core';

import { SettingsPage } from '../settings/settings';
import { AttendanceManagerPage } from './../attendance-manager/attendance-manager';
import { HomePage } from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = AttendanceManagerPage;
  tab3Root = SettingsPage;

  constructor() {

  }
}