import { Location } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { ApiManagerService } from '../../api-manager/api-manager.service';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-e-signature-page',
  templateUrl: './e-signature-page.component.html',
  styleUrls: ['./e-signature-page.component.css'],
})
export class ESignaturePageComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  formGroup: FormGroup;
  placement = false;

  users: any = [];
  files: File[] = [];
  fileUrl = null;
  folder_id = null;
  folder_name = '';
  currentUser: any = {};
  sendEmail = false;

  constructor(
    private _formBuilder: FormBuilder,
    private apiManager: ApiManagerService,
    public _location: Location,
    private dialog: MatDialog,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));

    this.getAllUsers();

    this.createForm();
  }

  getAllUsers() {
    const spinner = this.apiManager.startLoading();
    this.apiManager.getAllUsers().subscribe(
      (resp) => {
        this.users = resp;
        this.apiManager.stopLoading(spinner);
      },
      (error) => this.apiManager.stopLoading(spinner)
    );
  }
  createForm() {
    this.formGroup = this._formBuilder.group({
      signature_title: ['', Validators.required],
      open_date: ['', Validators.required],
      close_date: ['', Validators.required],
      description: ['', Validators.required],
      signers: ['', [Validators.required]],
    });
  }

  onSubmit(data: any) {
    data['sendEmail'] = this.sendEmail;
    if (this.folder_id !== null) {
      data['destination_folder_id'] = this.folder_id;
    }

    if (this.fileUrl !== null) {
      data['document'] = this.fileUrl;
    } else {
      alert('Document is required');
      return;
    }
    const spinner = this.apiManager.startLoading('Saving eSignature....');
    console.log(data);
    this.apiManager.createDocumetSignature(data).subscribe(
      (res: any) => {
        this.apiManager.stopLoading(spinner);
        this.addSignersToplacement(res);
      },
      (err) => {
        this.apiManager.stopLoading(spinner);
      }
    );
  }
  addSignersToplacement(eSignatureObj: any) {
    this.sharedService.doc_ref.next(eSignatureObj?.doc_ref);
    this.sharedService.signatories.next(eSignatureObj?.signers);
    this.sharedService.DocumentToView.next(eSignatureObj);
    this.placement = true;
  }

  back() {
    this._location.back();
  }

  openDocDestinationDialog(): void {
    const dialogRef = this.dialog.open(DialogDocumentDestinationDialog, {
      restoreFocus: false,
      width: '600px',
      data: { action: 'Create sub folder' },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.folder_id = result.id;
        this.folder_name = result.name;
      }
    });
  }

  removeDocumentLocation() {
    this.folder_id = '';
    this.folder_name = '';
  }

  //add attachment
  onSelect(event: any) {
    this.files.push(...event.addedFiles);
    if (this.files[0]) {
      const file = this.files[0];

      this.changeFile(file).then((fileBlob: string): any => {
        this.fileUrl = fileBlob;
        console.log(this.fileUrl);
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
}

@Component({
  selector: 'dialog-document-destination-dialog',
  templateUrl: './dialog-cdocument-destination-dialog.html',
  styleUrls: ['./e-signature-page.component.css'],
})
export class DialogDocumentDestinationDialog {
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = ['name', 'created'];
  isLoadingResults = false;
  loadData = false;
  steps: any = [];
  parentId: any = null;
  parentFolderName = '';
  isParent = true;
  title = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogDocumentDestinationDialog>,
    private apiManager: ApiManagerService
  ) {}

  ngOnInit() {
    this.title = this.data?.action;
    this.getMainfolders();
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit(data: any) {
    this.dialogRef.close(data);
  }

  getMainfolders() {
    this.apiManager.getMainFolders().subscribe(
      (response: any) => {
        this.isLoadingResults = false;
        if (response.length > 0) {
          this.loadData = true;
          this.dataSource = new MatTableDataSource(response);
        } else {
          this.loadData = false;
        }
      },
      (error) => {
        this.isLoadingResults = false;
        console.log('error', error);
      }
    );
  }

  getSubFolders(data: any) {
    this.apiManager.getSubFolders(data).subscribe(
      (response: any) => {
        this.isLoadingResults = false;
        if (response.length > 0) {
          console.log(response);
          this.dataSource = new MatTableDataSource(response);
          this.loadData = true;
          const param = { folder: this.parentId };
        } else {
          this.loadData = false;
        }
      },
      (error: any) => {
        this.isLoadingResults = false;
        console.log(error);
      }
    );
  }

  openFolder(element: any) {
    const id = element.id;
    this.steps.push(id);
    this.parentId = id;
    console.log(this.parentId);
    this.isParent = false;
    const param = { parent: id };
    this.isLoadingResults = true;
    this.parentFolderName = element?.name;
    this.getSubFolders(param);
  }

  backClicked(): void {
    if (this.steps.length > 0) {
      const lastEl = this.steps[this.steps.length - 1];
      this.parentId = lastEl;
      this.steps.pop();
      const param = { parent: lastEl };
      this.getSubFolders(param);
    } else {
      this.isParent = true;
      this.getMainfolders();
      this.parentFolderName = '';
    }
  }
}
