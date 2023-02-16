import { JsonPipe, Location } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChartType, ChartOptions } from 'chart.js';
import {
  SingleDataSet,
  Label,
  monkeyPatchChartJsLegend,
  monkeyPatchChartJsTooltip,
} from 'ng2-charts';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-survey-results',
  templateUrl: './survey-results.component.html',
  styleUrls: ['./survey-results.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SurveyResultsComponent implements OnInit {
  //pie config

  public pieChartOptions: ChartOptions = { responsive: true };
  public lineChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  };
  public pieChartLabels: Label[] = [];
  public pieChartData: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

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
  questionResult: any = [];
  questionStatistics: any = [];
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
    //pie
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
    this._route.params.subscribe((params) => {
      if (params['survey']) {
        this.surveyObj = this.sharedService.decryptData(params['survey']);
      } else this._location.back();
    });
  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));

    this.getSurveyQuestions(this.surveyObj?.id);
    this.createSurveyForm();
  }

  getQuestionAnalytics(q_id, question_type) {
    const spinner = this.apiManager.startLoading('Getting results');
    this.apiManager.getQuestionsAnalytics(q_id).subscribe({
      next: (res: any) => {
        console.log(res);
        this.questionResult = res?.result;
        this.questionStatistics = res?.statistics;
        if (!this.questionResult.length) {
          this.openSnackBar('This question has no answers yet.', 'CLOSE');
        }
        if (this.questionStatistics.length) {
          this.drawQuestionChat(this.questionStatistics, question_type);
        }
        this.apiManager.stopLoading(spinner);
      },
      error: (err) => {
        console.log(err);
        this.apiManager.stopLoading(spinner);
      },
    });
  }

  drawQuestionChat(data: [], question_type) {
    this.pieChartLabels = [];
    this.pieChartData = [];
    this.pieChartLegend = true;
    this.pieChartType = 'pie';
    if (question_type == 'radio') {
      data.forEach((item: any) => {
        this.pieChartLabels.push(`${item.answer}`);
        this.pieChartData.push(item.count);
      });
    } else {
      this.pieChartType = 'horizontalBar';
      this.pieChartLegend = false;
      this.pieChartLabels.push('Answers');
      this.pieChartData.push(0);
      if (question_type !== 'checkbox') {
        this.pieChartType = 'bar';
      }

      data.forEach((item: any) => {
        this.pieChartLabels.push(item.answer);
        this.pieChartData.push(item.count);
      });
    }
  }

  getSurveyQuestions(id: any) {
    const spinner = this.apiManager.startLoading();
    this.apiManager.getAllSurveyQuestions(id).subscribe({
      next: (res: any) => {
        this.questionsObj = res;
        console.log('res', res);
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

  editQuestion(question_data) {
    return alert(`Button not set yet.`);
  }
  deleteQuestion(question_id) {
    const spinner = this.apiManager.startLoading('Deleting question...');
    this.apiManager.deleteSurveyQuestionById(question_id).subscribe({
      next: (res) => {
        this.apiManager.stopLoading(spinner);
        this.getSurveyQuestions(this.surveyObj.id);
        this.openSnackBar('Question deleted', 'CLOSE');
      },
      error: (err) => {
        this.apiManager.stopLoading(spinner);
        this.openSnackBar('Oops! Question not deleted', 'CLOSE');
      },
    });
  }

  openSnackBar(message: string, action: string, duration = 5000) {
    this.snackBar.open(message, action, {
      duration: duration,
    });
  }
}
