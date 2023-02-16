import { BrowserModule } from '@angular/platform-browser';
import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { environment } from '../environments/environment';
import { initializeApp } from 'firebase/app';
initializeApp(environment.firebase);

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HttpClientModule } from '@angular/common/http';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { BnNgIdleService } from 'bn-ng-idle';
import { ChartsModule } from 'ng2-charts';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  NgxMatDatetimePickerModule,
  NgxMatTimepickerModule,
} from '@angular-material-components/datetime-picker';
import { MatStepperModule } from '@angular/material/stepper';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MAT_BOTTOM_SHEET_DEFAULT_OPTIONS } from '@angular/material/bottom-sheet';
import { MatTreeModule } from '@angular/material/tree';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LoginPageComponent } from './login-page/login-page/login-page.component';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { ApiManagerService } from './api-manager/api-manager.service';
import {
  OrganizationComponent,
  AddIpRangeDialog,
  CreateLeadersDialog,
  CreateSocialMediaDialog,
  CreateContactDialog,
} from './organization/organization.component';
import { CreationComponent } from './contract-page/contract-creation/creation.component';
import {
  ContractViewComponent,
  DisplayResponseDialog,
} from './contract-page/contract-view/contract-view-component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';

import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { AngularEditorModule } from '@kolkov/angular-editor';

import { FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxDropzoneModule } from 'ngx-dropzone';
import {
  NotificationsComponent,
  NotificationDeleteDialog,
  NotificationMarkDialog,
} from './notifications/notifications.component';
import { NgxShimmerLoadingModule } from 'ngx-shimmer-loading';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { LandingPageComponent } from './landing-page/landing-page.component';

import {
  ActionsComponent,
  CreateVoteDialog,
} from './Actions/actions-page.component';
import { VotingPageComponent } from './voting/voting-page.component';
import { ViewDocumentComponent } from './view-document/view-document.component';
import { LoadingShimmerComponent } from './loading-shimmer/loading-shimmer.component';
import {
  UsersPageComponent,
  DialogEditUserDialog,
  DialogDeleteUserDialog,
  DialogRegisterUserDialog,
  DialogAddUserGroupDialog,
  DialogEditUserGroupDialog,
  CreateDepartmentDialog,
} from './users-page/users-page.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { ResetPasswordPageComponent } from './reset-password-page/reset-password-page.component';
import { ForgotPasswordPageComponent } from './forgot-password-page/forgot-password-page.component';
import {
  UserProfileComponent,
  DialogEditProfileDialog,
} from './user-profile/user-profile.component';
import { AdminNavigationComponent } from './admin-navigation/admin-navigation.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import {
  ResourcesComponent,
  DialogCreateFileDialog,
  DialogCreateFolderDialog,
} from './resources/resources.component';
import { LicensesComponent } from './licenses/licenses.component';
import { DataTablesModule } from 'angular-datatables';
import { VideogularPlayerComponent } from './videogular-player/videogular-player.component';
import {
  VerifyUserPageComponent,
  ResendCodeDialog,
} from './verify-user-page/verify-user-page.component';
import { MatRippleModule } from '@angular/material/core';
import {
  TasksPageComponent,
  CreateTaskDialog,
  ManageTaskDialog,
} from './tasks-page/tasks-page.component';
import { QuillModule } from 'ngx-quill';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import {
  ESignaturePageComponent,
  DialogDocumentDestinationDialog,
} from './eSignature/e-signature-page/e-signature-page.component';
import { SurveyCreatorComponent } from './survey/survey-creator/survey-creator.component';
import { SurveyViewPageComponent } from './survey/survey-view-page/survey-view-page.component';
import { SignatureViewPageComponent } from './eSignature/signature-view-page/signature-view-page.component';
import { SurveyResultsComponent } from './survey/survey-results/survey-results.component';
import {
  ChatPageComponent,
  DialogCreateGroupChatDialog,
  DialogCreatePrivateChatDialog,
} from './chat/chat-page/chat-page.component';
import { CompliancePageComponent } from './compliance/compliance-page/compliance-page.component';
import { ComplianceCreatorComponent } from './compliance/compliance-creator/compliance-creator.component';
import {
  ComplianceViewComponent,
  DialogEditComplianceCheckDialog,
  DialogEditComplianceDialog,
} from './compliance/compliance-view/compliance-view.component';
import {
  MeetingCreatorComponent,
  DialogEditAgendaDialog,
  DialogRemoteMeetingDialog,
} from './meeting/meeting-creator/meeting-creator.component';
import {
  MeetingViewComponent,
  DialogEditAgendaItemDialog,
  DialogEditMeetingDialog,
  DialogAttandanceDialog,
  DialogRspDialog,
} from './meeting/meeting-view/meeting-view.component';
import { MinutesPageComponent } from './meeting/minutes-page/minutes-page.component';
import { MinutesCreatorPageComponent } from './meeting/minutes-creator-page/minutes-creator-page.component';
import { SpinnerViewComponent } from './dialogs/spinner-view/spinner-view.component';
import { UserPermissionDialog } from './dialogs/permissions/permissions.component';
import { SignaturePadComponent } from './dialogs/signature-pad/signature-pad.component';
import {
  ContractExecutionComponent,
  DialogEditContractDialog,
  DialogCreateContractFeedbackDialog,
} from './contract-page/contract-execution/contract-execution.component';
import { MeetingPageComponent } from './meeting/meeting-page/meeting-page.component';
import { SearchMemberDropdownComponent } from './search-member-dropdown/search-member-dropdown.component';
import { SearchGroupsMemberComponent } from './search-groups-member/search-groups-member.component';
import { ContractDocumentViwerComponent } from './contract-page/contract-document-viwer/contract-document-viwer.component';
import { ContractSigningComponent } from './contract-page/contract-signing/contract-signing.component';
import { ViewSignedDocumentComponent } from './view-signed-document/view-signed-document.component';
import { ZoomPageComponent } from './zoom/zoom-page/zoom-page.component';
import { MeetingAgendaOpenbookComponent } from './meetings/meeting-agenda-openbook/meeting-agenda-openbook.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    OrganizationComponent,
    CreationComponent,
    NotificationsComponent,
    CreateVoteDialog,
    DialogEditUserDialog,
    ResendCodeDialog,
    AddIpRangeDialog,
    DialogCreateGroupChatDialog,
    DialogCreatePrivateChatDialog,
    ManageTaskDialog,
    CreateTaskDialog,
    DialogDocumentDestinationDialog,
    DisplayResponseDialog,
    DialogDeleteUserDialog,
    DialogRegisterUserDialog,
    SignaturePadComponent,
    DialogCreateFileDialog,
    DialogCreateFolderDialog,
    UserPermissionDialog,
    DialogAddUserGroupDialog,
    CreateDepartmentDialog,
    NotificationDeleteDialog,
    NotificationMarkDialog,
    LandingPageComponent,
    VotingPageComponent,
    DialogEditAgendaItemDialog,
    DialogEditMeetingDialog,
    ViewDocumentComponent,
    LoadingShimmerComponent,
    UsersPageComponent,
    ResetPasswordPageComponent,
    ForgotPasswordPageComponent,
    UserProfileComponent,
    AdminNavigationComponent,
    AdminDashboardComponent,
    ResourcesComponent,
    LicensesComponent,
    VideogularPlayerComponent,
    VerifyUserPageComponent,
    TasksPageComponent,
    ESignaturePageComponent,
    SurveyCreatorComponent,
    SurveyViewPageComponent,
    SignatureViewPageComponent,
    SurveyResultsComponent,
    ChatPageComponent,
    CompliancePageComponent,
    ComplianceCreatorComponent,
    ComplianceViewComponent,
    DialogEditComplianceCheckDialog,
    DialogEditComplianceDialog,
    MeetingCreatorComponent,
    MeetingViewComponent,
    DialogEditAgendaDialog,
    DialogRemoteMeetingDialog,
    DialogAttandanceDialog,
    DialogRspDialog,
    MinutesPageComponent,
    MinutesCreatorPageComponent,
    SpinnerViewComponent,
    DialogEditUserGroupDialog,
    DialogEditProfileDialog,
    ActionsComponent,
    SignaturePadComponent,
    ContractViewComponent,
    ContractExecutionComponent,
    DialogEditContractDialog,
    DialogCreateContractFeedbackDialog,
    CreateLeadersDialog,
    CreateSocialMediaDialog,
    CreateContactDialog,
    MeetingPageComponent,
    SearchMemberDropdownComponent,
    SearchGroupsMemberComponent,
    ContractDocumentViwerComponent,
    ContractSigningComponent,
    ViewSignedDocumentComponent,
    ZoomPageComponent,
    MeetingAgendaOpenbookComponent,
  ],
  entryComponents: [
    ResendCodeDialog,
    UserPermissionDialog,
    DialogCreateFileDialog,
    DialogCreateFolderDialog,
    DialogDeleteUserDialog,
    DialogRegisterUserDialog,
    AddIpRangeDialog,
    DialogDocumentDestinationDialog,
    CreateVoteDialog,
    SignaturePadComponent,
    DialogEditUserDialog,
    NotificationDeleteDialog,
    NotificationMarkDialog,
    DisplayResponseDialog,
    CreateTaskDialog,
    ManageTaskDialog,
    DialogCreateGroupChatDialog,
    DialogCreatePrivateChatDialog,
    DialogEditComplianceCheckDialog,
    DialogEditComplianceDialog,
    DialogEditAgendaDialog,
    DialogRemoteMeetingDialog,
    DialogEditAgendaItemDialog,
    DialogEditMeetingDialog,
    DialogAttandanceDialog,
    DialogRspDialog,
    DialogAddUserGroupDialog,
    CreateDepartmentDialog,
    DialogEditUserGroupDialog,
    DialogEditProfileDialog,
    DialogEditContractDialog,
    CreateLeadersDialog,
    CreateSocialMediaDialog,
    CreateContactDialog,
  ],

  imports: [
    BrowserModule,
    AngularEditorModule,
    MatPaginatorModule,
    AppRoutingModule,
    MatBottomSheetModule,
    MatDividerModule,
    CommonModule,
    MatSortModule,
    NgxMatMomentModule,
    MatRadioModule,
    MatMomentDateModule,
    NgxShimmerLoadingModule,
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    MatSnackBarModule,
    HttpClientModule,
    MatTableModule,
    MatTooltipModule,
    NgxDropzoneModule,
    MatChipsModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatSelectModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    LayoutModule,
    MatTreeModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatBadgeModule,
    MatTabsModule,
    MatDatepickerModule,
    FlexLayoutModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatCheckboxModule,
    DataTablesModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    SignaturePadModule,
    DragDropModule,
    MatAutocompleteModule,
    MatRippleModule,
    ChartsModule,
    MatStepperModule,
    NgxMatSelectSearchModule,
    QuillModule.forRoot({
      modules: {
        syntax: false,
        toolbar: [
          ['bold', 'italic', 'underline'], // toggled buttons
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
        ],
      },
    }),
    NgMultiSelectDropDownModule.forRoot(),
  ],
  providers: [
    BnNgIdleService,
    MatDatepickerModule,
    ApiManagerService,
    DatePipe,
    {
      provide: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS,
      useValue: { panelClass: 'bottom-sheet' },
    },
    { provide: MAT_DIALOG_DATA, useValue: {} },
    { provide: MatDialogRef, useValue: {} },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppModule {}
