import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PatientService } from 'src/app/services/patient.service';
import { Bundle, BundleEntry, HumanName, Identifier, Patient } from 'fhir/r4';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PatientFormDialogComponent } from '../patient-form-dialog/patient-form-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DeleteItemDialogComponent } from '../../core/delete-item-dialog/delete-item-dialog.component';
import { PatientViewDialogComponent } from '../patient-view-dialog/patient-view-dialog.component';
import { PaginationMetadata } from 'src/app/models/pagination-metadata.model';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatExpansionModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatToolbarModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent {
  pageSize: number = 20;
  pageNumber: number = 0;
  totalCount: number = 0;
  defaultLink: string = `?_count=${this.pageSize}`;
  nextLink: string = '';
  prevLink: string = '';
  patientBundle!: Bundle<Patient>;
  patients: BundleEntry<Patient>[] | undefined = [];
  paginationMetadata: PaginationMetadata = new PaginationMetadata;

  displayedColumns: string[] = [ "id", 'mrn', 'givenName', 'familyName', 'gender', 'birthDate', 'actions' ];
  dataSource = new MatTableDataSource<BundleEntry<Patient>>(this.patients);

  constructor(private patientService: PatientService, private dialog: MatDialog, private snackBar: MatSnackBar) {
    this.getPatients(this.defaultLink);
  }

  getPatients(queryString: string) {
    this.patientService.list(queryString).subscribe(data => {
      this.patientBundle = data;
      this.patients = data.entry; 

      this.totalCount = data.total ? data.total : 0;
      
      if(data.link) {
        let next = data.link.find(x => x.relation === "next");
        this.nextLink = next ? next.url : '';

        let prev = data.link.find(x => x.relation === "previous");
        this.prevLink = prev ? prev.url : '';
      }
    });
  }

  pagedEvent(event: PageEvent) {
    if(this.pageSize != event.pageSize) {
      this.pageNumber = 0;
      this.pageSize = event.pageSize;
      this.defaultLink = `?_count=${this.pageSize}`;
      this.getPatients(this.defaultLink);
    }
    else if(this.pageNumber < event.pageSize) {
      this.getPatients(this.nextLink);
    }
    else {
      this.getPatients(this.prevLink);
    }
  }

  getMRN(identifiers: Identifier[]) {
    if(identifiers) {
      let mrn: String | undefined = '';
      for(var identifier of identifiers) {
        let mrnIndex = identifier.type?.coding?.map(x => x.code).indexOf('MR');
        if(mrnIndex != undefined && mrnIndex != -1) {
          mrn = identifier.value;      
          break;
        }
      }    
      return mrn;
    }
    else {
      return '';
    }
  }

  getGivenName(name: HumanName[]) {
    let officialIndex = name.map(x => x.use).indexOf('official');
    if(officialIndex != -1) {
      return name[officialIndex].given;  
    }
    else if(name.length > 0) { //use the first name found
      return name[0].given;
    }
    else {
      return 'No name found.';
    }
  }

  getFamilyName(name: HumanName[]) {
    let officialIndex = name.map(x => x.use).indexOf('official');
    if(officialIndex != -1) {
      return name[officialIndex].family;  
    }
    else if(name.length > 0) { //use the first name found
      return name[0].family;
    }
    else {
      return 'No name found.';
    }
  }

  showPatientViewDialog($event: Event, row: BundleEntry<Patient>) : void {

    let patient = row.resource;

    this.dialog.open(PatientViewDialogComponent,
      {
        width: '75%',
        data: { dialogTitle: `Patient record for ${patient && patient.name ? patient.name[0].given + ' ' +  patient.name[0].family : 'unknown'}`, patient: patient }
      });
  }

  showCreatePatientDialog() : void {

    this.dialog.open(PatientFormDialogComponent,
      {
        width: '75%',
        data: { dialogTitle: `Create a new Patient`, patient: null }
      }).afterClosed().subscribe(res => {
        console.log(res)
        if (res) {
          this.getPatients(this.defaultLink);
          this.snackBar.open(`${res}`, '', {
            duration: 3500,
            panelClass: 'success-snackbar',
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });
  }

  showEditNotificationConfigurationDialog($event: Event, row: BundleEntry<Patient>): void {

    //prevent the row from expanding
    $event.stopPropagation();

    let patient = row.resource;

    if(patient) {
      this.dialog.open(PatientFormDialogComponent,
        {
          width: '75%',
          data: { dialogTitle: `Edit patient record for ${patient && patient.name ? patient.name[0]._given + ' ' +  patient.name[0].family : 'unknown'}`, patient: patient }
        }).afterClosed().subscribe(res => {       
          if (res) {
            this.getPatients(this.defaultLink);
            this.snackBar.open(`${res}`, '', {
              duration: 3500,
              panelClass: 'success-snackbar',
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          }
        });
    }
    else {
      this.snackBar.open(`Invalid patient resource`, '', {
        duration: 3500,
        panelClass: 'error-snackbar',
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
    
  }

  showDeleteItemDialog($event: Event, row: BundleEntry<Patient>) {

    //prevent the row from expanding
    $event.stopPropagation();

    let patient = row.resource;
    let patientId = patient?.id ? patient.id : '';

    if(patient && patientId.length > 0) {
      this.dialog.open(DeleteItemDialogComponent,
        {
          width: '50%',
          data: {
            dialogTitle: 'Delete Patient',
            dialogMessage: `Are you sure you want to delete the patient record '${patientId}'?`
          }
        }).afterClosed().subscribe(res => {
          if (res) {
            this.patientService.delete(patientId).subscribe(outcome => {
              this.getPatients(this.defaultLink);
              this.snackBar.open(`Successfully deleted the notification configuration for ${patient && patient.name ? patient.name[0]._given + ' ' +  patient.name[0].family : 'unknown'}`, '', {
                duration: 3500,
                panelClass: 'success-snackbar',
                horizontalPosition: 'end',
                verticalPosition: 'top'
              });
            });
          }
        });      
    }
    else {
      this.snackBar.open(`Invalid patient id ${patientId}`, '', {
        duration: 3500,
        panelClass: 'error-snackbar',
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }

    
  }
  
}
