import { Component, OnInit } from '@angular/core';
import { CommonModule, KeyValue } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import {Clipboard} from '@angular/cdk/clipboard';

import { PatientService } from 'src/app/services/patient.service';
import { CodeableConcept, Patient, Parameters, Bundle, BundleEntry, Identifier, HumanName } from 'fhir/r4';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PatientViewDialogComponent } from '../patient-view-dialog/patient-view-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-patient-match',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatToolbarModule,
    MatCardModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatTabsModule,
    MatTableModule,
    MatDialogModule
  ],
  templateUrl: './patient-match.component.html',
  styleUrls: ['./patient-match.component.scss']
})
export class PatientMatchComponent implements OnInit {
  patientForm!: FormGroup;
  matchResults!: Bundle;
  patients: BundleEntry<Patient>[] | undefined = [];

  displayedColumns: string[] = [ "id", 'mrn', 'givenName', 'familyName', 'gender', 'birthDate', 'score' ];
  dataSource = new MatTableDataSource<BundleEntry<Patient>>(this.patients);
  
  genderOptions: string[] = ['male', 'female', 'other', 'uknown'];
  telecomSystems: string[] = ['phone', 'fax', 'email', 'pager', 'url', 'sms', 'other'];
  telecomUseCases: string[] = ['home', 'work', 'temp', 'old', 'mobile'];
  identifierTypes: KeyValue<string, CodeableConcept>[] = [
      { key: "Medical Record Number", 
        value: { 
        "coding": [
          {
              "system": "https://terminology.hl7.org/CodeSystem/v2-0203",
              "code": "MR",
              "display": "Medical Record Number"
          }
        ],
        "text": "Medical Record Number"
      }
    },
    {
      key: "Social Security Number",
      value: {
        "coding": [
            {
                "system": "https://terminology.hl7.org/CodeSystem/v2-0203",
                "code": "SS",
                "display": "Social Security Number"
            }
        ],
        "text": "Social Security Number"
      }
    },
    {
      key: "Driver's License",
      value: {
        "coding": [
            {
                "system": "https://terminology.hl7.org/CodeSystem/v2-0203",
                "code": "DL",
                "display": "Driver's License"
            }
        ],
        "text": "Driver's License"
      }
    },
    {
      key: "Passport Number",
      value: {
        "coding": [
            {
                "system": "https://terminology.hl7.org/CodeSystem/v2-0203",
                "code": "PPN",
                "display": "Passport Number"
            }
        ],
        "text": "Passport Number"
    }
    }
  ];
  constructor(private patientService: PatientService, private dialog: MatDialog, private snackBar: MatSnackBar, private clipboard: Clipboard) {}
  
  ngOnInit(): void {
    
    this.patientForm = new FormGroup({
      resourceType: new FormControl('Patient'),        
      name: new FormGroup({
        given: new FormControl(''),
        family: new FormControl('')
      }),
      gender: new FormControl( ''),
      birthDate: new FormControl(''),
      address: new FormGroup({
        line: new FormControl(''),
        city: new FormControl(''),
        state: new FormControl(''),
        postalCode: new FormControl('')        
      }),
      telecom: new FormArray([]),
      identifier: new FormArray([])
    });   
  }  

  get resourceTypeControl() : FormControl {
    return this.patientForm.get('resourceType') as FormControl;
  }

  get givenNameControl() : FormControl {
    return this.patientForm.get('name.given') as FormControl;
  }

  get familyNameControl() : FormControl {
    return this.patientForm.get('name.family') as FormControl;
  }

  get genderControl() : FormControl {
    return this.patientForm.get('gender') as FormControl;
  }
  
  get birthDateControl() : FormControl {
    return this.patientForm.get('birthDate') as FormControl;
  }

  get addressLineControl() : FormControl {
    return this.patientForm.get('address.line') as FormControl;
  }  

  get cityControl() : FormControl {
    return this.patientForm.get('address.city') as FormControl;
  }

  get stateControl() : FormControl {
    return this.patientForm.get('address.state') as FormControl;
  }

  get postalCodeControl() : FormControl {
    return this.patientForm.get('address.postalCode') as FormControl;
  }

  get telecomForms() : FormArray {
    return this.patientForm.get('telecom') as FormArray;
  }

  addTelecom() {
    const telecomFormGroup = new FormGroup({      
      system: new FormControl(''),
      use: new FormControl(''),
      value: new FormControl('')
    });

    telecomFormGroup.get('system')?.valueChanges.subscribe(change => {

      if(change === 'email') {
        telecomFormGroup.get('value')?.addValidators(Validators.email);
        telecomFormGroup.updateValueAndValidity();
      }
      else {
        telecomFormGroup.get('value')?.removeValidators(Validators.email);
        telecomFormGroup.updateValueAndValidity();
      }
      
    });

    this.telecomForms.push(telecomFormGroup);
    this.telecomForms.updateValueAndValidity();
  }

  removeTelecom(index: number) {
    this.telecomForms.removeAt(index);
    this.telecomForms.updateValueAndValidity();
  }
  
  compareTelecomTypes(object1: any, object2: any) {
    return (object1 && object2) && object1 === object2;
  }

  get identifierForms() : FormArray {
    return this.patientForm.get('identifier') as FormArray;
  }  

  addIdentifier() {
    const identifierFormGroup = new FormGroup({
      type: new FormControl(''),
      system: new FormControl(''),
      value: new FormControl('')
    });

    identifierFormGroup.get('type')?.valueChanges.subscribe(change => {
      let concept: CodeableConcept = change as CodeableConcept;  
      let systemValue: any = concept.coding ? concept.coding[0].system : '';
      identifierFormGroup.get('system')?.setValue(systemValue);      
    });

    this.identifierForms.push(identifierFormGroup);
    this.identifierForms.updateValueAndValidity();
  }

  removeIdentifier(index: number) {
    this.identifierForms.removeAt(index);
    this.identifierForms.updateValueAndValidity();
  }
  
  compareIdentifierTypes(object1: any, object2: any) {
    return (object1 && object2) && object1.coding[0].code === object2.coding[0].code;
  }

  clearSearchParameters() {
    this.patientForm.reset();
    this.postalCodeControl.setValue('');
    this.resourceTypeControl.setValue('Patient');
    this.identifierForms.clear();
    this.telecomForms.clear();    
    this.patientForm.updateValueAndValidity();
  }

  onSubmit() {
    if (this.patientForm.valid) {
      const patientData: Patient = this.patientForm.value;       
      
      let matchParam: Parameters = { resourceType: "Parameters" };
      matchParam.parameter = [];
      matchParam.parameter = [
        { name: "resource", resource: patientData },
        { name: "count", valueInteger: 5 },
        { name: "onlyCertainMatches", valueBoolean: false }
      ];   

      this.patientService.match(matchParam).subscribe(data => {          
        if(data) {
          this.matchResults = data; 
          if(data.entry != undefined && data.entry.length > 0) {
            this.patients = data.entry as BundleEntry<Patient>[];
          } 
          else {
            this.patients = [];
          }          
                  
          this.snackBar.open(`${this.matchResults.entry ? this.matchResults.entry.length : 0} possible matches found.`, '', {
            duration: 3500,
            panelClass: 'success-snackbar',
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }        
        else {
          this.snackBar.open(`Failed to create patient, see console for details.`, '', {
            duration: 3500,
            panelClass: 'error-snackbar',
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });             
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

  copyResults() {
    this.clipboard.copy(JSON.stringify(this.matchResults, null, 2));

    this.snackBar.open(`Match results were copied.`, '', {
      duration: 3500,
      panelClass: 'success-snackbar',
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

}
