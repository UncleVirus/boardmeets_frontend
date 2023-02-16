import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SpinnerViewComponent } from '../dialogs/spinner-view/spinner-view.component';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiManagerService {
  //BASE_URL = 'www.api.cosekeeboard.com';
  BASE_URL = '127.0.0.1:8000';
  //BASE_URL = '172.98.72.70:8000';
  sessionStorage = window.sessionStorage;

  _httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog
  ) {
    let http_protocal = 'https://';

    if (window.location.protocol === 'https:') {
      http_protocal = 'https://';
    } else {
      http_protocal = 'http://';
    }

    this.BASE_URL = `${http_protocal}${this.BASE_URL}`;

    if (this.sessionStorage.getItem('token')) {
      this.httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: this.sessionStorage.getItem('token'),
        }),
      };
    }
  }

  //users
  registerUser(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/user/register_user/',
      data,
      this.httpOptions
    );
  }

  getAllUsers() {
    return this.http.get(
      this.BASE_URL + '/api/user/all_users/',
      this.httpOptions
    );
  }

  updateUser(pk, params) {
    return this.http.patch(
      this.BASE_URL + '/api/user/update_user_by_id/' + pk + '/',
      params,
      this.httpOptions
    );
  }

  updateProfile(pk, params) {
    return this.http.patch(
      this.BASE_URL + '/api/user/normal_update_user_by_id/' + pk + '/',
      params,
      this.httpOptions
    );
  }

  deleteUser(pk) {
    return this.http.delete(
      this.BASE_URL + '/api/user/delete_user_by_id/' + pk + '/',
      this.httpOptions
    );
  }

  forgotPassword(param) {
    return this.http.post(
      this.BASE_URL + '/api/user/forgot_password/',
      param,
      this._httpOptions
    );
  }

  resetPassword(param) {
    return this.http.post(
      this.BASE_URL + '/api/user/reset_password/',
      param,
      this._httpOptions
    );
  }

  changePassword(user_id, data) {
    return this.http.patch(
      this.BASE_URL + '/api/user/change_password/' + user_id + '/',
      data,
      this.httpOptions
    );
  }

  //get audit trial
  getUserAuditTrial() {
    return this.http.get(
      this.BASE_URL + '/api/user/audit_trail/',
      this.httpOptions
    );
  }

  //two factor authentication
  verifyUser(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/user/verification/',
      data,
      this.httpOptions
    );
  }
  resendVerificationCode(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/user/code_resend/',
      data,
      this.httpOptions
    );
  }

  //department
  createDepartment(data) {
    return this.http.post(
      this.BASE_URL + '/api/user/department/',
      data,
      this.httpOptions
    );
  }

  getDepartments() {
    return this.http.get(
      this.BASE_URL + '/api/user/department/',
      this.httpOptions
    );
  }

  updateDepartment(dep_id, data) {
    return this.http.patch(
      this.BASE_URL + '/api/user/department/' + dep_id + '/',
      data,
      this.httpOptions
    );
  }

  deleteDepartment(dep_id) {
    return this.http.delete(
      this.BASE_URL + '/api/user/department/' + dep_id + '/',
      this.httpOptions
    );
  }

  //login
  login(data: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
    };

    const obs = this.http.post(
      this.BASE_URL + '/api/user/login/',
      data,
      httpOptions
    );
    if (obs) {
      obs.subscribe({
        next: (response: any) => {
          const token = 'token ' + response.token;
          const user = response.user[0];
          this.sessionStorage.setItem('token', token);
          this.sessionStorage.setItem('profile', JSON.stringify(user));
        },
      });
      return obs;
    }
  }

  getAllUserGroups() {
    return this.http.get(
      this.BASE_URL + '/api/user/all_groups/',
      this.httpOptions
    );
  }

  getUsersByGroupId(group_id) {
    return this.http.get(
      this.BASE_URL + '/api/user/user_by_groups/' + group_id + '/',
      this.httpOptions
    );
  }

  updateUserGroup(group_id, data) {
    return this.http.patch(
      this.BASE_URL + '/api/user/update_group_by_id/' + group_id + '/',
      data,
      this.httpOptions
    );
  }

  addUserGroup(data) {
    return this.http.post(
      this.BASE_URL + '/api/user/create_group/',
      data,
      this.httpOptions
    );
  }

  deleteUserGroup(group_id) {
    return this.http.delete(
      this.BASE_URL + '/api/user/delete_group_by_id/' + group_id + '/',
      this.httpOptions
    );
  }

  logout() {
    return this.http.post(
      this.BASE_URL + '/api/user/logout/',
      '',
      this.httpOptions
    );
  }

  //agenda
  createAgenda(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/meeting/create_agenda_items/',
      data,
      this.httpOptions
    );
  }

  getAllAgenda() {
    return this.http.get(
      this.BASE_URL + '/api/meeting/agendaitems/',
      this.httpOptions
    );
  }
  getMeetingAgendas(meeting_id) {
    return this.http.get(
      this.BASE_URL +
        '/api/meeting/get_agenda_by_meeting_id/' +
        meeting_id +
        '/',
      this.httpOptions
    );
  }
  deleteAgenda(id: any) {
    return this.http.delete(
      this.BASE_URL + '/api/meeting/delete_agenda_by_id/' + id + '/',
      this.httpOptions
    );
  }
  updateAgenda(id: any, data) {
    return this.http.patch(
      this.BASE_URL + '/api/meeting/update_agenda_by_id/' + id + '/',
      data,
      this.httpOptions
    );
  }

  //meeting
  createMeeting(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/meeting/create_meeting/',
      data,
      this.httpOptions
    );
  }

  updateMeeting(meeting_id, data) {
    return this.http.patch(
      this.BASE_URL + '/api/meeting/update_meeting_by_id/' + meeting_id + '/',
      data,
      this.httpOptions
    );
  }

  deleteMeeting(meeting_id: any) {
    return this.http.delete(
      this.BASE_URL + '/api/meeting/delete_meeting_by_id/' + meeting_id + '/',
      this.httpOptions
    );
  }

  getActiveMeetings() {
    return this.http.get(
      this.BASE_URL + '/api/meeting/get_active_meeting/',
      this.httpOptions
    );
  }

  getMeetingsByRange(data) {
    return this.http.post(
      this.BASE_URL + '/api/meeting/get_meetings_by_range/',
      data,
      this.httpOptions
    );
  }

  getMeetingAnalytics(meeting_id) {
    return this.http.get(
      this.BASE_URL +
        '/api/meeting/get_analytics_by_meeting_id/' +
        meeting_id +
        '/',
      this.httpOptions
    );
  }

  //rsvp
  createRsvp(data) {
    return this.http.post(
      this.BASE_URL + '/api/meeting/user_rsvp_response/',
      data,
      this.httpOptions
    );
  }

  getMeetingRsvp(meeting_id) {
    return this.http.get(
      this.BASE_URL +
        '/api/meeting/get_rsvp_response_for_meeting/' +
        meeting_id +
        '/',
      this.httpOptions
    );
  }

  updateRsvp(meeting_id, user_id, data) {
    //choice:''
    return this.http.patch(
      this.BASE_URL +
        '/api/meeting/update_rsvp/' +
        meeting_id +
        '/' +
        +user_id +
        '/',
      data,
      this.httpOptions
    );
  }

  getUserRsvp(meeting_id, user_id) {
    return this.http.get(
      this.BASE_URL +
        '/api/meeting/get_user_rsvp_response/' +
        meeting_id +
        '/' +
        user_id +
        '/',
      this.httpOptions
    );
  }

  getMeetingAttachments(agendaId, meetingId) {
    return this.http.get(
      this.BASE_URL + '/api/meeting/' + agendaId + '/uploads/' + meetingId,
      this.httpOptions
    );
  }

  attachmentToAgendaInMeeting(data: any, meeting_id: any, agenda_id: any) {
    return this.http.post(
      this.BASE_URL +
        '/api/meeting/' +
        agenda_id +
        '/uploads/' +
        meeting_id +
        '/',
      data,
      this.httpOptions
    );
  }

  getExpiredMeetings() {
    return this.http.get(
      this.BASE_URL + '/api/meeting/get_inactive_meeting/',
      this.httpOptions
    );
  }

  sendMeetingInvitations(meeting_id: any, data: any) {
    return this.http.post(
      this.BASE_URL + '/api/meeting/' + meeting_id + '/invitations/',
      data,
      this.httpOptions
    );
  }

  //minutes
  createMeetingMinute(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/meeting/create_minutes/',
      data,
      this.httpOptions
    );
  }

  getMeetingMinute(meetingId) {
    return this.http.get(
      this.BASE_URL + '/api/meeting/get_minute_by_meeting/' + meetingId + '/',
      this.httpOptions
    );
  }
  updateMeetingMinute(minuteId, data) {
    return this.http.patch(
      this.BASE_URL + '/api/meeting/update_minute_by_id/' + minuteId + '/',
      data,
      this.httpOptions
    );
  }
  deleteMeetingMinute(minuteId) {
    return this.http.delete(
      this.BASE_URL + '/api/meeting/delete_minute_by_id/' + minuteId + '/',
      this.httpOptions
    );
  }

  //invitations options
  getResponseOptions() {
    return this.http.get(
      this.BASE_URL + '/api/meeting/invitations/responseoptions/',
      this.httpOptions
    );
  }
  respondToInvitations(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/meeting/invitations/respond/',
      data,
      this.httpOptions
    );
  }
  meetingInvitations(meetingId) {
    return this.http.get(
      this.BASE_URL + '/api/meeting/' + meetingId + '/invitations',
      this.httpOptions
    );
  }
  getUserMeetingInvitations() {
    return this.http.get(
      this.BASE_URL + '/api/meeting/invitations/respond/',
      this.httpOptions
    );
  }

  addAgendaItemsToMeeting(meeting_id: any, data: any) {
    return this.http.post(
      this.BASE_URL + '/api/meeting/' + meeting_id + '/agendaitems/',
      data,
      this.httpOptions
    );
  }

  addSubAgendaToMainAgenda(main_agenda_id: any, data) {
    return this.http.post(
      this.BASE_URL +
        '/api/meeting/agendaitem/' +
        main_agenda_id +
        '/subagendas/',
      data,
      this.httpOptions
    );
  }

  //voting management
  createVote(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/voting/create_question/',
      data,
      this.httpOptions
    );
  }

  getAllquestions() {
    return this.http.get(
      this.BASE_URL + '/api/voting/all_questions/',
      this.httpOptions
    );
  }

  updateQuestion(data: any, id: any) {
    return this.http.patch(
      this.BASE_URL + '/api/voting/update_question_by_id/' + id + '/',
      data,
      this.httpOptions
    );
  }

  questionVote(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/voting/question_vote/',
      data,
      this.httpOptions
    );
  }

  getVotesDetailsByQuestion(questionId: any) {
    return this.http.get(
      this.BASE_URL +
        '/api/voting/get_question_votes_by_question/' +
        questionId +
        '/',
      this.httpOptions
    );
  }

  deleteQuestionById(id: any) {
    return this.http.delete(
      this.BASE_URL + '/api/voting/delete_question_by_id/' + id + '/',
      this.httpOptions
    );
  }

  getVotesAnalytics(questionId: any) {
    return this.http.get(
      this.BASE_URL + '/api/voting/get_question_by_id/' + questionId + '/',
      this.httpOptions
    );
  }

  //contract management
  createContract(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/contract/',
      data,
      this.httpOptions
    );
  }

  getContracts() {
    return this.http.get(this.BASE_URL + '/api/contract/', this.httpOptions);
  }

  updateContract(id: any, data: any) {
    return this.http.patch(
      this.BASE_URL + '/api/contract/' + id + '/',
      data,
      this.httpOptions
    );
  }

  getContractsToBeSigned() {
    return this.http.get(
      this.BASE_URL + '/api/contract/get_contracts_to_be_signed_by_user/',
      this.httpOptions
    );
  }
  getContractsToBeApproved() {
    return this.http.get(
      this.BASE_URL + '/api/contract/get_contracts_to_be_approved_by_user/',
      this.httpOptions
    );
  }

  deleteContract(id: any) {
    return this.http.delete(
      this.BASE_URL + '/api/contract/' + id + '/',
      this.httpOptions
    );
  }

  contractRejectOrApprove(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/contract/contract_stage/',
      data,
      this.httpOptions
    );
  }
  addDocumentToSign(contractId, data) {
    return this.http.post(
      this.BASE_URL +
        '/api/contract/add_signeers_to_contract_document/' +
        contractId +
        '/',
      data,
      this.httpOptions
    );
  }
  getDocumentToSignatureAnnotation(contractId) {
    return this.http.get(
      this.BASE_URL +
        '/api/contract/get_signeers_of_contract_document/' +
        contractId +
        '/',
      this.httpOptions
    );
  }

  getContractSignatureAnalytics(contractId) {
    return this.http.get(
      this.BASE_URL +
        '/api/contract/get_contract_signature_analytics/' +
        contractId +
        '/',
      this.httpOptions
    );
  }

  createContractFeedback(contractId, data) {
    return this.http.post(
      this.BASE_URL +
        '/api/contract/create_contract_feedback/' +
        contractId +
        '/',
      data,
      this.httpOptions
    );
  }

  getContractFeedback(contractId) {
    return this.http.get(
      this.BASE_URL +
        '/api/contract/get_contract_feedbacks/' +
        contractId +
        '/',

      this.httpOptions
    );
  }

  updateContractFeedback(feedbackId, data) {
    return this.http.patch(
      this.BASE_URL +
        '/api/contract/update_contract_feedbacks/' +
        feedbackId +
        '/',
      data,
      this.httpOptions
    );
  }
  deleteContractFeedback(feedbackId) {
    return this.http.delete(
      this.BASE_URL +
        '/api/contract/update_contract_feedbacks/' +
        feedbackId +
        '/',

      this.httpOptions
    );
  }

  SigningContractDocument(contract_id, data) {
    return this.http.post(
      this.BASE_URL +
        '/api/contract/signing_contract_document/' +
        contract_id +
        '/',
      data,
      this.httpOptions
    );
  }

  getContractActions(contract_id) {
    return this.http.get(
      this.BASE_URL + '/api/contract/contract_stage/' + contract_id + '/',
      this.httpOptions
    );
  }

  isAdminUser(group: string) {
    if (group === 'Org_Admin' || group === 'Sys_Admin') {
      this.sessionStorage.setItem('isAdmin', 'true');
    } else {
      this.sessionStorage.setItem('isAdmin', 'false');
    }
  }

  //resources
  createFolder(param) {
    return this.http.post(
      this.BASE_URL + '/api/file-manager/folders/',
      param,
      this.httpOptions
    );
  }

  getMainFolders() {
    return this.http.get(
      this.BASE_URL + '/api/file-manager/folders/',
      this.httpOptions
    );
  }

  getPermissionFolders(user_id) {
    return this.http.get(
      this.BASE_URL + '/api/file-manager/folders_perm/' + user_id + '/',
      this.httpOptions
    );
  }

  getSubFolders(parent: any) {
    return this.http.post(
      this.BASE_URL + '/api/file-manager/subfolders/',
      parent,
      this.httpOptions
    );
  }

  updateFolder(id: any, param) {
    return this.http.patch(
      this.BASE_URL + '/api/file-manager/folders/' + id + '/',
      param,
      this.httpOptions
    );
  }

  deleteFolder(id: any) {
    return this.http.delete(
      this.BASE_URL + '/api/file-manager/folders/' + id + '/',
      this.httpOptions
    );
  }

  createDocumentInFolder(param) {
    return this.http.post(
      this.BASE_URL + '/api/file-manager/documents/',
      param,
      this.httpOptions
    );
  }

  getDocumentsInFolder(folder_id) {
    return this.http.get(
      this.BASE_URL + '/api/file-manager/documents/' + folder_id + '/',
      this.httpOptions
    );
  }

  updateDocumentInFolder(id: any, param: any) {
    return this.http.patch(
      this.BASE_URL + '/api/file-manager/documents_update/' + id + '/',
      param,
      this.httpOptions
    );
  }

  deleteDocumentInFolder(id: any) {
    return this.http.delete(
      this.BASE_URL + '/api/file-manager/documents_update/' + id + '/',
      this.httpOptions
    );
  }

  //zoom integration
  generateZoomMeeting(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/zoom/pre_meeting/',
      data,
      this.httpOptions
    );
  }

  getZoomMeetingByMeetingId(meetingId) {
    return this.http.get(
      this.BASE_URL +
        '/api/zoom/get_zoom_meeting_details_meeting_id/' +
        meetingId,
      this.httpOptions
    );
  }

  generateZoomSignature(data) {
    return this.http.post(
      this.BASE_URL + '/api/zoom/generate_zoom_signature/',
      data,
      this.httpOptions
    );
  }

  isZoomMeetingCreated(meeting_id: any) {
    return this.http.get(
      this.BASE_URL + '/api/zoom/is_created/' + meeting_id,
      this.httpOptions
    );
  }

  // e-Signature feature
  getAllSignatures() {
    return this.http.get(
      this.BASE_URL + '/api/signature/all_signature/',
      this.httpOptions
    );
  }
  createSignature(data) {
    return this.http.post(
      this.BASE_URL + '/api/signature/create_signature/',
      data,
      this.httpOptions
    );
  }

  deleteSignature(sigId) {
    return this.http.delete(
      this.BASE_URL + '/api/signature/delete_signature_by_id/' + sigId + '/',
      this.httpOptions
    );
  }

  getSignatureByUser(userId: any) {
    return this.http.get(
      this.BASE_URL + '/api/signature/get_signature_by_user/' + userId + '/',
      this.httpOptions
    );
  }

  createDocumetSignature(data) {
    return this.http.post(
      this.BASE_URL + '/api/signature/create_document_to_be_signed/',
      data,
      this.httpOptions
    );
  }
  getDocumetSignature() {
    return this.http.get(
      this.BASE_URL + '/api/signature/all_document_to_be_signed_by_org/',
      this.httpOptions
    );
  }

  deleteSignatureDocument(id: any) {
    return this.http.delete(
      this.BASE_URL +
        '/api/signature/delete_to_be_signed_document_by_id/' +
        id +
        '/',
      this.httpOptions
    );
  }
  updateSignatureDocument(data: any, id: any) {
    return this.http.patch(
      this.BASE_URL +
        '/api/signature/update_to_be_signed_document_by_id/' +
        id +
        '/',
      data,
      this.httpOptions
    );
  }

  createDocumenteSignaturePlacement(eSignatureId, data) {
    return this.http.post(
      this.BASE_URL +
        '/api/signature/create_eSignature_placement/' +
        eSignatureId +
        '/',
      data,
      this.httpOptions
    );
  }

  SigningeSignatureDocument(eSignatureId, data) {
    return this.http.post(
      this.BASE_URL +
        '/api/signature/signing_eSignature_document/' +
        eSignatureId +
        '/',
      data,
      this.httpOptions
    );
  }
  getDocumenteSignatureAnnotation(eSignatureId) {
    return this.http.get(
      this.BASE_URL +
        '/api/signature/get_eSignature_document_annotation/' +
        eSignatureId +
        '/',
      this.httpOptions
    );
  }

  getDocumentESignatureAnalytics(eSignatureId) {
    return this.http.get(
      this.BASE_URL +
        '/api/signature/get_eSignature_document_analytics/' +
        eSignatureId +
        '/',
      this.httpOptions
    );
  }

  //tasks feature
  createTask(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/tasks/create_task/',
      data,
      this.httpOptions
    );
  }

  getAllTasks() {
    return this.http.get(
      this.BASE_URL + '/api/tasks/all_task/',
      this.httpOptions
    );
  }
  getTasksByStatus(status) {
    return this.http.get(
      this.BASE_URL + '/api/tasks/get_task_by_status/' + status + '/',
      this.httpOptions
    );
  }
  getTasksByPeriority(periority) {
    return this.http.get(
      this.BASE_URL + '/api/tasks/get_task_by_priority/' + periority + '/',
      this.httpOptions
    );
  }

  getTaskByAssignee(assignee_id: any) {
    return this.http.get(
      this.BASE_URL + '/api/tasks/get_task_by_assignee/' + assignee_id + '/',
      this.httpOptions
    );
  }

  getTaskByCreator(creator_id: any) {
    return this.http.get(
      this.BASE_URL + '/api/tasks/get_task_by_creator/' + creator_id + '/',
      this.httpOptions
    );
  }

  deleteTaskById(id: any) {
    return this.http.delete(
      this.BASE_URL + '/api/tasks/delete_task_by_id/' + id + '/',
      this.httpOptions
    );
  }

  updateTaskById(id: any, data: any) {
    return this.http.patch(
      this.BASE_URL + '/api/tasks/update_task_by_status/' + id + '/',
      data,
      this.httpOptions
    );
  }

  //task discussion
  createComment(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/tasks/create_comment/',
      data,
      this.httpOptions
    );
  }

  getCommentsByTask(task_id: any) {
    return this.http.get(
      this.BASE_URL + '/api/tasks/get_comment_by_task/' + task_id + '/',
      this.httpOptions
    );
  }

  updateComment(comment_id: any, data: any) {
    return this.http.patch(
      this.BASE_URL + '/api/tasks/update_comment_by_id/' + comment_id + '/',
      data,
      this.httpOptions
    );
  }

  deleteComment(comment_id: any) {
    return this.http.delete(
      this.BASE_URL + '/api/tasks/delete_comment_by_id/' + comment_id + '/',
      this.httpOptions
    );
  }

  //ip filtering
  createIpAddressRange(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/user/create_organization_iprange/',
      data,
      this.httpOptions
    );
  }

  getIpAddressRange(org_id: any) {
    return this.http.get(
      this.BASE_URL + '/api/user/get_organization_iprange/' + org_id + '/',
      this.httpOptions
    );
  }

  deleteIpRange(range_id: any) {
    return this.http.delete(
      this.BASE_URL + '/api/user/delete_organization_iprange/' + range_id + '/',
      this.httpOptions
    );
  }

  updateIpAddressRange(range_id: any, data: any) {
    return this.http.patch(
      this.BASE_URL +
        '/api/people/update_organization_iprange/' +
        range_id +
        '/',
      data,
      this.httpOptions
    );
  }

  createOrganizationSetting(data) {
    return this.http.post(
      this.BASE_URL + '/api/user/create_organization_setting/',
      data,
      this.httpOptions
    );
  }

  deleteOrganizationSetting(setting_id: any) {
    return this.http.delete(
      this.BASE_URL +
        '/api/user/Delete_organization_setting/' +
        setting_id +
        '/',
      this.httpOptions
    );
  }

  //surveys
  createSurvey(data: any) {
    return this.http.post(
      this.BASE_URL + '/api/surveys/create_survey/',
      data,
      this.httpOptions
    );
  }

  createSurveyQuestions(data) {
    return this.http.post(
      this.BASE_URL + '/api/surveys/create_survey_question/',
      data,
      this.httpOptions
    );
  }

  getAllSurveyQuestions(survey_id) {
    return this.http.get(
      this.BASE_URL +
        '/api/surveys/all_survey_questions_by_survey/' +
        survey_id +
        '/',
      this.httpOptions
    );
  }
  deleteSurveyQuestionById(question_id) {
    return this.http.delete(
      this.BASE_URL +
        '/api/surveys/delete_survey_question_by_id/' +
        question_id +
        '/',
      this.httpOptions
    );
  }

  CheckIfUserSubmittedSurvey(userId) {
    return this.http.get(
      this.BASE_URL + '/api/surveys/check_if_submitted/' + userId + '/',
      this.httpOptions
    );
  }
  submitSurveyResponses(data) {
    return this.http.patch(
      this.BASE_URL + '/api/surveys/submit_question/',
      data,
      this.httpOptions
    );
  }

  getAllSurveys() {
    return this.http.get(
      this.BASE_URL + '/api/surveys/all_surveys/',
      this.httpOptions
    );
  }
  getQuestionsAnalytics(q_id) {
    return this.http.get(
      this.BASE_URL + '/api/surveys/survey_question_analytics/' + q_id + '/',
      this.httpOptions
    );
  }

  checkUserSubmittedSurvey(survey_id) {
    return this.http.get(
      this.BASE_URL + '/api/surveys/check_if_submitted/' + survey_id + '/',
      this.httpOptions
    );
  }

  deleteSurvey(survey_id: any) {
    return this.http.delete(
      this.BASE_URL + '/api/surveys/delete_survey_by_id/' + survey_id + '/',
      this.httpOptions
    );
  }

  updateSurvey(survey_id: any, data) {
    return this.http.patch(
      this.BASE_URL + '/api/surveys/update_survey_by_id/' + survey_id + '/',
      data,
      this.httpOptions
    );
  }

  //compliance
  createCompliance(data) {
    return this.http.post(
      this.BASE_URL + '/api/compliance/create_compliance/',
      data,
      this.httpOptions
    );
  }
  createChecklist(data) {
    return this.http.post(
      this.BASE_URL + '/api/compliance/create_checklist/',
      data,
      this.httpOptions
    );
  }

  getCheclist(compliance_id) {
    return this.http.get(
      this.BASE_URL + '/api/compliance/get_checklist/' + compliance_id + '/',
      this.httpOptions
    );
  }

  getCompliance() {
    return this.http.get(this.BASE_URL + '/api/compliance/', this.httpOptions);
  }

  updateCompliance(compliance_id, data) {
    return this.http.patch(
      this.BASE_URL +
        '/api/compliance/update_compliance_by_id/' +
        compliance_id +
        '/',
      data,
      this.httpOptions
    );
  }

  updateComplianceCheck(check_id, data) {
    return this.http.patch(
      this.BASE_URL +
        '/api/compliance/update_compliance_checklist_by_id/' +
        check_id +
        '/',
      data,
      this.httpOptions
    );
  }

  deleteCompliance(compliance_id) {
    return this.http.delete(
      this.BASE_URL +
        '/api/compliance/delete_compliance_by_id/' +
        compliance_id +
        '/',
      this.httpOptions
    );
  }

  markChecklist(compliance_id, checklis_id, data) {
    return this.http.patch(
      this.BASE_URL +
        '/api/compliance/mark_checklist/' +
        compliance_id +
        '/' +
        checklis_id +
        '/',
      data,
      this.httpOptions
    );
  }

  deleteComplianceChecklist(checklist_id) {
    return this.http.delete(
      this.BASE_URL +
        '/api/compliance/delete_compliance_checklist_by_id/' +
        checklist_id +
        '/',
      this.httpOptions
    );
  }

  //chat api
  CreateChat(data) {
    return this.http.post(
      this.BASE_URL + '/api/chat/start_chat/',
      data,
      this.httpOptions
    );
  }

  getChats(logged_in_user) {
    return this.http.get(
      this.BASE_URL + '/api/chat/contacts/' + logged_in_user + '/',
      this.httpOptions
    );
  }

  //loading dialog service
  startLoading(message?): MatDialogRef<SpinnerViewComponent> {
    const dialogRef = this.dialog.open(SpinnerViewComponent, {
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: message == '' || message == undefined ? 'Loading...' : message,
    });
    return dialogRef;
  }

  stopLoading(ref: MatDialogRef<SpinnerViewComponent>) {
    ref.close();
  }

  getAnnotationsFromServer(doc_ref) {
    return this.http.get(
      this.BASE_URL + '/api/meeting/get_annotations/' + doc_ref + '/',
      this.httpOptions
    );
  }

  saveAnnotsStringToServer(data) {
    return this.http.post(
      this.BASE_URL + '/api/meeting/create_annotation/',
      data,
      this.httpOptions
    );
  }
  updateAnnotsStringToServer(annot_id, data) {
    return this.http.patch(
      this.BASE_URL + '/api/meeting/update_annotations/' + annot_id + '/',
      data,
      this.httpOptions
    );
  }

  deleteAnnotationsFromServer(annot_id) {
    return this.http.delete(
      this.BASE_URL + '/api/meeting/delete_annotations/' + annot_id + '/',
      this.httpOptions
    );
  }

  //notification
  device_user_registration(data) {
    return this.http.post(
      this.BASE_URL + '/api/notification/create_or_update_user_device/',
      data,
      this.httpOptions
    );
  }
}
// Contest.objects.filter((endTime__lte = timezone.now()));
