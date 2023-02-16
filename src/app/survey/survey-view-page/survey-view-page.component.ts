import { JsonPipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatListOption } from '@angular/material/list';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-survey-view-page',
  templateUrl: './survey-view-page.component.html',
  styleUrls: ['./survey-view-page.component.css'],
})
export class SurveyViewPageComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  surveyForm: FormGroup;
  type = '["a!","b","c"]';
  numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  doc: boolean = false;
  surveyObj: any = {};
  questionsObj: any = [];
  currentUser: any = {};
  qCheckBoxAnswer: any = [];
  finalAnswer: any = [];
  submitted = false;
  submittedObj: any = [];
  json: any = JSON;
  range: any = Array(5).map((x, i) => i);
  constructor(
    private fb: FormBuilder,
    private apiManager: ApiManagerService,
    private sharedService: SharedService,
    public _location: Location,
    private snackBar: MatSnackBar,
    private _route: ActivatedRoute
  ) {
    this._route.params.subscribe((params) => {
      if (params['survey']) {
        this.surveyObj = this.sharedService.decryptData(params['survey']);
        console.log(this.surveyObj);
      } else this._location.back();
    });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.getSurveyQuestions(this.surveyObj?.id);
    this.checkIfUserSubmittedSurvey();
    this.createSurveyForm();
  }
  checkIfUserSubmittedSurvey() {
    const user = this.currentUser?.id;
    this.apiManager.CheckIfUserSubmittedSurvey(user).subscribe({
      next: (res: any) => {
        if (res?.length > 0) {
          this.submitted = true;
          this.submittedObj = res;
        }
        console.log('submitted..............', res);
      },
      error: (err) => {
        console.log('err', err);
      },
    });
  }

  getSurveyQuestions(id: any) {
    const spinner = this.apiManager.startLoading('Getting questions.....');
    this.apiManager.getAllSurveyQuestions(id).subscribe({
      next: (res: any) => {
        this.questionsObj = res;
        this.apiManager.stopLoading(spinner);
      },
      error: (err: any) => {
        console.log(err);
        this.apiManager.stopLoading(spinner);
      },
    });
  }

  openSuupportingDoc(document) {
    this.doc = true;
    this.sharedService.DocumentToView.next(document);
  }

  closeDocumentView() {
    this.doc = false;
  }

  createSurveyForm() {
    this.surveyForm = this.fb.group({
      survey_title: [this.surveyObj?.survey_title, [Validators.required]],
      survey_open_date: [
        this.surveyObj.survey_open_date,
        [Validators.required],
      ],
      survey_close_date: [
        this.surveyObj.survey_close_date,
        [Validators.required],
      ],
      survey_description: [
        this.surveyObj.survey_description,
        [Validators.required],
      ],
    });
    this.surveyForm.disable();
  }

  onCheckBoxQuestionChange(answers: MatListOption[], q_id, question_type) {
    this.qCheckBoxAnswer = answers.map((o) => o.value);
    const to_json = this.qCheckBoxAnswer;
    const data = {
      question_id: q_id,
      answer: to_json,
      question_type: question_type,
    };
    this.insertData(data);
  }

  radioChange(event: MatRadioChange, q_id, question_type) {
    const data = {
      question_id: q_id,
      answer: event.value,
      question_type: question_type,
    };
    this.insertData(data);
  }
  textQuestionBoxChange(event: any, q_id, question_type) {
    const value = (event.target as HTMLInputElement).value;
    const data = {
      question_id: q_id,
      answer: value,
      question_type: question_type,
    };
    this.insertData(data);
  }

  changeRangeQuestion(event: any, q_id, question_type) {
    const data = {
      question_id: q_id,
      answer: event,
      question_type: question_type,
    };
    this.insertData(data);
  }
  SubmitAnswers() {
    const param = {
      survey_id: 8,
      questions: this.finalAnswer,
    };
    console.log(param);
    this.apiManager.submitSurveyResponses(param).subscribe({
      next: (res: any) => {
        console.log(res);
        this.openSnackBar(`Thank you! ${res.data}`, 'Ok');
        this.back();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  back() {
    this._location.back();
  }
  insertData(data: { question_id: any; answer: string }) {
    var index = this.finalAnswer.findIndex(
      (item: any) => item.question_id === data.question_id
    );
    if (index === -1) {
      this.finalAnswer.push(data);
    } else {
      this.finalAnswer[index] = data;
    }
  }
  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}
