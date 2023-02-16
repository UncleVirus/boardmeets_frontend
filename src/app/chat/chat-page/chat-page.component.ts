import {
  Component,
  OnDestroy,
  ElementRef,
  ViewChild,
  OnInit,
  Inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { map, shareReplay, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { ChatService } from '../service/chat.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialog,
} from '@angular/material/dialog';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';
import { SharedService } from 'src/app/shared.service';
import { Location } from '@angular/common';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ChatPageComponent implements OnInit, OnDestroy {
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
  users: any = [];
  activeChatsObj: any = [];
  formGroup: FormGroup;
  chat_id: any = null;
  activeChat = false;
  singleChatObj: any = {};
  value = '';
  show = true;
  messages: any = [];
  sessionStorage = window.sessionStorage;

  currentUser: any = {};
  author = '';
  authorName = '';
  constructor(
    public webSocketService: ChatService,
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    public _location: Location,
    private apiManager: ApiManagerService,
    private breakpointObserver: BreakpointObserver,
    private sharedService: SharedService
  ) {
    this._route.params.subscribe((params) => {
      if (params['data']) {
        this.connectToNewChat(params['data']);
      }
    });
  }

  ngOnInit(): void {
    this.setupData();
    this.getChats();
    this.getUsers();
    this.createForm();
  }
  setupData() {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.author = this.currentUser?.id;
    this.authorName = this.currentUser?.username;
  }
  connectWebSocket() {
    this.webSocketService.connect(this.chat_id, this.author);
  }

  getChats() {
    const spinner = this.apiManager.startLoading();
    this.show = false;
    this.apiManager.getChats(this.author).subscribe({
      next: (res: any) => {
        this.apiManager.stopLoading(spinner);
        this.show = true;
        this.activeChatsObj = res;
        console.log('res', res);
      },
      error: (err: any) => {
        this.apiManager.stopLoading(spinner);
        this.show = true;
        console.log(err);
      },
    });
  }
  startChat(chatObj) {
    const id = chatObj.id;
    this.router.navigate([
      '/admin/chat-page',
      {
        data: this.sharedService.encryptData(chatObj),
      },
    ]);
  }
  connectToNewChat(data: any) {
    this.setupData();
    this.singleChatObj = this.sharedService.decryptData(data);
    this.chat_id = this.singleChatObj.id;
    this.connectWebSocket();
    this.activeChat = true;
    if (this.activeChat === true) this.gotoBottom;
  }

  getUsers() {
    this.apiManager.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  createForm() {
    this.formGroup = this.fb.group({
      content: ['', Validators.required],
    });
  }

  sendMessage(data) {
    const param = {
      content: data.content,
      from: this.author,
      chat_id: this.chat_id,
    };
    this.webSocketService.newChatMessage(param);
    this.formGroup.reset();
    this.gotoBottom();
  }

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
  }

  createPrivateChatDialog(): void {
    const dialogRef = this.dialog.open(DialogCreatePrivateChatDialog, {
      restoreFocus: false,
      minWidth: '400px',
      panelClass: ['animate__animated', 'animate__slideInRight'],
      height: '100vh',
      position: {
        bottom: '0px',
        right: '0px',
      },
      data: this.users,
    });
    dialogRef.afterClosed().subscribe((new_chat: any) => {
      if (new_chat) {
        this.chat_id = new_chat?.id;
        this.getChats();
        this.singleChatObj = new_chat;
        this.activeChat = true;
        this.connectWebSocket();
      }
    });
  }

  createGroupChatDialog(): void {
    const dialogRef = this.dialog.open(DialogCreateGroupChatDialog, {
      restoreFocus: false,
      width: '400px',
      panelClass: ['animate__animated', 'animate__slideInRight'],
      height: '100vh',
      position: {
        bottom: '0px',
        right: '0px',
      },
      data: this.users,
    });
    dialogRef.afterClosed().subscribe((new_chat: any) => {
      if (new_chat) {
        this.chat_id = new_chat?.id;
        this.getChats();
        this.singleChatObj = new_chat;
        this.activeChat = true;
        this.connectWebSocket();
      }
    });
  }

  renderTimeStamp(timestamp) {
    let prefix = '';
    const timeDiff = Math.round(
      (new Date().getTime() - new Date(timestamp).getTime()) / 60000
    );
    if (timeDiff < 1) {
      // less than one minute ago
      prefix = 'just now...';
    } else if (timeDiff < 60 && timeDiff > 1) {
      // less than sixty minutes ago
      prefix = `${timeDiff} minutes ago`;
    } else if (timeDiff < 24 * 60 && timeDiff > 60) {
      // less than 24 hours ago
      prefix = `${Math.round(timeDiff / 60)} hours ago`;
    } else if (timeDiff < 31 * 24 * 60 && timeDiff > 24 * 60) {
      // less than 7 days ago
      prefix = `${Math.round(timeDiff / (60 * 24))} days ago`;
    } else {
      prefix = `${new Date(timestamp)}`;
    }
    return prefix;
  }

  gotoBottom() {
    var element = document.getElementById('scrollMessages');
    element.scrollTop = element.scrollHeight - element.clientHeight;
  }
}

@Component({
  selector: 'dialog-create-chat-dialog',
  templateUrl: 'dialog-create-chat-dialog.html',
  styleUrls: ['./chat-page.component.scss'],
})
export class DialogCreateGroupChatDialog {
  users: any = [];
  participants: any = [];
  title = '';
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  fruitCtrl = new FormControl();
  filteredFruits: Observable<any[]>;
  fruits: any = [];
  allFruits: any = [];
  sessionStorage = window.sessionStorage;
  groupName: string = '';
  currentUser: any = {};
  author: any = '';
  @ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogCreateGroupChatDialog>,
    private apiManager: ApiManagerService
  ) {
    this.filteredFruits = this.fruitCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: any | null) =>
        fruit ? this._filter(fruit) : this.allFruits.slice()
      )
    );
  }

  ngOnInit() {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.author = this.currentUser?.id;
    this.participants.push(this.author);
    this.allFruits = this.data;
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value) {
      this.fruits.push(value);
    }
    // Clear the input value
    event.chipInput!.clear();
    this.fruitCtrl.setValue(null);
  }

  remove(fruit: any): void {
    for (var i = 0; i < this.fruits?.length; i++) {
      if (this.fruits[i]?.id === fruit.id) {
        this.fruits.splice(i, 1);
        i--;
      }
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.fruits.push(event.option.value);
    this.fruitInput.nativeElement.value = '';
    this.fruitCtrl.setValue(null);
  }

  private _filter(value: any): any[] {
    return this.allFruits.filter((fruit) => fruit);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  onSubmit() {
    if (this.fruits.length <= 0) {
      return;
    }
    this.fruits.forEach((element) => {
      if (element.id) {
        var index = this.participants.findIndex((id) => id == element?.id);
        if (index === -1) {
          this.participants.push(element.id);
        }
      }
    });
    const param = {
      chat_title: this.groupName,
      participants: this.participants,
      is_group: true,
      created_by: this.author,
    };
    this.apiManager.CreateChat(param).subscribe({
      next: (res: any) => {
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}

@Component({
  selector: 'dialog-create-private-chat-dialog',
  templateUrl: 'dialog-create-private-chat-dialog.html',
  styleUrls: ['./chat-page.component.scss'],
})
export class DialogCreatePrivateChatDialog {
  sessionStorage = window.sessionStorage;
  currentUser: any = {};
  author: any = '';
  participant: any = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogCreatePrivateChatDialog>,
    private apiManager: ApiManagerService
  ) {}
  ngOnInit() {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.author = this.currentUser?.id;
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  onChange(event) {
    this.participant = event.option.value;
  }
  onSubmit() {
    if (this.participant && this.participant !== this.author) {
      const friends = [this.author, this.participant];
      const param = {
        participants: friends,
        is_group: false,
        created_by: this.author,
      };

      this.apiManager.CreateChat(param).subscribe({
        next: (res: any) => {
          this.dialogRef.close(res);
        },
        error: (err: any) => console.log(err),
      });
    } else return;
  }
}
