import { Component, Inject, OnInit } from '@angular/core';
import { ApiManagerService } from './../api-manager/api-manager.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { LicensesService } from '../services/licenses.service';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css'],
})
export class OrganizationComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  panelOpenState = false;
  formGroup: FormGroup;
  updateForm: FormGroup;
  selectedValue: string;
  timezone: {};
  ipRangesObj: any = [];
  organizationsObj: any = [];
  updateObj: any = {};
  orgDetailsObj: any = {};
  hide = true;
  files: File[] = [];
  fileUrl = '';
  sysAdmin = true;
  loadingUpdate = false;
  editOrg = false;
  loading = false;
  socialObj: any = [];
  contactsObj: any = [];
  leadersObj: any = [];
  org_reference_key = '';
  currentUser: any = {};
  auditUserObj: any = [];

  constructor(
    private formBuilder: FormBuilder,
    private licenseService: LicensesService,
    private api: ApiManagerService,
    public snackBar: MatSnackBar,
    private router: Router,
    public _location: Location,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.org_reference_key = this.currentUser?.org_reference_key;

    this.http.get('assets/json/timezone.json').subscribe((res) => {
      this.timezone = res;
    });
    this.intializePage();

    this.getSocialMedia();
    this.getContacts();
    this.getLeadershipMembers();
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
    this.licenseService
      .getOrganizationContact(this.org_reference_key)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.contactsObj = res;
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

  intializePage() {
    const data = this.setUpdata();
    if (data) {
      forkJoin([data.range, data.auditTrial, data.org]).subscribe({
        next: (res) => {
          this.organizationsObj = res[2];
          console.log(this.organizationsObj);
          this.ipRangesObj = res[0];

          this.auditUserObj = res[1];
          this.api.stopLoading(data.spinner);
        },
        error: (err) => {
          console.log(err);
          this.api.stopLoading(data.spinner);
        },
      });
    }
  }

  setUpdata() {
    const spinner = this.api.startLoading('Loading settings ......');
    const org = this.licenseService.getOrganizationByOrRegNo(
      this.org_reference_key
    );
    const range = this.api.getIpAddressRange(this.org_reference_key);
    const auditTrial = this.api.getUserAuditTrial();
    return {
      spinner,
      range,
      auditTrial,
      org,
    };
  }

  updateOrgForm() {
    this.updateForm = this.formBuilder.group({
      name: [this.updateObj?.name, [Validators.required]],
      time_zone: [this.updateObj?.time_zone, [Validators.required]],
      mission: [this.updateObj?.mission, [Validators.required]],
      vision: [this.updateObj?.vision, [Validators.required]],
      address: [this.updateObj?.address, [Validators.required]],

      description: [this.updateObj?.description, [Validators.required]],

      postal_code: [this.updateObj?.postal_code || ''],
      state: [this.updateObj?.state || ''],
      street_address: [this.updateObj?.street_address || ''],

      city: [this.updateObj?.city, [Validators.required]],
      country: [this.updateObj?.country, [Validators.required]],
    });
  }

  getOraganization() {
    this.licenseService
      .getOrganizationByOrRegNo(this.org_reference_key)
      .subscribe(
        (response) => {
          this.organizationsObj = response;
          console.log(response);
        },
        (error) => {
          this.openSnackBar(error.error?.message, 'CLOSE');
        }
      );
  }

  enableEditOrganization(value: boolean, data: any) {
    this.updateObj = {};
    this.editOrg = value;
    if (this.editOrg) {
      this.updateObj = data;
      this.updateOrgForm();
    }
  }

  updateOrganization(data: any) {
    console.log(data);
    this.loadingUpdate = true;
    this.licenseService.updateOrganization(this.updateObj?.id, data).subscribe(
      (Response: any) => {
        this.editOrg = false;
        this.loadingUpdate = false;
        this.getOraganization();
        this.openSnackBar('Organization updated successful', 'CLOSE');
      },
      (error: any) => {
        this.loadingUpdate = false;
      }
    );
  }

  CreateContactDialog() {
    const dialogRef = this.dialog.open(CreateContactDialog, {
      restoreFocus: false,
      width: '350px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      data: { org_ref: this.org_reference_key },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getContacts();
      }
    });
  }

  CreateContactSocialMediaDialog() {
    const dialogRef = this.dialog.open(CreateSocialMediaDialog, {
      restoreFocus: false,
      width: '350px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      data: { org_ref: this.org_reference_key },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getSocialMedia();
      }
    });
  }

  CreateLeadersDialog() {
    const dialogRef = this.dialog.open(CreateLeadersDialog, {
      restoreFocus: false,
      width: '350px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      data: { org_ref: this.org_reference_key },
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getLeadershipMembers();
      }
    });
  }

  deleteContact(id) {
    this.licenseService.deleteOrganizationContact(id).subscribe({
      next: (res) => {
        console.log(res);
        this.openSnackBar('Contact details deleted successfull. ', 'Close');
        this.getContacts();
      },
    });
  }

  deleteSocial(id) {
    this.licenseService.deleteOrganizationSocial(id).subscribe({
      next: (res) => {
        console.log(res);
        this.openSnackBar('Social media details deleted successfull. ', 'Close');
        this.getSocialMedia();
      },
    });
  }

  deleteBoardMember(id) {
    this.licenseService.deleteOrganizationLeaders(id).subscribe({
      next: (res) => {
        console.log(res);
        this.openSnackBar('Member deleted successfull. ', 'Close');
        this.getLeadershipMembers();
      },
    });
  }

  //ip filtering
  AddIpAddressRange() {
    const dialogRef = this.dialog.open(AddIpRangeDialog, {
      restoreFocus: false,
      width: '500px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      data: this.org_reference_key,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getIpRange();
      }
    });
  }

  getIpRange() {
    this.api.getIpAddressRange(this.org_reference_key).subscribe(
      (resp: any) => {
        this.ipRangesObj = resp;
        console.log('resp', resp);
      },
      (err) => console.log(err)
    );
  }

  getAuditUserTrial() {
    this.api.getUserAuditTrial().subscribe(
      (res) => {
        this.auditUserObj = res;
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  deleteIpRange(range_id: any) {
    this.loading = true;
    this.api.deleteIpRange(range_id).subscribe(
      (resp) => {
        this.loading = false;
        this.openSnackBar('Deleted successful', 'Close');
        this.getIpRange();
      },
      (err) => {
        this.loading = false;
        console.log(err);
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
  selector: 'app-add-ip-range-dialog',
  templateUrl: 'add-ip-range-dialog.html',
  styleUrls: ['./organization.component.css'],
})
export class AddIpRangeDialog implements OnInit {
  loading = false;
  formGroup: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<AddIpRangeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBwilder: FormBuilder,
    private apiManager: ApiManagerService,
    private snackBar: MatSnackBar
  ) {}
  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBwilder.group({
      ip_start: ['', [Validators.required]],
      organization: [this.data, [Validators.required]],
      ip_end: ['', [Validators.required]],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit() {
    console.log(this.formGroup.value);
    this.loading = true;
    this.apiManager.createIpAddressRange(this.formGroup.value).subscribe(
      (resp: any) => {
        this.loading = false;
        this.openSnackBar('Ip range created successfully', 'Close');
        this.dialogRef.close('ok');
      },
      (error: any) => {
        this.loading = false;
        this.openSnackBar(error.error?.data, 'Close');
        console.log(error);
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
  selector: 'dialog-create-contact-dialog',
  templateUrl: 'dialog-create-contact-dialog.html',
  styleUrls: ['./organization.component.css'],
})
export class CreateContactDialog implements OnInit {
  formGroup: FormGroup;
  loading = false;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateContactDialog>,
    private apiManager: LicensesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      org_ref_key: [this.data?.org_ref, Validators.required],
      website: ['', Validators.required],
      phone_number: ['', Validators.required],
    });
  }
  OnSubmit(data: any) {
    console.log(data);
    this.loading = true;
    this.apiManager.createOrganizationContact(data).subscribe({
      next: (res) => {
        console.log(res);
        this.loading = false;
        this.dialogRef.close('Contact added successfully. ');
      },
      error: (err) => {
        this.loading = false;
        console.log(err);
      },
    });
  }
}

@Component({
  selector: 'dialog-create-social-media-dialog',
  templateUrl: 'dialog-create-sosial-medial-dialog.html',
  styleUrls: ['./organization.component.css'],
})
export class CreateSocialMediaDialog implements OnInit {
  formGroup: FormGroup;
  loading = false;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateSocialMediaDialog>,
    private apiManager: LicensesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      org_ref_key: [this.data?.org_ref, Validators.required],
      twitter_link: ['', Validators.required],
      facebook_link: ['', Validators.required],
    });
  }
  OnSubmit(data: any) {
    console.log(data);
    this.loading = true;
    this.apiManager.createOrganizationSocialMedia(data).subscribe({
      next: (res) => {
        console.log(res);
        this.loading = false;
        this.dialogRef.close('Social media added successfully. ');
      },
      error: (err) => {
        this.loading = false;
        console.log(err);
      },
    });
  }
}

@Component({
  selector: 'dialog-create-leaders-dialog',
  templateUrl: 'dialog-create-leaders-dialog.html',
  styleUrls: ['./organization.component.css'],
})
export class CreateLeadersDialog implements OnInit {
  formGroup: FormGroup;
  loading = false;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateLeadersDialog>,
    private apiManager: LicensesService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      org_ref_key: [this.data?.org_ref, Validators.required],
      ceo: ['', Validators.required],
      secretary: ['', Validators.required],
      chairman: ['', Validators.required],
    });
  }
  OnSubmit(data: any) {
    console.log(data);
    this.loading = true;
    this.apiManager.createOrganizationLeaders(data).subscribe({
      next: (res) => {
        console.log(res);
        this.loading = false;
        this.dialogRef.close('Leaders added successful. ');
      },
      error: (err) => {
        this.loading = false;
        console.log(err);
      },
    });
  }
}
