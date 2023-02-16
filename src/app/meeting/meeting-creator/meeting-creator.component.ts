import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';

@Component({
  selector: 'app-meeting-creator',
  templateUrl: './meeting-creator.component.html',
  styleUrls: ['./meeting-creator.component.scss'],
})
export class MeetingCreatorComponent implements OnInit {
  formGroup: FormGroup;
  loadingCompliance = false;
  loadingChecks = false;
  agendaForm: FormGroup;
  sendEmail: false;
  item: any = '';
  level: any = 0;
  i_parent: any = '';
  i_item_a: any = '';
  i_item_b: any = '';

  editItem: any = {};
  users: any = [];
  meeting: any = null;
  agendaFormUpdate: any = '';
  itemsJson: any = {};

  groupInvitees: any = new FormControl([]);

  constructor(
    public _location: Location,
    private fb: FormBuilder,
    private apiManager: ApiManagerService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getUsers();
    this.createMeeetingForm();
    this.createAgendaForm();
  }

  createMeeetingForm() {
    this.formGroup = this.fb.group({
      meeting_title: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      end_date: ['', [Validators.required]],
      meeting_address: ['', [Validators.required]],
      invitees: [''],
      isActive: [true, [Validators.required]],
    });
  }

  onSubmitMeeting(data) {
    var invitess = this.groupInvitees.value.concat(
      data['invitees'].filter(
        (item) => this.groupInvitees.value.indexOf(item) < 0
      )
    );

    data['invitees'] = invitess;
    data['sendEmail'] = this.sendEmail;

    if (data['invitees'].length > 0) {
      if (this.meeting?.id) {
        const spinner = this.apiManager.startLoading('Updating meeting..');
        this.apiManager.updateMeeting(this.meeting?.id, data).subscribe({
          next: (res) => {
            this.apiManager.stopLoading(spinner);
            this.openSnackBar('Meeting updated successfull', 'Close');
          },
          error: (err) => {
            this.apiManager.stopLoading(spinner);
            this.openSnackBar('Oops! Error while updating meeting', 'Close');
          },
        });
      } else {
        const spinner = this.apiManager.startLoading(
          'Saving meeting details..'
        );
        this.apiManager.createMeeting(data).subscribe({
          next: (res: any) => {
            if (res?.status === 'Failed') {
              this.meeting = res.message_object;
            } else {
              this.meeting = res;
            }
            this.apiManager.stopLoading(spinner);
            this.openSnackBar('Meeting created successful. ', 'Close');
            this.createAgendaForm();
          },
          error: (err) => {
            this.apiManager.stopLoading(spinner);
            this.openSnackBar('Oops! Something went wrong.  ', 'Close');
            console.log(err);
          },
        });
      }
    } else alert('Invites are required');
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
  leterize(num) {
    var letter = String.fromCharCode(num + 64);
    return letter;
  }

  getUsers() {
    this.apiManager
      .getAllUsers()
      .subscribe({ next: (res) => (this.users = res) });
  }

  createAgendaForm() {
    this.agendaForm = this.fb.group({
      meeting_id: [this.meeting?.id, [Validators.required]],
      items: this.fb.array([]),
    });
    this.addItem();
  }

  setActiveItem(level, i_parent, i_item_a, i_item_b) {
    this.level = level;
    this.i_parent = i_parent;
    this.i_item_a = i_item_a;
    this.i_item_b = i_item_b;
  }
  addSubSection(level) {
    if (level == 1) {
      this.addSecondLevelItem(this.i_parent);
    } else if (level == 2) {
      this.addThirdLevelItem(this.i_parent, this.i_item_a);
    }
    this.level = 0;
  }

  deleteSection(level) {
    if (level == 1) {
      this.removeItem(this.i_parent);
    } else if (level == 2) {
      this.removeSecondLevelItem(this.i_parent, this.i_item_a);
    } else if (level == 3) {
      this.removeThirdLevelItem(this.i_parent, this.i_item_a, this.i_item_b);
    }
    this.level = 0;
  }

  addItem() {
    (this.agendaForm.get('items') as FormArray).push(
      this.fb.group({
        agenda_name: ['', [Validators.required]],
        agenda_description: [''],
        agenda_document: [''],
        permission: [''],
        presenters: [''],
        guests: [''],
        level_a_items: this.fb.array([]),
      })
    );
  }
  removeItem(i) {
    (this.agendaForm.get('items') as FormArray).removeAt(i);
    this.item = '';
  }

  addSecondLevelItem(i_parent) {
    console.log(i_parent);
    const options = (this.agendaForm.get('items') as FormArray).controls[
      i_parent
    ].get('level_a_items') as FormArray;
    console.log(options);

    options.push(
      this.fb.group({
        agenda_name: ['', [Validators.required]],
        agenda_description: [''],
        agenda_document: [''],
        permission: [''],
        presenters: [''],
        guests: [''],
        level_b_items: this.fb.array([]),
      })
    );
  }

  removeSecondLevelItem(i_item, index) {
    (
      (<FormArray>this.agendaForm.controls['items'])
        .at(i_item)
        .get('level_a_items') as FormArray
    ).removeAt(index);
  }

  addThirdLevelItem(i_item, index) {
    const options = (
      (this.agendaForm.get('items') as FormArray).controls[i_item].get(
        'level_a_items'
      ) as FormArray
    ).controls[index].get('level_b_items') as FormArray;

    options.push(
      this.fb.group({
        agenda_name: ['', [Validators.required]],
        agenda_description: [''],
        agenda_document: [''],
        permission: [''],
        presenters: [''],
        guests: [''],
      })
    );
  }
  removeThirdLevelItem(i_item, index, i) {
    const item = (
      (<FormArray>this.agendaForm.controls['items'])
        .at(i_item)
        .get('level_a_items') as FormArray
    )
      .at(index)
      .get('level_b_items') as FormArray;
    item.removeAt(i);
  }

  submitAgendaItems(data) {
    this.itemsJson = data;
    const spinner = this.apiManager.startLoading(
      'Saving meeting agenda items....'
    );
    this.apiManager.createAgenda(data).subscribe({
      next: (res) => {
        this.apiManager.stopLoading(spinner);
        this.openSnackBar(
          'Agenda items attached to the meeting successful. ',
          'Close'
        );
      },
      error: (err) => {
        this.apiManager.stopLoading(spinner);
        this.openSnackBar('Something went wrong. ', 'Close');
      },
    });
  }

  remoteMeetingDetails(): void {
    const data = this.meeting;
    if (data !== null) {
      const dialogRef = this.dialog.open(DialogRemoteMeetingDialog, {
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
        }
      });
    }
  }

  editItemDetailsDialog(i_item, level = 0, a_item_index, b_item_index): void {
    if (level == 0) {
      this.editItem = this.agendaForm.value.items[i_item];

      this.agendaFormUpdate = (<FormArray>this.agendaForm.get('items')).at(
        i_item
      );
    } else if (level == 1) {
      this.editItem =
        this.agendaForm.value.items[i_item].level_a_items[a_item_index];

      this.agendaFormUpdate = (
        (<FormArray>this.agendaForm.controls['items'])
          .at(i_item)
          .get('level_a_items') as FormArray
      ).at(a_item_index);
    } else if (level == 2) {
      this.editItem =
        this.agendaForm.value.items[i_item].level_a_items[
          a_item_index
        ].level_b_items[b_item_index];

      this.agendaFormUpdate = (
        (
          (<FormArray>this.agendaForm.controls['items'])
            .at(i_item)
            .get('level_a_items') as FormArray
        )
          .at(a_item_index)
          .get('level_b_items') as FormArray
      ).at(b_item_index);
    }
    const data = {
      item: this.editItem,
      users: this.meeting?.invitees,
    };

    const dialogRef = this.dialog.open(DialogEditAgendaDialog, {
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
        this.agendaFormUpdate.patchValue({
          agenda_name: result.agenda_name,
          agenda_description: result.agenda_description,
          agenda_document: result.agenda_document,
          permission: result.permission,
          presenters: result.presenters,
          guests: result.guests,
        });
      }
    });
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}

@Component({
  selector: 'dialog-edit-agenda-dialog',
  templateUrl: 'dialog-edit-agenda-dialog.html',
  styleUrls: ['./meeting-creator.component.scss'],
})
export class DialogEditAgendaDialog {
  formGroup: FormGroup;
  users: any = [];
  agenda: any = {};
  fileUrl = '';
  files: File[] = [];
  loading = false;
  title = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogEditAgendaDialog>,
    private formBwilder: FormBuilder,
    private apiManager: ApiManagerService
  ) {}

  ngOnInit() {
    this.users = this.data.users;
    this.agenda = this.data.item;
    this.formGroup = this.formBwilder.group({
      agenda_name: [this.agenda?.agenda_name || []],
      agenda_description: [this.agenda?.agenda_description || []],
      agenda_document: [this.agenda?.agenda_document || []],
      permission: [this.agenda?.permission || []],
      presenters: [this.agenda?.presenters || []],
      guests: [this.agenda?.guests || []],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit(data: any) {
    if (this.fileUrl) data['agenda_document'] = this.fileUrl;
    this.dialogRef.close(data);
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
}

@Component({
  selector: 'dialog-setup-remote-dialog',
  templateUrl: 'dialog-setup-remote-dialog.html',
  styleUrls: ['./meeting-creator.component.scss'],
})
export class DialogRemoteMeetingDialog {
  formGroup: FormGroup;
  zoomObj: any = [];
  loading = false;
  title = '';
  numbers = [20, 30, 40, 45];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogEditAgendaDialog>,
    private formBwilder: FormBuilder,
    private apiManager: ApiManagerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.formGroup = this.formBwilder.group({
      meeting_id: [this.data?.id, [Validators.required]],
      zoom_topic: [this.data?.meeting_title, [Validators.required]],
      start_time: ['', [Validators.required]],
      duration: ['', [Validators.required]],
    });
  }

  onSubmit(data: any) {
    this.loading = true;
    this.apiManager.generateZoomMeeting(data).subscribe(
      (response: any) => {
        this.loading = false;
        this.zoomObj = response?.data;
        this.openSnackBar(response?.message, 'CLOSE');
        //this.dialogRef.close();
      },
      (err) => {
        this.loading = false;
        console.log(err);
        this.openSnackBar(err?.message, 'CLOSE');
      }
    );
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}
