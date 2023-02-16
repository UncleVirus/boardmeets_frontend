import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { ApiManagerService } from '../api-manager/api-manager.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SharedService } from '../shared.service';
import { UserPermissionDialog } from '../dialogs/permissions/permissions.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css'],
})
export class ResourcesComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  currentUserId = null;
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;
  displayedColumns: string[] = ['name', 'created'];
  isLoadingResults = false;
  parentId: any = null;
  loadData = false;
  docView = false;
  users: any = [];
  isVideo = false;
  permissionFoldersObj: any = [];
  folderDocumentsObj: any = [];
  parentFolderName = 'Folders';
  isParent = true;
  foldersObj: any = [];
  dataSource = new MatTableDataSource([]);
  docName = '';
  hasDocuments: boolean = false;

  constructor(
    private apiManager: ApiManagerService,
    private dialog: MatDialog,
    private _route: ActivatedRoute,
    private router: Router,
    private _location: Location,
    private shareService: SharedService
  ) {
    this._route.params.subscribe((params) => {
      if (params['folderId']) {
        this.loadFolders(params['folderId'], params['name']);
      } else {
        this.getMainfolders();
      }
    });
  }

  ngOnInit(): void {
    this._route.params.forEach((item) => {
      if (item.folderId) {
        this.loadFolders(item.folderId, item.name);
      } else {
        this.getMainfolders();
      }
    });

    const user = JSON.parse(this.sessionStorage.getItem('profile'));
    this.currentUserId = user?.id;

    this.getAllUsers();

    this.getPermissionFolders(this.currentUserId);
  }

  getAllUsers() {
    const obs = this.apiManager.getAllUsers();
    if (obs != null) {
      obs.subscribe(
        (response: any) => {
          this.users = response;
        },
        (error: any) => {
          console.log('error..', error);
        }
      );
    }
  }
  getMainfolders() {
    this.parentFolderName = 'Folders';
    const spinner = this.apiManager.startLoading();
    this.apiManager.getMainFolders().subscribe(
      (response: any) => {
        this.apiManager.stopLoading(spinner);
        this.isParent = true;
        if (response.length > 0) {
          this.foldersObj = response;
          this.hasDocuments = false;
          this.loadData = true;

          this.dataSource = new MatTableDataSource(response);
        }
      },
      (error) => {
        console.log('error', error);
        this.apiManager.stopLoading(spinner);
      }
    );
  }

  getPermissionFolders(user_id) {
    this.apiManager.getPermissionFolders(user_id).subscribe({
      next: (res) => {
        this.permissionFoldersObj = res;
      },
      error: (err) => console.log(err),
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onFilterResourcesChange(event) {
    if (event === 'Permission') {
      if (this.permissionFoldersObj?.length) {
        this.dataSource = new MatTableDataSource(this.permissionFoldersObj);
      } else return;
    } else {
      this.dataSource = new MatTableDataSource(this.foldersObj);
    }
  }

  openFolder(element: any) {
    this.router.navigate([
      '/admin/resources-page',
      {
        folderId: element.id,
        name: element.name,
      },
    ]);
  }

  createMainDialog(): void {
    const dialogRef = this.dialog.open(DialogCreateFolderDialog, {
      restoreFocus: false,
      width: '500px',
      data: { action: 'Create folder' },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.isParent = true;
        const param = {
          name: result.name,
          created_by: this.currentUserId,
        };
        this.createFolder(param);
      }
    });
  }

  createFolder(data: any) {
    this.apiManager.createFolder(data).subscribe(
      (response: any) => {
        if (this.isParent) {
          this.getMainfolders();
        } else {
          const param = { parent: this.parentId };
          this.getSubFolders(param);
        }
      },
      (error: any) => {
        console.log('error', error);
      }
    );
  }

  openPermissionDialog(data: any): void {
    const folderId = data.id;
    const dialogRef = this.dialog.open(UserPermissionDialog, {
      restoreFocus: false,
      width: '500px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      data: { users: this.users, title: 'Add permissions to folder' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const param = {
          permissions: result,
        };
        console.log(param);
        this.apiManager.updateFolder(folderId, param).subscribe(
          (response) => {
            console.log(response);
            if (this.isParent) {
              this.getMainfolders();
            } else {
              const params = { parent: this.parentId };
              this.getSubFolders(params);
            }
          },
          (error) => {
            console.log(error);
          }
        );
      }
    });
  }

  renameDocument(data: any) {
    const docId = data.id;
    const dialogRef = this.dialog.open(DialogCreateFolderDialog, {
      restoreFocus: false,
      width: '350px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      data: {
        name: data.doc_name,
        action: 'Rename Document',
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const param = {
          doc_name: result.name,
          doc_file: data.doc_file,
        };
        this.apiManager.updateDocumentInFolder(docId, param).subscribe(
          (response) => {
            console.log(response);
            this.getFolderDocuments(this.parentId);
          },
          (error) => {
            console.log(error);
          }
        );
      }
    });
  }

  renameFolder(data: any) {
    const folderId = data.id;
    const dialogRef = this.dialog.open(DialogCreateFolderDialog, {
      restoreFocus: false,
      width: '350px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      data: {
        name: data.name,
        action: 'Rename Folder',
      },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const param = {
          name: result.name,
        };
        this.apiManager.updateFolder(folderId, param).subscribe(
          (response) => {
            if (this.isParent) {
              this.getMainfolders();
            } else {
              const params = { parent: this.parentId };
              this.getSubFolders(params);
            }
          },
          (error) => {
            console.log(error);
          }
        );
      }
    });
  }

  deleteFolder(id: any) {
    if (id) {
      this.apiManager.deleteFolder(id).subscribe(
        (response: any) => {
          if (this.isParent) {
            this.getMainfolders();
          } else {
            const params = { parent: this.parentId };
            this.getSubFolders(params);
          }
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
  }

  deleteDocument(id: any) {
    if (id) {
      this.apiManager.deleteDocumentInFolder(id).subscribe(
        (response: any) => {
          if (this.isParent) {
            this.getMainfolders();
          } else {
            const params = { parent: this.parentId };
            this.getSubFolders(params);
          }
        },
        (error: any) => {
          console.log(error);
        }
      );
    }
  }

  openFile(file: any) {
    if (file.type === 'LINK') {
      window.open(file.doc_file, '_blank');
    } else if (file.type === 'FILE') {
      this.docView = true;
      this.docName = file.doc_name;
      this.shareService.doc_ref.next(file.doc_ref);
      this.shareService.DocumentToView.next(file.doc_file);
    } else {
      this.shareService.DocumentToView.next(file.doc_file);
      this.isVideo = true;
    }
  }

  getFolderDocuments(data: any) {
    this.folderDocumentsObj = [];
    const spinner = this.apiManager.startLoading(
      'Fetching files, please wait...'
    );
    this.apiManager.getDocumentsInFolder(data).subscribe(
      (response: any) => {
        this.apiManager.stopLoading(spinner);
        if (response.length > 0) {
          this.hasDocuments = true;
          this.folderDocumentsObj = response;
          console.log(response);
        } else this.hasDocuments = false;
      },
      (error) => {
        this.apiManager.stopLoading(spinner);
        console.log(error);
      }
    );
  }

  createSubFolderDialog(): void {
    const dialogRef = this.dialog.open(DialogCreateFolderDialog, {
      restoreFocus: false,
      width: '350px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      data: { action: 'Create sub folder' },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const param = {
          name: result.name,
          parent: this.parentId,
          created_by: this.currentUserId,
        };
        console.log(param);
        this.createFolder(param);
      }
    });
  }

  getSubFolders(data: any) {
    const spinner = this.apiManager.startLoading();
    this.apiManager.getSubFolders(data).subscribe(
      (response: any) => {
        this.getFolderDocuments(this.parentId);
        this.apiManager.stopLoading(spinner);
        if (response.length > 0) {
          this.loadData = true;
          this.dataSource = new MatTableDataSource(response);
        } else {
          this.loadData = false;
        }
      },
      (error: any) => {
        this.apiManager.stopLoading(spinner);
        console.log(error);
      }
    );
  }

  createFileDialog(): void {
    const dialogRef = this.dialog.open(DialogCreateFileDialog, {
      restoreFocus: false,
      width: '350px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      data: { id: this.parentId, user: this.currentUserId },
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const spiner = this.apiManager.startLoading(
          'Uploading..., this may take a while.'
        );
        this.apiManager.createDocumentInFolder(result).subscribe(
          (response) => {
            this.getFolderDocuments(this.parentId);
            this.apiManager.stopLoading(spiner);
          },
          (error) => {
            console.log(error);
            this.apiManager.stopLoading(spiner);
          }
        );
      }
    });
  }

  loadFolders(folderId, name) {
    this.isParent = false;
    this.parentId = folderId;
    this.parentFolderName = name;
    const param = { parent: this.parentId };
    this.getSubFolders(param);
  }
}

@Component({
  selector: 'dialog-create-folder-dialog',
  templateUrl: 'dialog-create-folder-dialog.html',
  styleUrls: ['./resources.component.css'],
})
export class DialogCreateFolderDialog {
  formGroup: FormGroup;
  formGroup2: FormGroup;
  title = '';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogCreateFolderDialog>,
    private formBwilder: FormBuilder
  ) {}

  ngOnInit() {
    this.title = this.data?.action;
    this.createForms();
  }
  createForms() {
    this.formGroup = this.formBwilder.group({
      name: [this.data?.name || '', [Validators.required]],
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit(data: any) {
    this.dialogRef.close(data);
  }
}

@Component({
  selector: 'dialog-create-file-dialog',
  templateUrl: 'dialog-create-file-dialog.html',
  styleUrls: ['./resources.component.css'],
})
export class DialogCreateFileDialog {
  formGroup: FormGroup;
  files: File[] = [];
  doc_fle = '';
  fileUrl = '';
  fileType = 'FILE';
  folderId: any = '';
  created_by = '';
  isFile = false;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogCreateFileDialog>,
    private formBwilder: FormBuilder
  ) {}

  ngOnInit() {
    this.folderId = this.data.id;
    this.created_by = this.data.user;
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBwilder.group({
      doc_name: ['', [Validators.required]],
      type: ['LINK', [Validators.required]],
      folder_id: [this.folderId, [Validators.required]],
      doc_ref: [
        'resource' +
          (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1),
      ],
      doc_file: [''],
      created_by: [this.created_by, [Validators.required]],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(data: any) {
    if (this.isFile) {
      if (this.fileUrl) {
        const param = {
          doc_name: data.doc_name,
          type: this.fileType,
          folder_id: this.folderId,
          doc_file: this.fileUrl,
          doc_ref: data.doc_ref,
          created_by: this.created_by,
        };
        this.dialogRef.close(param);
      } else return;
    } else {
      this.dialogRef.close(data);
    }
  }

  channgeFileType(data: any) {
    this.fileType = data;
    if (data !== 'LINK') this.isFile = true;
    else this.isFile = false;
  }

  //add attachment
  onSelect(event: any) {
    this.files.push(...event.addedFiles);
    if (this.files[0]) {
      const file = this.files[0];
      this.doc_fle = file.name;

      this.changeFile(file).then((fileBlob: string): any => {
        this.fileUrl = fileBlob;
        console.log(this.doc_fle, this.fileUrl);
      });
    }
    return;
  }
  //remove attachment
  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
    this.fileUrl = '';
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
}
