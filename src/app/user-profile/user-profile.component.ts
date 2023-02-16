import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ApiManagerService } from '../api-manager/api-manager.service';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { LicensesService } from '../services/licenses.service';
import { SignaturePadComponent } from '../dialogs/signature-pad/signature-pad.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  formGroup: FormGroup;
  passwordView = false;
  loading = false;
  currentUser: any = {};
  org_reference_key = '';
  signature: string = '';
  signatureId: any;
  organizationsObj: any = [];
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private apiManager: ApiManagerService,
    private licenseService: LicensesService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.org_reference_key = this.currentUser.org_reference_key;
    this.createForm();
    this.getUserSignature();
  }

  createForm() {
    this.formGroup = this.fb.group({
      old_password: ['', Validators.required],
      new_password: ['', Validators.required],
    });
  }

  getUserSignature() {
    const user_id = this.currentUser?.id;
    this.apiManager.getSignatureByUser(user_id).subscribe(
      (res: any) => {
        this.signature = res[0]?.signature;
        this.signatureId = res[0]?.id;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onSubmit(data) {
    const user_id = this.currentUser?.id;
    this.apiManager.changePassword(user_id, data).subscribe({
      next: (res) => {
        this.openSnackBar('Password changed successfull', 'Close');
        this.router.navigate(['/login-page']);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  editprofileDialog(data): void {
    const dialogRef = this.dialog.open(DialogEditProfileDialog, {
      restoreFocus: false,
      width: '500px',
      panelClass: ['animate__animated', 'animate__slideInRight'],
      height: '100vh',
      position: {
        bottom: '0px',
        right: '0px',
      },
      data: data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.openSnackBar(result, 'Close');
        this.router.navigate(['/login-page']);
      }
    });
  }

  createSignature() {
    const dialogRef = this.dialog.open(SignaturePadComponent, {
      restoreFocus: false,
      data: this.currentUser,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getUserSignature();
      }
    });
  }

  deleteSignature() {
    this.apiManager.deleteSignature(this.signatureId).subscribe(
      (res) => {
        console.log(res);
        this.signature = '';
        this.getUserSignature();
      },
      (err) => console.log(err)
    );
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}

@Component({
  selector: 'dialog-edit-profile-dialog',
  templateUrl: 'dialog-edit-profile-dialog.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class DialogEditProfileDialog implements OnInit {
  userForm: FormGroup;
  groups: any = [];
  user: any = {};
  loading = false;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogEditProfileDialog>,
    private apiManager: ApiManagerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.user = this.data;

    this.createForm();
  }
  createForm() {
    this.userForm = this.fb.group({
      email: [this.user.email, Validators.required],
      last_name: [this.user.last_name, [Validators.required]],
      first_name: [this.user.first_name, [Validators.required]],
      phone_no: [this.user.phone_no, [Validators.required]],
      twofa_status: [this.user.twofa_status, [Validators.required]],
    });
  }
  OnSubmit(data: any) {
    console.log(data);
    const user_id = this.user.id;
    this.loading = true;
    this.apiManager.updateProfile(user_id, data).subscribe({
      next: (res) => {
        this.loading = false;
        this.dialogRef.close('Account updated successfull');
      },
      error: (err) => {
        this.loading = false;
        console.log(err);
      },
    });
  }
}
