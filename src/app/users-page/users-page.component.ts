import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';

import { Fade } from '../animations';
import { ApiManagerService } from '../api-manager/api-manager.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-users-page',
  templateUrl: './users-page.component.html',
  styleUrls: ['./users-page.component.css'],
  animations: [Fade],
})
export class UsersPageComponent implements OnInit, AfterViewInit {
  userId: any;
  users: any = [];
  value = '';
  departments: any = [];
  allGroupsObj: any = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = [
    'profile',
    'first_name',
    'email',
    'org_permission',
    'phone_number',
  ];
  dataSource: any = new MatTableDataSource([]);
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private apiManager: ApiManagerService,
    public snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.getAllUsers();
    this.getAllGroups();
    this.getDepartments();
  }

  getAllUsers() {
    const spinner = this.apiManager.startLoading('Looading users .....');
    this.apiManager.getAllUsers().subscribe(
      (response: any) => {
        this.users = response;
        this.dataSource = new MatTableDataSource(response);

        console.log(response);

        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
        this.apiManager.stopLoading(spinner);
      },
      (error) => this.apiManager.stopLoading(spinner)
    );
  }

  getDepartments() {
    this.apiManager.getDepartments().subscribe({
      next: (res) => {
        this.departments = res;
        console.log(res);
      },
      error: (err) => console.log(err),
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editUserDialog(data): void {
    const param = {
      user: data,
      groups: this.allGroupsObj,
    };
    const dialogRef = this.dialog.open(DialogEditUserDialog, {
      restoreFocus: false,
      width: '500px',
      panelClass: ['animate__animated', 'animate__slideInRight'],
      height: '100vh',
      position: {
        bottom: '0px',
        right: '0px',
      },
      data: param,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.openSnackBar(result, 'Ok');
        this.getAllUsers();
      }
    });
  }

  registerUserDialog(): void {
    const dialogRef = this.dialog.open(DialogRegisterUserDialog, {
      restoreFocus: false,
      width: '500px',
      height: '100vh',
      panelClass: ['animate__animated', 'animate__slideInRight'],
      position: {
        bottom: '0px',
        right: '0px',
      },
      data: this.allGroupsObj,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.openSnackBar(result, 'Close');
        this.getAllUsers();
      }
    });
  }

  deleteUser(user): void {
    this.userId = user.id;

    this.apiManager.deleteUser(this.userId).subscribe(
      (response: any) => {
        this.openSnackBar('User deleted sucessfull', 'Close');
        this.getAllUsers();
      },
      (error) => console.log(error)
    );
  }
  deleteDepartment(dep_id) {
    this.apiManager.deleteDepartment(dep_id).subscribe({
      next: (res) => {
        this.openSnackBar('Department deleted sucessfull', 'Close');
        this.getDepartments();
      },
      error: (err) => console.log(err),
    });
  }
  editGroupDialog(data) {
    const dialogRef = this.dialog.open(DialogEditUserGroupDialog, {
      restoreFocus: false,
      width: '500px',
      height: '100vh',
      panelClass: ['animate__animated', 'animate__slideInRight'],
      position: {
        bottom: '0px',
        right: '0px',
      },
      data: data,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllGroups();
        this.openSnackBar(result, 'Ok');
      }
    });
  }

  addGroupDialog() {
    const dialogRef = this.dialog.open(DialogAddUserGroupDialog, {
      restoreFocus: false,
      width: '350px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      data: {},
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getAllGroups();
      }
    });
  }

  CreateDepartmentDialog() {
    const dialogRef = this.dialog.open(CreateDepartmentDialog, {
      restoreFocus: false,
      width: '350px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      data: {},
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getDepartments();
      }
    });
  }

  getAllGroups() {
    this.apiManager.getAllUserGroups().subscribe({
      next: (res) => {
        this.allGroupsObj = res;
        console.log(res);
      },
      error: (err) => console.log(err),
    });
  }

  deleteGroupDialog(id) {
    this.apiManager.deleteUserGroup(id).subscribe({
      next: (res) => this.getAllGroups(),
    });
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}

@Component({
  selector: 'dialog-register-user-dialog',
  templateUrl: 'dialog-register-user-dialog.html',
  styleUrls: ['./users-page.component.css'],
})
export class DialogRegisterUserDialog implements OnInit {
  userForm: FormGroup;
  groups = [];
  loading = false;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogRegisterUserDialog>,
    private apiManager: ApiManagerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.groups = this.data;
    this.createForm();
  }
  createForm() {
    this.userForm = this.fb.group({
      email: ['', Validators.required],
      last_name: ['', [Validators.required]],
      first_name: ['', [Validators.required]],
      password: ['', [Validators.required]],
      org_permission: ['Member', [Validators.required]],
      org_groups: ['', [Validators.required]],
      org_reference_key: ['PVT-001', [Validators.required]],
    });
  }

  OnSubmit(data: any) {
    this.loading = true;
    this.apiManager.registerUser(data).subscribe({
      next: (res) => {
        console.log(res);
        this.loading = false;
        this.dialogRef.close('User added successfull');
      },
      error: (err) => {
        this.loading = false;
        console.log(err);
      },
    });
  }
}

@Component({
  selector: 'dialog-edit-user-dialog',
  templateUrl: 'dialog-edit-user-dialog.html',
  styleUrls: ['./users-page.component.css'],
})
export class DialogEditUserDialog implements OnInit {
  userForm: FormGroup;
  groups: any = [];
  user: any = {};
  loading = false;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogEditUserDialog>,
    private apiManager: ApiManagerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    console.log(this.data);
    this.groups = this.data.groups;
    this.user = this.data.user;

    this.createForm();
  }
  createForm() {
    this.userForm = this.fb.group({
      email: [this.user.email, Validators.required],
      org_groups: [
        this.getUserIds(this.user.org_groups),
        [Validators.required],
      ],
      last_name: [this.user.last_name, [Validators.required]],
      first_name: [this.user.first_name, [Validators.required]],
      phone_no: [this.user.phone_no, [Validators.required]],
      twofa_status: [this.user.twofa_status, [Validators.required]],
      org_permission: [this.user.org_permission, [Validators.required]],
      org_reference_key: [
        this.user.org_reference_key || 'PVT-001',
        [Validators.required],
      ],
      is_active: [this.user.is_active, [Validators.required]],
    });
  }
  OnSubmit(data: any) {
    console.log(data);
    const user_id = this.user.id;
    this.loading = true;
    this.apiManager.updateUser(user_id, data).subscribe({
      next: (res) => {
        this.loading = false;
        this.dialogRef.close('User updated successfull');
      },
      error: (err) => {
        this.loading = false;
        console.log(err);
      },
    });
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
  selector: 'dialog-add-group-user-dialog',
  templateUrl: 'dialog-add-group-user-dialog.html',
  styleUrls: ['./users-page.component.css'],
})
export class DialogAddUserGroupDialog implements OnInit {
  formGroup: FormGroup;
  loading = false;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogAddUserGroupDialog>,
    private apiManager: ApiManagerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      group_name: ['', Validators.required],
      group_description: [''],
    });
  }
  OnSubmit(data: any) {
    console.log(data);
    this.loading = true;
    this.apiManager.addUserGroup(data).subscribe({
      next: (res) => {
        this.loading = false;
        this.dialogRef.close('Group created successfull');
      },
      error: (err) => {
        this.loading = false;
        console.log(err);
      },
    });
  }
}

@Component({
  selector: 'dialog-create-deppartment-dialog',
  templateUrl: 'dialog-create-deppartment-dialog.html',
  styleUrls: ['./users-page.component.css'],
})
export class CreateDepartmentDialog implements OnInit {
  formGroup: FormGroup;
  loading = false;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateDepartmentDialog>,
    private apiManager: ApiManagerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      department_name: ['', Validators.required],
      department_head: ['', Validators.required],
    });
  }
  OnSubmit(data: any) {
    console.log(data);
    this.loading = true;
    this.apiManager.createDepartment(data).subscribe({
      next: (res) => {
        this.loading = false;
        this.dialogRef.close('Department created successfull');
      },
      error: (err) => {
        this.loading = false;
        console.log(err);
      },
    });
  }
}

@Component({
  selector: 'dialog-edit-group-user-dialog',
  templateUrl: 'dialog-edit-group-user-dialog.html',
  styleUrls: ['./users-page.component.css'],
})
export class DialogEditUserGroupDialog implements OnInit {
  formGroup: FormGroup;
  loading = false;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogEditUserGroupDialog>,
    private apiManager: ApiManagerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      group_name: [this.data?.group_name, Validators.required],
      group_description: [this.data?.group_description || ''],
    });
  }
  OnSubmit(data: any) {
    const group_id = this.data?.id;
    this.loading = true;
    this.apiManager.updateUserGroup(group_id, data).subscribe({
      next: (res) => {
        this.loading = false;
        this.dialogRef.close('Group updated successfull');
      },
      error: (err) => {
        this.loading = false;
        console.log(err);
      },
    });
  }
}

@Component({
  selector: 'dialog-delete-user-dialog',
  templateUrl: 'dialog-delete-user-dialog.html',
  styleUrls: ['./users-page.component.css'],
})
export class DialogDeleteUserDialog implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DialogDeleteUserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  onSubmit() {
    this.dialogRef.close('yes');
  }
}
