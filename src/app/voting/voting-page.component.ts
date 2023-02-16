import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Location } from '@angular/common';
import { Fade } from './../animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatListOption } from '@angular/material/list';
import { ApiManagerService } from './../api-manager/api-manager.service';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-voting-page',
  templateUrl: './voting-page.component.html',
  styleUrls: ['./voting-page.component.css'],
  animations: [Fade],
})
export class VotingPageComponent implements OnInit {
  formGroup: FormGroup;
  votingDetails: any = {};
  dataSource: any = [];
  enableAttachmentView = false;
  attachment_name = '';
  loading = false;
  hasAttachment: boolean = false;
  votersObj: any;
  votesDetailsObj: any = [];
  voteResultObj: any = {};
  viewMeetingDoc = false;
  currentUser: any = {};
  constructor(
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private _location: Location,
    public snackBar: MatSnackBar,
    private apiManager: ApiManagerService,
    private _route: ActivatedRoute
  ) {
    this._route.params.subscribe((params) => {
      if (params['voting']) {
        this.votingDetails = this.sharedService.decryptData(params['voting']);
      } else this._location.back();
    });
  }

  ngOnInit(): void {
    if (!this.votingDetails.id) this.back();
    console.log(this.votingDetails);
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.getVotesAnalytics(this.votingDetails.id);
    this.getVotesDetailsByQuestion(this.votingDetails.id);
  }

  back() {
    this._location.back();
  }

  getVotesDetailsByQuestion(questionId) {
    this.apiManager.getVotesDetailsByQuestion(questionId).subscribe(
      (response) => {
        this.votesDetailsObj = response;
        console.log(this.votesDetailsObj);
      },
      (error) => console.log(error)
    );
  }

  getVotesAnalytics(questionId) {
    this.apiManager.getVotesAnalytics(questionId).subscribe(
      (response) => {
        this.voteResultObj = response;
      },
      (error) => console.log(error)
    );
  }

  openDocumentViewPage(doc: any) {
    this.sharedService.doc_ref.next(this.votingDetails?.doc_ref);
    this.sharedService.DocumentToView.next(doc);
    this.viewMeetingDoc = true;
  }
  closeDocView() {
    this.viewMeetingDoc = false;
  }

  setTitle(title: any) {
    this.sharedService.sendTitleEvent(title);
  }

  voteApproval(voteType) {
    const param = {
      voter: this.currentUser?.id,
      voting_question: this.votingDetails.id,
      vote: voteType,
    };
    const spinner = this.apiManager.startLoading('Voting....');
    this.apiManager.questionVote(param).subscribe(
      (res: any) => {
        this.apiManager.stopLoading(spinner);
        if (res.status === 'Failed') {
          this.openSnackBar(res.Message, 'Close');
        } else {
          this.openSnackBar('you voted successful', 'Close');
          this.getVotesAnalytics(this.votingDetails.id);
          this.getVotesDetailsByQuestion(this.votingDetails.id);
        }
      },
      (err) => {
        this.apiManager.stopLoading(spinner);
        console.log(err);
      }
    );
  }

  updateVote(data: any, id: any) {
    const params = {
      question: this.formGroup.value.question,
      vote_start_date: this.formGroup.value.vote_start_date,
      expiry_date: this.formGroup.value.expiry_date,
      description: this.formGroup.value.description,
      voters: this.votersObj || this.votingDetails.voters,
    };
    this.loading = true;
    console.log(params);
    this.apiManager.updateQuestion(params, id).subscribe((response: any) => {
      this.loading = false;
      this.openSnackBar('Vote is successfully updated', 'CLOSE');
      this._location.back();
    }),
      (error) => (this.loading = false);
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}
