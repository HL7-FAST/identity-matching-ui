import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard/admin-dashboard.component';
import { ViewResourceComponent } from './components/resource/view-resource/view-resource.component';
import { CreateResourceComponent } from './components/resource/create-resource/create-resource.component';
import { UpdateResourceComponent } from './components/resource/update-resource/update-resource.component';
import { DeleteResourceComponent } from './components/resource/delete-resource/delete-resource.component';
import { PatientListComponent } from './components/patient/patient-list/patient-list.component';
import { PatientMatchComponent } from './components/patient/patient-match/patient-match.component';
import { CapabilityStatementComponent } from './components/capability-statement/capability-statement.component';
import { UnauthorizedComponent } from './components/core/unauthorized/unauthorized.component';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'view-resource', component: ViewResourceComponent },
  { path: 'create-resource', component: CreateResourceComponent },
  { path: 'update-resource', component: UpdateResourceComponent },
  { path: 'delete-resource', component: DeleteResourceComponent },
  { path: 'patient-list', component: PatientListComponent },
  { path: 'patient-match', component: PatientMatchComponent },
  { path: 'capability-statement', component: CapabilityStatementComponent },
  { path: 'unauthorized', component: UnauthorizedComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
