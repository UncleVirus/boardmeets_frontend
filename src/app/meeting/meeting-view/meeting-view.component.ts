import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChartType, ChartOptions } from 'chart.js';
import {
  SingleDataSet,
  Label,
  monkeyPatchChartJsLegend,
  monkeyPatchChartJsTooltip,
} from 'ng2-charts';

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';
import { SharedService } from 'src/app/shared.service';
import { DialogRemoteMeetingDialog } from '../meeting-creator/meeting-creator.component';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-meeting-view',
  templateUrl: './meeting-view.component.html',
  styleUrls: ['./meeting-view.component.css'],
})
export class MeetingViewComponent implements OnInit {
  //pie config

  public pieChartOptions: ChartOptions = { responsive: true };
  public pieChartLabels: Label[] = [["Haven't viewed"], ['Have viewed']];
  public pieChartData: SingleDataSet = [0, 0];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  //.................

  sessionStorage = window.sessionStorage;
  meetingObj: any = {};
  items: any = [];
  users: any = [];
  user_ids: any = [];
  currentUser: any = {};
  usersRsvp: any = [];
  minutesObj: any = [];
  rsvps: any = [];
  user_id: any = '';
  meeting_id: any = '';
  viewAgendaDoc = false;
  analytics: any = {};
  zoomObj: any = {};
  showZoomWindow = false;
  dragPosition = { x: 0, y: 0 };
  constructor(
    private sharedService: SharedService,
    public _location: Location,
    private apiManager: ApiManagerService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private _route: ActivatedRoute,
    private router: Router
  ) {
    //pie
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();

    this._route.params.subscribe((params) => {
      if (params['meeting']) {
        this.initializePage(params['meeting']);
      } else this._location.back();
    });
  }

  ngOnInit(): void {
    console.log(this.meetingObj);
  }

  initiateApi() {
    const request: any = this.setupData();
    if (request) {
      const spinner = this.apiManager.startLoading();
      const obs = forkJoin({
        c: request.req_minutes,
        d: request.req_rsvps,
        e: request.req_users,
        f: request.req_user_rsvp,
      });

      obs.subscribe({
        next: (res: any) => {
          this.apiManager.stopLoading(spinner);
          this.minutesObj = res.c;
          this.rsvps = res.d;
          this.users = res.e;
          this.usersRsvp = res.f;
        },
        error: (err) => {
          this.apiManager.stopLoading(spinner);
          console.log(err);
        },
      });
    }
  }
  getZoomDetails() {
    this.apiManager.getZoomMeetingByMeetingId(this.meeting_id).subscribe({
      next: (res: any) => {
        this.zoomObj = res?.data;
        console.log('zoom', this.zoomObj);
      },
      error: (err) => {
        console.log('err', err);
      },
    });
  }

  setupData() {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.user_id = this.currentUser?.id;
    this.meeting_id = this.meetingObj?.id;
    const req_users = this.apiManager.getAllUsers();
    const req_agendas = this.apiManager.getMeetingAgendas(this.meeting_id);
    const req_rsvps = this.apiManager.getMeetingRsvp(this.meeting_id);
    const req_user_rsvp = this.apiManager.getUserRsvp(
      this.meeting_id,
      this.user_id
    );
    const req_minutes = this.apiManager.getMeetingMinute(this.meeting_id);

    this.getAgendaItems();
    this.getZoomDetails();
    this.getMeetingAnalytics();
    return {
      req_agendas,
      req_minutes,
      req_rsvps,
      req_users,
      req_user_rsvp,
    };
  }

  initializePage(meeting: any) {
    this.meetingObj = this.sharedService.decryptData(meeting);
    if (this.meetingObj) {
      this.initiateApi();
    } else this._location.back();
  }

  getUserRsvp() {
    const data = {
      meeting_id: this.meetingObj.id,
      user_id: this.currentUser.id,
    };
    const spinner = this.apiManager.startLoading('Updating RSVP.....');
    this.apiManager.getUserRsvp(data.meeting_id, data.user_id).subscribe({
      next: (res) => {
        this.usersRsvp = res;
        this.apiManager.stopLoading(spinner);
      },
      error: (err) => this.apiManager.stopLoading(spinner),
    });
  }

  getMeetingAnalytics() {
    const meeting_id = this.meetingObj.id;
    this.apiManager.getMeetingAnalytics(meeting_id).subscribe({
      next: (res) => {
        this.analytics = res;
        console.log('analytics...............', res);
        const data = {
          viewed: this.analytics?.views || 0,
          not_viewed: 100 - this.analytics?.views || 0,
        };
        this.pieChartData = [data.not_viewed, data.viewed];
      },
      error: (err) => console.log(err),
    });
  }
  getMeetingRsvps() {
    const meeting_id = this.meetingObj.id;
    this.apiManager.getMeetingRsvp(meeting_id).subscribe({
      next: (res) => {
        this.rsvps = res;
      },
      error: (err) => console.log(err),
    });
  }

  getAgendaItems() {
    const meeting_id = this.meetingObj.id;

    this.apiManager.getMeetingAgendas(meeting_id).subscribe({
      next: (res: any) => {
        this.items = this.convertItemsToHyrchy(res);
        console.log('items', this.items);
      },
      error: (err) => console.log(err),
    });
  }

  convertItemsToHyrchy(arr) {
    let map = {},
      node,
      res = [],
      i;

    for (i = 0; i < arr.length; i += 1) {
      map[arr[i].id] = i;
      arr[i].childreen = [];
    }
    for (i = 0; i < arr.length; i += 1) {
      node = arr[i];
      if (node.parent_item) {
        arr[map[node.parent_item]]?.childreen.push(node);
      } else {
        res.push(node);
      }
    }

    return res;
  }

  getUserIds(obj) {
    if (obj) {
      for (let i = 0; i <= obj.length; i++) {
        if (obj[i]?.id) {
          this.user_ids.push(obj[i]?.id);
        }
      }
      return this.user_ids;
    }
  }
  leterize(num) {
    var letter = String.fromCharCode(num + 64);
    return letter;
  }
  romanize(num) {
    var lookup = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1,
      },
      roman = '',
      i;
    for (i in lookup) {
      while (num >= lookup[i]) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
  }

  setupRemoteMeeting(meeting) {
    const dialogRef = this.dialog.open(DialogRemoteMeetingDialog, {
      restoreFocus: false,
      width: '500px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      height: '100vh',
      position: {
        bottom: '0px',
        right: '0px',
      },
      data: meeting,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log(result);
      }
    });
  }

  joinMeeting() {
    let role = 0;
    if (this.currentUser.id == this.zoomObj?.created_by) {
      role = 1;
    }
    const data = {
      apiKey: 'wrcKqSnzSsSBqv5DQ6LygQ',
      meetingNumber: this.zoomObj['zoom_meeting_id'],
      password: this.zoomObj['zoom_meeting_password'],
      role: role,
    };
    console.log(data);
    this.sharedService.zoomObj.next(data);
    this.showZoomWindow = true;
  }

  viewMinutes(minutes: any) {
    const path = '/admin/minutes-page';
    const param = {
      minute: this.sharedService.encryptData(minutes[0]),
    };
    this.sharedService.navigaTo(path, param);
  }

  startMinutes(meeting: any) {
    const path = '/admin/minutes-creator-page';
    const param = {
      meeting: this.sharedService.encryptData(meeting),
    };
    this.sharedService.navigaTo(path, param);
  }

  openAgendaDocument(item: any) {
    this.sharedService.doc_ref.next(item.doc_ref);
    this.sharedService.DocumentToView.next(item.agenda_document);
    this.viewAgendaDoc = true;
  }

  openEditMeetingDialog(meeting) {
    meeting['invitees'] = this.getUserIds(meeting['invitees']);
    const data = {
      meeting: meeting,
      users: this.users,
    };
    const dialogRef = this.dialog.open(DialogEditMeetingDialog, {
      restoreFocus: false,
      width: '500px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      height: '100vh',
      position: {
        bottom: '0px',
        right: '0px',
      },
      data: data,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log(result);
        const path = '/admin/meeting-view-page';
        const param = {
          meeting: this.sharedService.encryptData(result),
        };
        this.sharedService.navigaTo(path, param);
      }
    });
  }

  openBook(){
    console.log("kamau");
    this.router.navigate(['admin/meeting-openbook'], {state: {meeting_id : this.meetingObj.id}});
  }
  editItemDetailsDialog(item) {
    const data = {
      users: this.users,
      agenda: item,
    };
    const dialogRef = this.dialog.open(DialogEditAgendaItemDialog, {
      restoreFocus: false,
      width: '500px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      height: '100vh',
      position: {
        bottom: '0px',
        right: '0px',
      },
      data: data,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getAgendaItems();
      }
    });
  }
  openAttandanceDialog(rsvps) {
    const dialogRef = this.dialog.open(DialogAttandanceDialog, {
      restoreFocus: false,
      width: '500px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      height: '100vh',
      position: {
        bottom: '0px',
        right: '0px',
      },
      data: rsvps,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
      }
    });
  }

  getRsvpsDetais() {
    this.getUserRsvp();
    this.getMeetingRsvps();
    this.getMeetingAnalytics();
  }

  openRsvpDialog(meeting) {
    const dialogRef = this.dialog.open(DialogRspDialog, {
      restoreFocus: false,
      width: '500px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      data: {},
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const data = {
          meeting_id: meeting.id,
          user_id: this.user_id,
          choice: result,
        };

        if (this.usersRsvp.length > 0) {
          this.apiManager
            .updateRsvp(data.meeting_id, data.user_id, { choice: result })
            .subscribe({
              next: (res) => {
                this.getRsvpsDetais();
              },
              error: (err) => console.log(err),
            });
        } else {
          this.apiManager.createRsvp(data).subscribe({
            next: (res) => {
              this.getRsvpsDetais();
            },
            error: (err) => console.log(err),
          });
        }
      }
    });
  }
}

@Component({
  selector: 'dialog-edit-meeting-dialog',
  templateUrl: 'dialog-edit-meeting-dialog.html',
  styleUrls: ['./meeting-view.component.css'],
})
export class DialogEditMeetingDialog {
  formGroup: FormGroup;
  meeting: any = {};
  users: any = [];
  loading = false;
  title = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogEditMeetingDialog>,
    private formBwilder: FormBuilder,
    private apiManager: ApiManagerService
  ) {}

  ngOnInit() {
    this.users = this.data.users;
    this.meeting = this.data.meeting;
    this.createForm();
  }
  createForm() {
    this.formGroup = this.formBwilder.group({
      meeting_title: [this.meeting?.meeting_title, [Validators.required]],
      start_date: [this.meeting?.start_date, [Validators.required]],
      end_date: [this.meeting?.end_date, [Validators.required]],
      meeting_address: [this.meeting?.meeting_address, [Validators.required]],
      invitees: [this.meeting?.invitees, [Validators.required]],
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit(data: any) {
    const meeting_id = this.meeting.id;
    this.loading = true;
    console.log(meeting_id, data);
    this.apiManager.updateMeeting(meeting_id, data).subscribe({
      next: (res) => {
        this.loading = false;
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      },
    });
  }
}

@Component({
  selector: 'dialog-edit-agenda-item-dialog',
  templateUrl: 'dialog-edit-agenda-item-dialog.html',
  styleUrls: ['./meeting-view.component.css'],
})
export class DialogEditAgendaItemDialog {
  sessionStorage = window.sessionStorage;
  currentUser: any = {};
  formGroup: FormGroup;
  loading = false;
  users: any = [];
  agenda: any = [];
  fileUrl = '';
  updateView = false;
  files: File[] = [];
  items: any = {};
  title = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogEditAgendaItemDialog>,
    private formBwilder: FormBuilder,
    private apiManager: ApiManagerService
  ) {}

  ngOnInit() {
    this.currentUser = JSON.parse(this.sessionStorage.getItem('profile'));
    this.users = this.data.users;
    this.items = this.data.agenda;
    this.agenda = this.sortItem({ ...this.items });
    this.createForm();
  }
  createForm() {
    this.formGroup = this.formBwilder.group({
      agenda_name: [this.agenda?.agenda_name, Validators.required],
      agenda_description: [this.agenda?.agenda_description],
      agenda_document: [this.agenda?.agenda_document],
      permission: [this.agenda?.permission],
      presenters: [this.agenda?.presenters],
      guests: [this.agenda?.guests],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit(data: any) {
    const item_id = this.agenda.id;
    if (this.fileUrl) data['agenda_document'] = this.fileUrl;
    console.log(data);
    this.loading = true;
    this.apiManager.updateAgenda(item_id, data).subscribe({
      next: (res) => {
        console.log(res);
        this.loading = false;
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      },
    });
  }

  deleteAgenda(item_id) {
    this.apiManager.deleteAgenda(item_id).subscribe({
      next: (res) => {
        console.log(res);
        this.loading = false;
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.log(err);
        this.loading = false;
      },
    });
  }

  //add attachment
  onSelect(event: any) {
    this.files.push(...event.addedFiles);
    if (this.files[0]) {
      const file = this.files[0];

      this.changeFile(file).then((fileBlob: string): any => {
        this.fileUrl = fileBlob;
      });
    }
    return;
  }
  //change to blob data
  changeFile(file: any) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }
  //remove attachment
  onRemove(event: any) {
    console.log(event);
    this.files.splice(this.files.indexOf(event), 1);
    this.fileUrl = '';
  }

  sortItem(obj) {
    obj['permission'] = this.getUserIds(obj['permission']);
    return obj;
  }
  getUserIds(obj) {
    let user_ids = [];
    if (obj) {
      for (let i = 0; i <= obj.length; i++) {
        if (obj[i]?.id) {
          user_ids.push(obj[i]?.id);
        }
      }
      return user_ids;
    } else return [];
  }
}

@Component({
  selector: 'dialog-attandance-dialog',
  templateUrl: 'dialog-attandance-dialog.html',
  styleUrls: ['./meeting-view.component.css'],
})
export class DialogAttandanceDialog {
  rsvps: any = {};
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogAttandanceDialog>,
    private apiManager: ApiManagerService
  ) {}

  ngOnInit() {
    this.rsvps = this.data;
    console.log(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'dialog-rsvp-dialog',
  templateUrl: 'dialog-rsvp-dialog.html',
  styleUrls: ['./meeting-view.component.css'],
})
export class DialogRspDialog {
  choice: any = 'Attending';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogRspDialog>
  ) {}

  ngOnInit() {}

  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit() {
    this.dialogRef.close(this.choice);
  }
}
