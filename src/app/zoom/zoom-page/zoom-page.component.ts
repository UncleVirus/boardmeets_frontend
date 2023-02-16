import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import ZoomMtgEmbedded from '@zoomus/websdk/embedded';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-zoom-page',
  templateUrl: './zoom-page.component.html',
  styleUrls: ['./zoom-page.component.css'],
})
export class ZoomPageComponent implements OnInit, AfterViewInit {
  sessionStorage = window.sessionStorage;
  apiKey: any = '';
  meetingNumber = '';
  leaveUrl = 'http://localhost:4200/admin/';
  userName = '';
  userEmail = '';
  passWord = '';
  registrantToken = '';
  signature = '';
  client = ZoomMtgEmbedded.createClient();

  data: any = {};
  currentUser: any = {};
  constructor(
    private apiManager: ApiManagerService,
    private sharedService: SharedService,
    @Inject(DOCUMENT) document
  ) {
    sharedService.zoomObj.subscribe({ next: (res) => (this.data = res) });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.userName =
      this.currentUser?.first_name + ' ' + this.currentUser?.last_name;
    this.userEmail = this.currentUser?.email;
    this.passWord = this.data['password'];
    this.meetingNumber = this.data['meetingNumber'];
    this.apiKey = this.data['apiKey'];
    this.initiateMeeting();

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((success) => {
          if (navigator.mediaDevices) {
          }
        }, this.errorCallback);
    }
  }

  errorCallback = (error) => {
    if (
      error.name == 'NotAllowedError' ||
      error.name == 'PermissionDismissedError'
    ) {
      return false;
    }
  };

  initiateMeeting() {
    let meetingSDKElement = document.getElementById('meetingSDKElement');
    this.client
      .init({
        debug: true,
        zoomAppRoot: meetingSDKElement,
        language: 'en-US',
        customize: {
          meetingInfo: [
            'topic',
            'host',
            'mn',
            'pwd',
            'telPwd',
            'invite',
            'participant',
            'dc',
            'enctype',
          ],
          toolbar: {
            buttons: [
              {
                text: 'Custom Button',
                className: 'CustomButton',
                onClick: () => {
                  console.log('custom button');
                },
              },
            ],
          },
        },
      })
      .then(() => {
        this.getSignature();
      })
      .catch((reason) => {
        console.log('err ', reason);
      });
  }

  getSignature() {
    const param = {
      meetingNumber: this.data['meetingNumber'],
      role: this.data['role'],
    };
    this.apiManager.generateZoomSignature(param).subscribe({
      next: (signature: any) => {
        this.joinMeeting(signature);
        console.log(signature);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  joinMeeting(signature) {
    this.client
      .join({
        apiKey: this.apiKey,
        signature: signature,
        meetingNumber: this.meetingNumber,
        password: this.passWord,
        userName: this.userName,
        userEmail: this.userEmail,
        tk: this.registrantToken,
      })
      .then(() => {
        console.log('success....');
      })
      .catch((err) => {
        console.log('err ......', err);
      });
  }

  ngAfterViewInit(): void {
    this.sharedService.zoomOpen.next(false);
  }
}
