import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../shared.service';
import { DOCUMENT, Location } from '@angular/common';
import { ApiManagerService } from '../../api-manager/api-manager.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-meeting-page',
  templateUrl: './meeting-page.component.html',
  styleUrls: ['./meeting-page.component.css'],
})
export class MeetingPageComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  title = '';
  id = '';
  meetingsObj: any = [];
  currentUser: any = {};
  LoadMessage = 'loading eboard meetings.....';
  today = new Date();
  meetingRange = new FormGroup({
    start_date: new FormControl('', [Validators.required]),
    end_date: new FormControl('', [Validators.required]),
  });
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public sharedService: SharedService,
    private apiManager: ApiManagerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(this.sessionStorage.getItem('profile'));
    this.route.params.subscribe((params) => {
      this.id = params.id;

      if (this.id === 'active') {
        this.title = 'Up coming meetings';
        this.getActiveMeetings();
      } else {
        this.title = 'Past meetings';
        this.getExpiredMeetings();
      }
      this.meetingRange.reset();
    });
  }

  getExpiredMeetings() {
    const spinner = this.apiManager.startLoading(this.LoadMessage);
    this.apiManager.getExpiredMeetings().subscribe(
      (response: any) => {
        console.log(response);
        this.meetingsObj = response;
        this.apiManager.stopLoading(spinner);
      },
      (error: any) => {
        console.log(error);
        this.apiManager.stopLoading(spinner);
      }
    );
  }

  getActiveMeetings() {
    const spinner = this.apiManager.startLoading(this.LoadMessage);
    this.apiManager.getActiveMeetings().subscribe(
      (response: any) => {
        this.meetingsObj = response;
        console.log(response);
        this.apiManager.stopLoading(spinner);
      },
      (error) => {
        console.log(error);
        this.apiManager.stopLoading(spinner);
      }
    );
  }

  getMeetingsRange(data) {
    const spinner = this.apiManager.startLoading('Please wait...');
    this.apiManager.getMeetingsByRange(data).subscribe({
      next: (res: any) => {
        this.apiManager.stopLoading(spinner);
        if (res.length > 0) {
          this.meetingsObj = res;
          this.title = 'Filtered Meetings';
          this.openSnackBar('Data fetched successful. ', 'OK');
        } else {
          this.openSnackBar('No data found for the range provided.', 'Close');
        }
      },
      error: (err) => {
        console.log(err);
        this.apiManager.stopLoading(spinner);
      },
    });
  }

  deleteMeeting(meetingId: any) {
    this.apiManager.deleteMeeting(meetingId).subscribe(
      (res: any) => {
        if (this.id === 'active') {
          this.getActiveMeetings();
        } else this.getExpiredMeetings();
        this.openSnackBar(res.message, 'Close');
      },
      (err) => console.log(err)
    );
  }

  viewMeetingDetails(meeting: any) {
    this.sharedService.meetingObj.next([meeting]);
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
  openBook(){
    this.router.navigate(['admin/meeting-page/meeting-openbook'])
  }

}
