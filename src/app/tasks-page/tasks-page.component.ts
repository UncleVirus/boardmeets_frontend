import { Component, Inject, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable, startWith } from 'rxjs';
import { ApiManagerService } from '../api-manager/api-manager.service';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-tasks-page',
  templateUrl: './tasks-page.component.html',
  styleUrls: ['./tasks-page.component.css'],
})
export class TasksPageComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  currentUser: any = {};
  title = 'All tasks';
  allTasksObj: any = [];
  docView = false;
  meetingsObj: any = [];
  filter = false;
  activeTaskUser: any = {};
  filteredTask: any = [];
  users: any = [];
  task: any = {};
  PERIORITY: String[] = ['Normal', 'Important', 'Inprogress', 'Urgent'];
  STATUS: string[] = ['New', 'Inprogress', 'Completed', 'Overdue'];
  selectedValue = '';
  isStatus = false;
  assignedTaskObj: any = [];
  myControl = new FormControl();
  options: any[] = [];
  filteredOptions: Observable<any[]>;
  constructor(
    public matDialog: MatDialog,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    public apiManager: ApiManagerService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.getAllTasks();
    this.getTaskByAssignee();
    this.getAllUsers();
    this.getActiveMeetings();
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  private _filter(value: string): any[] {
    const filterValue = value?.toLowerCase();

    return this.options.filter(
      (option) =>
        option?.first_name.toLowerCase().includes(filterValue) ||
        option?.last_name.toLowerCase().includes(filterValue)
    );
  }

  getTaskByAssignee() {
    const user_id = this.currentUser?.id;
    this.apiManager.getTaskByAssignee(user_id).subscribe(
      (res: any) => {
        this.assignedTaskObj = res;
        console.log(this.assignedTaskObj);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getTasksByStatus(status) {
    this.selectedValue = '';
    this.apiManager.getTasksByStatus(status).subscribe({
      next: (res: any) => {
        if (res.length > 0) {
          this.filteredTask = res;
          this.title = `All ${status} tasks.`;
          this.filter = true;
        }
        console.log('status', res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getTasksByPeriority(periority) {
    this.selectedValue = '';
    this.apiManager.getTasksByPeriority(periority).subscribe({
      next: (res: any) => {
        if (res.length > 0) {
          this.filteredTask = res;
          this.title = `All ${periority} tasks.`;
          this.filter = true;
        }
        console.log('periority', res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  onFilterChange(ev) {
    const statusLabel: string = 'Task status';
    const selectedIndex = ev.target.selectedIndex;
    const optGroupLabel =
      ev.target.options[selectedIndex].parentNode.getAttribute('label');
    if (statusLabel.includes(optGroupLabel)) {
      this.selectedValue = ev.target.value;
      this.isStatus = true;
    } else {
      this.selectedValue = ev.target.value;
      this.isStatus = false;
    }
  }

  getUserTasksByUserId(user) {
    console.log('id', user);
    this.apiManager.getTaskByAssignee(user?.id).subscribe(
      (res: any) => {
        if (res.length > 0) {
          this.filter = true;
          this.filteredTask = res;
          this.title = `All tasks assigned to ${user.first_name} ${user.last_name}`;
        } else {
          this.filter = false;
        }
        this.myControl.reset();
        this.activeTaskUser = {};
      },
      (err) => {
        console.log(err);
      }
    );
  }

  getActiveMeetings() {
    this.apiManager.getActiveMeetings().subscribe(
      (resp: any) => {
        this.meetingsObj = resp;
      },
      (error) => console.log(error)
    );
  }
  getAllUsers() {
    this.apiManager.getAllUsers().subscribe(
      (res: any) => {
        this.users = res;
        this.options = res;
      },
      (error) => console.log(error)
    );
  }

  createTaskDialog(): void {
    const data = {
      meeting: this.meetingsObj,
      users: this.users,
    };
    const dialogRef = this.dialog.open(CreateTaskDialog, {
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
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getTaskByAssignee();
        this.getAllTasks();
      }
    });
  }
  manageTaskDialog(task: any): void {
    this.task = task;
    const dialogRef = this.dialog.open(ManageTaskDialog, {
      restoreFocus: false,
      width: '500px',
      panelClass: ['animate__animated', 'animate__slideInRight'],
      height: '100vh',
      position: {
        bottom: '0px',
        right: '0px',
      },
      data: this.task,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        if (result === 'doc') {
          this.docView = true;
        } else this.getAllTasks();
      }
    });
  }
  getAllTasks() {
    const spinner = this.apiManager.startLoading('Loading tasks....');
    this.apiManager.getAllTasks().subscribe(
      (response: any) => {
        this.allTasksObj = response;
        console.log('response', response);
        this.apiManager.stopLoading(spinner);
      },
      (err) => {
        this.apiManager.stopLoading(spinner);
        console.log(err);
      }
    );
  }

  deleteTask(task_id: any) {
    this.apiManager.deleteTaskById(task_id).subscribe(
      (resp) => {
        console.log(resp);
        this.getAllTasks();
      },
      (error) => console.log(error)
    );
  }

  onClose() {
    this.docView = false;
    this.manageTaskDialog(this.task);
  }
}

@Component({
  selector: 'app-create-task-modal',
  templateUrl: './create-task.html',
  styleUrls: ['./tasks-page.component.css'],
})
export class CreateTaskDialog implements OnInit {
  sessionStorage = window.sessionStorage;
  task_document: any = '';
  organizationID = '';
  currentUser: any = {};
  formGroup: FormGroup;
  organizations: any = [];
  meetingsObj: any = [];
  users: any = [];
  loading = false;
  enableAttachmentView = false;
  files: File[] = [];
  fileUrl = '';
  sendemail: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CreateTaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackBar: MatSnackBar,
    private apiManager: ApiManagerService,
    private formBwilder: FormBuilder
  ) {}

  ngOnInit() {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.meetingsObj = this.data?.meeting;
    this.users = this.data?.users;
    this.createForm();
  }

  createForm() {
    this.formGroup = this.formBwilder.group({
      task_name: ['', [Validators.required]],
      task_description: ['', [Validators.required]],
      task_assignee: ['', [Validators.required]],
      task_viewer: [''],
      created_by: [this.currentUser?.id],
      meeting: [''],
      task_status: ['New'],
      completion_date: ['', [Validators.required]],
      task_priority: ['', [Validators.required]],
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(data: any) {
    this.loading = true;
    data['sendEmail'] = this.sendemail;
    if (this.fileUrl) {
      data['task_document'] = this.fileUrl;
    }
    this.apiManager.createTask(data).subscribe(
      (response: any) => {
        this.loading = false;
        if (response) {
          this.openSnackBar('Task created successful', 'CLOSE');
          this.dialogRef.close(response);
        }
      },
      (error: any) => {
        this.loading = false;
        this.openSnackBar('Details: Something went wrong', 'CLOSE');
        console.log('..................', error);
      }
    );
  }

  enableSendEmail() {
    if (this.sendemail === false) this.sendemail = true;
    else this.sendemail = false;
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

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}

@Component({
  selector: 'app-manage-task-modal',
  templateUrl: './manage-task.html',
  styleUrls: ['./tasks-page.component.css'],
})
export class ManageTaskDialog implements OnInit {
  sessionStorage = window.sessionStorage;
  currentUser: any = {};
  users: any = [];
  taskCommentsObj: any = [];
  loading = false;
  docView = false;
  enableAtFormView = false;
  files: File[] = [];
  message = '';
  task: any = {};

  constructor(
    public dialogRef: MatDialogRef<ManageTaskDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackBar: MatSnackBar,
    private apiManager: ApiManagerService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.task = this.data;
    this.getCommentsByTask();
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
  }
  getCommentsByTask() {
    this.apiManager.getCommentsByTask(this.task.id).subscribe(
      (resp) => {
        this.message = '';
        this.taskCommentsObj = resp;
        console.log(this.taskCommentsObj);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  sendMessage() {
    if (this.message) {
      const param = {
        task: this.task.id,
        commentor: this.currentUser.id,
        comment: this.message,
      };
      console.log(param);
      this.apiManager.createComment(param).subscribe(
        (resp) => {
          this.getCommentsByTask();
          this.openSnackBar('Message sent', 'Close');
        },
        (error) => console.log(error)
      );
    }
  }

  openDocument(doc: any) {
    this.sharedService.doc_ref.next(this.task?.doc_ref);
    this.sharedService.DocumentToView.next(doc);
    this.dialogRef.close('doc');
  }

  updateTask(data: any) {
    const param = {};
    param['task_status'] = data;
    console.log(param);
    this.apiManager.updateTaskById(this.data.id, param).subscribe(
      (resp) => {
        this.loading = false;
        this.data = resp;
      },
      (error) => {
        this.loading = false;
        console.log(error.error?.message);
        this.openSnackBar(error.error?.message, 'Close');
      }
    );
  }

  deleteComment(comment_id) {
    this.apiManager.deleteComment(comment_id).subscribe(
      (resp: any) => {
        console.log(resp);
        this.openSnackBar(resp.message, 'Close');
        this.getCommentsByTask();
      },
      (err) => console.log(err)
    );
  }

  goToMeeting(meeting) {
    const path = '/admin/meeting-view-page';
    const param = {
      meeting: this.sharedService.encryptData(meeting),
    };
    this.dialogRef.close();
    this.sharedService.navigaTo(path, param);
  }

  enableForm() {
    if (this.enableAtFormView === false) this.enableAtFormView = true;
    else this.enableAtFormView = false;
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}
