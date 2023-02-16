import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page/login-page.component';
import { ActionsComponent } from './Actions/actions-page.component';
import { OrganizationComponent } from './organization/organization.component';
import { CreationComponent } from './contract-page/contract-creation/creation.component';
import { ContractViewComponent } from './contract-page/contract-view/contract-view-component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { VotingPageComponent } from './voting/voting-page.component';
import { UsersPageComponent } from './users-page/users-page.component';
import { ForgotPasswordPageComponent } from './forgot-password-page/forgot-password-page.component';
import { ResetPasswordPageComponent } from './reset-password-page/reset-password-page.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ResourcesComponent } from './resources/resources.component';
import { VerifyUserPageComponent } from './verify-user-page/verify-user-page.component';
import { TasksPageComponent } from './tasks-page/tasks-page.component';
import { MinutesPageComponent } from './meeting/minutes-page/minutes-page.component';
import { LicensesComponent } from './licenses/licenses.component';
import { ESignaturePageComponent } from './eSignature/e-signature-page/e-signature-page.component';
import { SurveyCreatorComponent } from './survey/survey-creator/survey-creator.component';
import { SurveyViewPageComponent } from './survey/survey-view-page/survey-view-page.component';
import { SignatureViewPageComponent } from './eSignature/signature-view-page/signature-view-page.component';
import { SurveyResultsComponent } from './survey/survey-results/survey-results.component';
import { ChatPageComponent } from './chat/chat-page/chat-page.component';
import { CompliancePageComponent } from './compliance/compliance-page/compliance-page.component';
import { ComplianceCreatorComponent } from './compliance/compliance-creator/compliance-creator.component';
import { ComplianceViewComponent } from './compliance/compliance-view/compliance-view.component';
import { MeetingCreatorComponent } from './meeting/meeting-creator/meeting-creator.component';
import { MeetingViewComponent } from './meeting/meeting-view/meeting-view.component';
import { MinutesCreatorPageComponent } from './meeting/minutes-creator-page/minutes-creator-page.component';
import { ContractExecutionComponent } from './contract-page/contract-execution/contract-execution.component';
import { MeetingPageComponent } from './meeting/meeting-page/meeting-page.component';
import {OpenBookComponent} from './meeting/meeting-agenda-openbook/meeting-openbook.component';
import {MeetingAgendaOpenbookComponent} from "./meetings/meeting-agenda-openbook/meeting-agenda-openbook.component";

const routes: Routes = [
  {
    path: 'admin',
    component: AdminDashboardComponent,
    children: [
      {path: 'meeting-openbook', component: MeetingAgendaOpenbookComponent},
      {path: 'meeting-openbook2', component: OpenBookComponent},
      { path: 'landing-page', component: LandingPageComponent },
      { path: 'organization-page', component: OrganizationComponent },
      {
        path: 'meeting-creation-page',
        component: MeetingCreatorComponent,
      },

      { path: 'meeting-page/:id', component: MeetingPageComponent,
        // children: [
        //   {path: 'meeting-openbook', component: OpenBookComponent},
        //   {
        //     path: 'meeting-view-page',
        //     component: MeetingViewComponent,
        //   },
        // ]
      },
      {
        path: 'meeting-view-page',
        component: MeetingViewComponent,
        children: [
          // {path: 'meeting-openbook', component: OpenBookComponent},

        ]
      },
      {
        path: 'minutes-page',
        component: MinutesPageComponent,
      },
      {
        path: 'minutes-creator-page',
        component: MinutesCreatorPageComponent,
      },

      { path: 'survey-creator', component: SurveyCreatorComponent },
      { path: 'survey-view', component: SurveyViewPageComponent },
      { path: 'survey-results', component: SurveyResultsComponent },
      { path: 'resources-page', component: ResourcesComponent },
      { path: 'licenses-page', component: LicensesComponent },
      { path: 'chat-page', component: ChatPageComponent },

      { path: 'actions/:action', component: ActionsComponent },
      { path: 'voting-page', component: VotingPageComponent },
      { path: 'contract-page', component: ContractViewComponent },
      { path: 'contract-creation', component: CreationComponent },
      {
        path: 'contract-execution-page',
        component: ContractExecutionComponent,
      },
      { path: 'user-profile-page', component: UserProfileComponent },
      { path: 'tasks-page', component: TasksPageComponent },
      { path: 'signature-page', component: ESignaturePageComponent },
      { path: 'signature-view-page', component: SignatureViewPageComponent },
      { path: 'compliance-page', component: CompliancePageComponent },
      { path: 'compliance-creator', component: ComplianceCreatorComponent },
      { path: 'compliance-view', component: ComplianceViewComponent },
      { path: 'users-page', component: UsersPageComponent },

      { path: '**', redirectTo: '/landing-page', pathMatch: 'full' },
    ],
  },
  { path: 'login-page', component: LoginPageComponent },
  { path: 'verify-user', component: VerifyUserPageComponent },
  { path: 'reset-password-page', component: ResetPasswordPageComponent },
  { path: 'forgot-password-page', component: ForgotPasswordPageComponent },
  { path: '**', redirectTo: '/login-page', pathMatch: 'full' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
