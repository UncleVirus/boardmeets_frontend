import { Component, OnInit } from '@angular/core';
import {Location} from "@angular/common";
import {ApiManagerService} from "../../api-manager/api-manager.service";
import {DialogEditAgendaItemDialog} from "../../meeting/meeting-view/meeting-view.component";
import {SharedService} from "../../shared.service";
import {MatDialog} from "@angular/material/dialog";
import {Router} from "@angular/router";

@Component({
  selector: 'app-meeting-agenda-openbook',
  templateUrl: './meeting-agenda-openbook.component.html',
  styleUrls: ['./meeting-agenda-openbook.component.css']
})
export class MeetingAgendaOpenbookComponent implements OnInit {
  users: any = [];
  sessionStorage = window.sessionStorage;
  showZoomWindow = false;
  meeting_id: any = '';
  items: any = [];
  meetingObj: any = {};
  currentUser: any = {};
  viewAgendaDoc = false;
  show = true;


  constructor( public _location: Location,
               private apiManager: ApiManagerService,
               private dialog: MatDialog,
               private router : Router,
               private sharedService: SharedService) {
    // console.log(this.router.getCurrentNavigation().extras.state.meeting_id);
    this.meeting_id = this.router.getCurrentNavigation().extras.state.meeting_id;
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(this.sessionStorage.getItem('profile'));
    this.getAgendaItems();
  }

  getAgendaItems() {
    const meeting_id = this.meetingObj.id;

    this.apiManager.getMeetingAgendas(this.meeting_id).subscribe({
      next: (res: any) => {
        this.items = this.convertItemsToHyrchy(res);
        console.log('items', this.items);
      },
      error: (err) => console.log(err),
    });
  }

  convertItemsToHyrchy(arr) {
    let map = {},
      node,
      res = [],
      i;

    for (i = 0; i < arr.length; i += 1) {
      map[arr[i].id] = i;
      arr[i].childreen = [];
    }
    for (i = 0; i < arr.length; i += 1) {
      node = arr[i];
      if (node.parent_item) {
        arr[map[node.parent_item]]?.childreen.push(node);
      } else {
        res.push(node);
      }
    }

    return res;
  }

  romanize(num) {
    var lookup = {
        M: 1000,
        CM: 900,
        D: 500,
        CD: 400,
        C: 100,
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1,
      },
      roman = '',
      i;
    for (i in lookup) {
      while (num >= lookup[i]) {
        roman += i;
        num -= lookup[i];
      }
    }
    return roman;
  }

  openAgendaDocument(item: any) {
    this.sharedService.doc_ref.next(item.doc_ref);
    this.sharedService.DocumentToView.next(item.agenda_document);
    this.viewAgendaDoc = true;
  }

  editItemDetailsDialog(item) {
    const data = {
      users: this.users,
      agenda: item,
    };
    const dialogRef = this.dialog.open(DialogEditAgendaItemDialog, {
      restoreFocus: false,
      width: '500px',
      panelClass: ['animate__animated', 'animate__fadeInRight'],
      height: '100vh',
      position: {
        bottom: '0px',
        right: '0px',
      },
      data: data,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getAgendaItems();
      }
    });
  }

  leterize(num) {
    var letter = String.fromCharCode(num + 64);
    return letter;
  }

}
