import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiManagerService } from 'src/app/api-manager/api-manager.service';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-minutes-creator-page',
  templateUrl: './minutes-creator-page.component.html',
  styleUrls: ['./minutes-creator-page.component.css'],
})
export class MinutesCreatorPageComponent implements OnInit {
  users: any = [];
  title = '';
  meeting_id: any = '';

  sessionStorage = window.sessionStorage;

  currentUser: any = {};
  meetingObj: any = {};
  agendaForm: FormGroup;
  guests: any = '';

  constructor(
    private apiManager: ApiManagerService,
    private _route: ActivatedRoute,
    public _location: Location,
    private sharedService: SharedService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('profile'));

    this._route.params.subscribe((params) => {
      if (params['meeting']) {
        this.initialize(params['meeting']);
      } else this._location.back();
    });
  }
  getAllUsers() {
    this.apiManager.getAllUsers().subscribe({
      next: (res) => {
        this.users = res;
      },
    });
  }

  setupData() {
    console.log(this.meetingObj);
    this.getAllUsers();
    this.createForm();
  }

  initialize(instance) {
    this.meetingObj = this.sharedService.decryptData(instance);
    this.meeting_id = this.meetingObj?.id;

    this.setupData();
  }

  attandanceChange(value, id) {
    const param = {
      user_id: id,
      meeting_id: this.meetingObj?.id,
      data: { choice: value },
    };
    this.apiManager
      .updateRsvp(param.meeting_id, param.user_id, param.data)
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  createForm() {
    this.agendaForm = this.fb.group({
      meeting_id: [this.meeting_id, [Validators.required]],
      created_by: [this.currentUser?.id, [Validators.required]],
      agendas: this.fb.array([]),
    });
    this.addAgenda();
  }

  addAgenda() {
    (this.agendaForm.get('agendas') as FormArray).push(
      this.fb.group({
        title: ['', [Validators.required]],
        discussion: ['', [Validators.required]],
        conclusion: ['', [Validators.required]],
        action_items: this.fb.array([]),
      })
    );
  }
  removeAgenda(i) {
    (this.agendaForm.get('agendas') as FormArray).removeAt(i);
  }

  addAction(i_agenda) {
    const action = (this.agendaForm.get('agendas') as FormArray).controls[
      i_agenda
    ].get('action_items') as FormArray;

    action.push(
      this.fb.group({
        action_name: ['', [Validators.required]],
        person_responsible: ['', [Validators.required]],
        deadline: ['', [Validators.required]],
      })
    );
  }

  removeAction(i_agenda, i_action) {
    (
      (<FormArray>this.agendaForm.controls['agendas'])
        .at(i_agenda)
        .get('action_items') as FormArray
    ).removeAt(i_action);
  }

  submitMinutes(data: any) {
    if (this.guests) data['guests'] = this.guests;

    console.log(data);
    const spinner = this.apiManager.startLoading('Saving minutes.....');
    this.apiManager.createMeetingMinute(data).subscribe({
      next: (res) => {
        this.apiManager.stopLoading(spinner);
        console.log(res);
        this._location.back();
      },
      error: (err) => {
        this.apiManager.stopLoading(spinner);
        console.log(err);
      },
    });
  }
}
