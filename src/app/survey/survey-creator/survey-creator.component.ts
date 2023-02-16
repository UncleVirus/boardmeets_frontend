import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  Form,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'node_modules/rxjs/dist/types';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';

@Component({
  selector: 'app-survey-creator',
  templateUrl: './survey-creator.component.html',
  styleUrls: ['./survey-creator.component.css'],
})
export class SurveyCreatorComponent implements OnInit {
  sessionStorage = window.sessionStorage;
  questionForm: FormGroup;
  surveyForm: FormGroup;
  param: any = [];
  files: File[] = [];
  users: any = [];
  fileUrl = '';
  loading = false;
  survey_id: any = '';
  currentUser: any = {};
  constructor(
    private fb: FormBuilder,
    private apiManager: ApiManagerService,
    private _location: Location,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));
    this.getAllUsers();
    this.createForm();
    this.createSurveyForm();
  }
  createSurveyForm() {
    this.surveyForm = this.fb.group({
      survey_title: ['', [Validators.required]],
      survey_open_date: ['', [Validators.required]],
      survey_close_date: ['', [Validators.required]],
      survey_description: ['', [Validators.required]],
      permissions: ['', [Validators.required]],
      survey_status: ['open'],
      survey_created_by: [this.currentUser?.id, [Validators.required]],
      document: [''],
    });
  }

  getAllUsers() {
    this.apiManager.getAllUsers().subscribe(
      (resp) => {
        this.users = resp;
      },
      (error) => console.log(error)
    );
  }

  onSubmitSurvey(data: any) {
    data['document'] = this.fileUrl;
    const spinner = this.apiManager.startLoading('Saving Survey.....');
    this.apiManager.createSurvey(data).subscribe(
      (res: any) => {
        this.survey_id = res.id;
        console.log(res);
        this.createForm();
        this.openSnackBar(
          'Survey created successful, start composing questions',
          'Close'
        );
        this.apiManager.stopLoading(spinner);
      },
      (err) => {
        console.log(err);
        this.apiManager.stopLoading(spinner);
      }
    );
  }

  createForm() {
    this.questionForm = this.fb.group({
      survey_id: [this.survey_id, [Validators.required]],
      questions: this.fb.array([]),
    });
    this.addQuestion();
  }

  addQuestion() {
    (this.questionForm.get('questions') as FormArray).push(
      this.fb.group({
        question_title: ['', [Validators.required]],
        question_type: ['', [Validators.required]],
        required: [false, [Validators.required]],
        responses: this.fb.array([]),
      })
    );
  }

  removeQuestion(i) {
    (this.questionForm.get('questions') as FormArray).removeAt(i);
  }

  addItem(i_question) {
    const options = (this.questionForm.get('questions') as FormArray).controls[
      i_question
    ].get('responses') as FormArray;

    options.push(
      this.fb.group({
        option: ['', [Validators.required]],
      })
    );
  }

  removeItem(i_question, i) {
    (
      (<FormArray>this.questionForm.controls['questions'])
        .at(i_question)
        .get('responses') as FormArray
    ).removeAt(i);
  }

  onQTypeChange(value, i_question) {
    (
      (<FormArray>this.questionForm.controls['questions'])
        .at(i_question)
        .get('responses') as FormArray
    ).clear();
    if (value == 'checkbox' || value == 'radio') {
      this.addItem(i_question);
    }
  }

  submitQuestions(data: any) {
    if (data.questions.length > 0) {
      const spinner = this.apiManager.startLoading('Saving Questions.....');
      this.apiManager.createSurveyQuestions(data).subscribe(
        (res: any) => {
          this.openSnackBar('Questions added successful', 'Close');
          this.apiManager.stopLoading(spinner);
          this.back();
        },
        (err) => {
          this.apiManager.stopLoading(spinner);
          console.log(err);
        }
      );
    } else return;
  }

  back() {
    this._location.back();
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
