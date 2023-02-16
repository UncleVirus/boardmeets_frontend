import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../shared.service';
import { DOCUMENT, Location } from '@angular/common';
import { Fade } from '../animations';
import { ApiManagerService } from './../api-manager/api-manager.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LicensesService } from '../services/licenses.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
})
export class LandingPageComponent implements OnInit {
  sessionStorage = window.sessionStorage;

  socialObj: any = [];
  organizationsObj: any = [];
  contactsObj: any = [];
  leadersObj: any = [];
  org_reference_key = '';
  currentUser: any = {};
  meetingsObj: any = [];
  users: any = [];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private router: Router,
    public sharedService: SharedService,
    private apiManager: ApiManagerService,
    private snackBar: MatSnackBar,
    private licenseService: LicensesService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.org_reference_key = this.currentUser?.org_reference_key;

    if (this.sessionStorage.getItem('load')) {
      this.getOrganizationDetails();
      this.getSocialMedia();
      this.getContacts();
      this.getLeadershipMembers();
      this.getActiveMeetings();
      this.getAllUsers();
    } else {
      this.sessionStorage.setItem('load', 'reload');
      location.reload();
    }
  }
  getAllUsers() {
    this.apiManager.getAllUsers().subscribe({
      next: (res) => (this.users = res),
    });
  }

  getActiveMeetings() {
    this.apiManager.getActiveMeetings().subscribe(
      (response: any) => {
        this.meetingsObj = response;
        console.log(response);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getOrganizationDetails() {
    this.licenseService
      .getOrganizationByOrRegNo(this.org_reference_key)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.organizationsObj = res;
        },
      });
  }

  getLeadershipMembers() {
    this.licenseService
      .getOrganizationLeaders(this.org_reference_key)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.leadersObj = res;
        },
      });
  }
  getContacts() {
    //const spiner = this.apiManager.startLoading('Setting up...');
    this.licenseService
      .getOrganizationContact(this.org_reference_key)
      .subscribe({
        next: (res) => {
          this.contactsObj = res;
          //this.apiManager.stopLoading(spiner);
        },
        error: (err) => {
          //this.apiManager.stopLoading(spiner)
        },
      });
  }
  getSocialMedia() {
    this.licenseService
      .getOrganizationSocialMedia(this.org_reference_key)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.socialObj = res;
        },
      });
  }

  viewMeetingDetails(meeting: any) {
    const path = '/admin/meeting-view-page';
    const param = {
      meeting: this.sharedService.encryptData(meeting),
    };
    this.sharedService.navigaTo(path, param);
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}
