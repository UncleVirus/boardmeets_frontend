import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiManagerService } from '../api-manager/api-manager.service';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-verify-user-page',
  templateUrl: './verify-user-page.component.html',
  styleUrls: ['./verify-user-page.component.css'],
})
export class VerifyUserPageComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  formGroup: FormGroup;
  loading = false;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));
  constructor(
    private fb: FormBuilder,
    private apiManager: ApiManagerService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      username: ['', [Validators.required]],
      auth_code: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  resendCodeDialog(): void {
    const dialogRef = this.dialog.open(ResendCodeDialog, {
      disableClose: true,
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.openSnackBar(result.message, 'Close');
      }
    });
  }

  verifyUser(data: any) {
    this.loading = true;
    this.apiManager.verifyUser(data).subscribe(
      (resp: any) => {
        this.loading = false;
        console.log(resp);

        if (resp?.status === 'false') {
          this.openSnackBar(
            resp?.data + ' ' + 'try again or resend the code',
            'CLOSE'
          );
          return;
        } else if (resp.token) {
          const token = 'token ' + resp.token;
          this.sessionStorage.setItem('token', token);
          const user = resp.user[0];
          this.sessionStorage.setItem('profile', JSON.stringify(user));
          this.router.navigate(['/admin/landing-page']);
        }
      },
      (error) => {
        console.log(error);
        if (error?.error?.error) {
          this.openSnackBar(error?.error?.error, 'Close');
        }
        this.loading = false;
      }
    );
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}

@Component({
  selector: 'app-resend-code-dialog',
  templateUrl: 'resend-code-dialog.html',
  styleUrls: ['./verify-user-page.component.css'],
})
export class ResendCodeDialog implements OnInit {
  loading = false;
  formGroup: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<ResendCodeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBwilder: FormBuilder,
    private apiManager: ApiManagerService
  ) {}
  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBwilder.group({
      email: ['', [Validators.required]],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit() {
    this.loading = true;
    console.log(this.formGroup.value);
    this.apiManager.resendVerificationCode(this.formGroup.value).subscribe(
      (response: any) => {
        this.loading = false;
        console.log(response);
        this.dialogRef.close(response);
      },
      (error) => {
        this.loading = false;
        console.log(error);
      }
    );
  }
}
