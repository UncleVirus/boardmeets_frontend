import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatListOption } from '@angular/material/list';

@Component({
  selector: 'app-permissions',
  templateUrl: './permissions.component.html',
  styleUrls: ['./permissions.component.css'],
})
export class UserPermissionDialog implements OnInit {
  users: any = [];
  title = '';
  selectedUsers: any = [];
  constructor(
    public dialogRef: MatDialogRef<UserPermissionDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.users = this.data.users;
    this.title = this.data.title;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onGroupsChange(options: MatListOption[]) {
    this.selectedUsers = options.map((o) => o.value);
  }

  onSubmit(data) {
    this.dialogRef.close(data);
  }
}
