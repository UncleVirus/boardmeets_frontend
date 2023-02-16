import { Component, OnInit, Inject } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiManagerService } from '../../api-manager/api-manager.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-contract-form',
  templateUrl: './creation.component.html',
  styleUrls: ['./creation.component.css'],
})
export class CreationComponent implements OnInit {
  formGroup: FormGroup;
  sessionStorage = window.sessionStorage;
  fileToUpload: File = null;
  departments: any = [];
  viewContract: any = false;

  loading = false;
  uploading = false;
  users: any = [];
  files: File[] = [];
  fileUrl = '';
  b64Blob = null;
  submitted = false;
  fileData = null;
  sendEmail = false;
  currentUser: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private apiManager: ApiManagerService,
    public snackBar: MatSnackBar,
    private router: Router,
    public _location: Location,
    public dialog: MatDialog,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(this.sessionStorage.getItem('profile'));
    this.getAllUsers();
    //this.getDepartments();

    this.createForm();
  }
  createForm() {
    this.formGroup = this.formBuilder.group({
      contract_title: ['', [Validators.required]],
      parties: ['', [Validators.required]],
      description: ['', [Validators.required]],
      permission: [''],
      sendEmail: [false],
      approvers: ['', [Validators.required]],
      signatories: ['', [Validators.required]],
      end_date_time: ['', [Validators.required]],
      start_date_time: ['', [Validators.required]],
      created_by: [this.currentUser?.id, [Validators.required]],
    });
  }
  getDepartments() {
    this.apiManager.getDepartments().subscribe({
      next: (res) => (this.departments = res),
    });
  }

  getAllUsers() {
    const obs = this.apiManager.getAllUsers();
    if (obs != null) {
      obs.subscribe(
        (response: any) => {
          this.users = response;
          console.log(response);
        },
        (error: any) => {
          console.log('error..', error);
        }
      );
    } else {
      this.openSnackBar('Check your internet connection', 'CLOSE');
    }
  }

  onSubmitContract(data: any) {
    if (this.fileUrl) {
      data['document'] = this.fileUrl;
    } else return alert('Document is required');

    data['sendEmail'] = this.sendEmail;

    const spinner = this.apiManager.startLoading('Saving contract....');
    this.apiManager.createContract(data).subscribe({
      next: (res) => {
        this.apiManager.stopLoading(spinner);
        this.openSnackBar('Contract created successfull. ', 'Close');

        //this._location.back();
        this.signatoriesPlacement(res);
      },
      error: (err) => {
        this.apiManager.stopLoading(spinner);
        this.openSnackBar('Oops! Something went wrong. ', 'Close');
        console.log(err);
      },
    });
  }
  signatoriesPlacement(contractObj) {
    this.sharedService.doc_ref.next('');
    this.sharedService.signatories.next(contractObj?.signatories);
    this.sharedService.DocumentToView.next(contractObj);
    this.viewContract = true;
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
    this.files.splice(this.files.indexOf(event), 1);
    this.fileUrl = '';
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}
