import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { SharedService } from '../shared.service';
import { Router } from '@angular/router';
import { ApiManagerService } from './../api-manager/api-manager.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent implements OnInit {
  sessionStorage = window.sessionStorage;

  choice: any = '';
  responseOptions: any = [];
  invitations: any = [];
  response_id = null;
  panelOpenState = false;
  notification = false;
  loadingNotification = false;
  loading = false;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private sharedService: SharedService,
    private apiManager: ApiManagerService
  ) {}

  ngOnInit(): void {
    const token = this.sessionStorage.getItem('token');
    console.log(token);
    if (!token) {
      this.router.navigate(['/login-page']);
    }
    this.sharedService.sendTitleEvent('Notifications');
    this.getResponseOptions();
    this.getInvitations();
  }

  getResponseOptions() {
    this.apiManager.getResponseOptions().subscribe(
      (response: any) => {
        this.responseOptions = response.responseOptions;
        console.log(this.responseOptions);
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
  getInvitations() {
    this.loadingNotification = true;
    this.apiManager.getUserMeetingInvitations().subscribe(
      (response: any) => {
        this.loadingNotification = false;
        this.invitations = response.invitations;
        if (this.invitations.length > 0) {
          this.notification = true;
        }
        console.log(this.invitations);
      },
      (error) => {
        this.loadingNotification = false;
        console.log(error);
      }
    );
  }

  changeResponse(value: any) {
    this.response_id = value;
  }
  onSubmit(id: any) {
    if (this.response_id !== null) {
      const data = {
        invitation: id || 1,
        response: this.response_id,
      };
      this.loading = true;
      this.apiManager.respondToInvitations(data).subscribe(
        (response: any) => {
          this.getInvitations();
          this.loading = false;
        },
        (error: any) => {
          this.loading = false;
          console.log(error);
        }
      );
    }
  }
  deleteNotif(): void {
    const dialogRef = this.dialog.open(NotificationDeleteDialog, {
      disableClose: true,
      width: '500px',
      data: {
        choice: this.choice,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === undefined) {
        console.log('denied..', result);
      } else {
        console.log('cool..', result);
      }
    });
  }

  markNotif(): void {
    const dialogRef = this.dialog.open(NotificationMarkDialog, {
      disableClose: true,
      width: '500px',
      data: {
        choice: this.choice,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === undefined) {
        console.log('denied..', result);
      } else {
        console.log('cool..', result);
      }
    });
  }
}

@Component({
  selector: 'delete-notification-dialog',
  templateUrl: 'delete-notification-dialog.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationDeleteDialog {
  constructor(
    public dialogRef: MatDialogRef<NotificationDeleteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  delete(data: any) {
    this.dialogRef.close(data);
  }
}

@Component({
  selector: 'mark-notification-dialog',
  templateUrl: 'mark-notification-dialog.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationMarkDialog {
  constructor(
    public dialogRef: MatDialogRef<NotificationMarkDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  mark(data: any) {
    this.dialogRef.close(data);
  }
}
