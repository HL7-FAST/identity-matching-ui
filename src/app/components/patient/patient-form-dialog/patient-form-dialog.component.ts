import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, KeyValue } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CodeableConcept, Patient } from 'fhir/r4';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PatientService } from 'src/app/services/patient.service';
import { FormMode } from 'src/app/models/FormMode.enum';

@Component({
  selector: 'app-patient-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,    
    MatIconModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatSnackBarModule    
  ],
  templateUrl: './patient-form-dialog.component.html',
  styleUrls: ['./patient-form-dialog.component.scss']
})
export class PatientFormDialogComponent implements OnInit { 
  patientForm!: FormGroup;
  formMode!: FormMode;

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

  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { dialogTitle: string, patient: Patient },
    private dialogRef: MatDialogRef<PatientFormDialogComponent>, 
    private snackBar: MatSnackBar, 
    private patientService: PatientService) {}

  ngOnInit(): void {

    this.formMode = this.data.patient ? FormMode.Edit : FormMode.Create;
    
    this.patientForm = new FormGroup({
      resourceType: new FormControl('Patient'),
      id: new FormControl(this.data.patient ? this.data.patient.id : '', Validators.required),      
      name: new FormGroup({
        given: new FormControl(this.data.patient && this.data.patient.name ? this.data.patient.name[0].given : '', Validators.required),
        family: new FormControl(this.data.patient && this.data.patient.name ? this.data.patient.name[0].family : '', Validators.required)
      }),
      gender: new FormControl(this.data.patient ? this.data.patient.gender : '', Validators.required),
      birthDate: new FormControl(this.data.patient ? this.data.patient.birthDate : '', Validators.required),
      address: new FormGroup({
        line: new FormControl(this.data.patient && this.data.patient.address ? this.data.patient.address[0].line : '', Validators.required),
        city: new FormControl(this.data.patient && this.data.patient.address ? this.data.patient.address[0].city : '', Validators.required),
        state: new FormControl(this.data.patient && this.data.patient.address ? this.data.patient.address[0].state : '', Validators.required),
        postalCode: new FormControl(this.data.patient && this.data.patient.address ? this.data.patient.address[0].postalCode : '', Validators.required)        
      }),
      telecom: new FormArray([]),
      identifier: new FormArray([])
    });   

    //add identifiers if any exist
    if(this.data.patient && this.data.patient.identifier != undefined && this.data.patient.identifier.length > 0) {
      for(var identifier of this.data.patient.identifier) {

        let identifierFormGroup = new FormGroup({
          type: new FormControl({}, Validators.required),
          system: new FormControl(identifier.system, Validators.required),
          value: new FormControl(identifier.value, Validators.required)
        });
    
        identifierFormGroup.get('type')?.valueChanges.subscribe(change => {
          let concept: CodeableConcept = change as CodeableConcept;  
          let systemValue: any = concept.coding ? concept.coding[0].system : '';
          identifierFormGroup.get('system')?.setValue(systemValue);      
        });

        let codeableConceptIndex = this.identifierTypes.findIndex(x => x.value.text === identifier.type?.text);        
        if(codeableConceptIndex != -1) {
          identifierFormGroup.get('type')?.setValue(this.identifierTypes[codeableConceptIndex].value);
          identifierFormGroup.get('type')?.updateValueAndValidity();
        }        
    
        this.identifierForms.push(identifierFormGroup);
        this.identifierForms.updateValueAndValidity();
      }
    }   

    //add telecoms if any exist
    if(this.data.patient && this.data.patient.telecom != undefined && this.data.patient.telecom.length > 0) {
      for(var telecom of this.data.patient.telecom) {

        let telecomFormGroup = new FormGroup({
          system: new FormControl(telecom.system, Validators.required),
          use: new FormControl(telecom.use, Validators.required),
          value: new FormControl(telecom.value, Validators.required)
        });       
                
        this.telecomForms.push(telecomFormGroup);
        this.telecomForms.updateValueAndValidity();
      }
    }   

  }

   //Form Mode enum getter
   get FormMode(): typeof FormMode {
    return FormMode;
  }

  get idControl() : FormControl {
    return this.patientForm.get('id') as FormControl;
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
  
  birthDateControl() : FormControl {
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
      system: new FormControl('', Validators.required),
      use: new FormControl('', Validators.required),
      value: new FormControl('', Validators.required)
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
      type: new FormControl('', Validators.required),
      system: new FormControl('', Validators.required),
      value: new FormControl('', Validators.required)
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

  // validateEmailAddress(email: string) {
  //   var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  //   if (email.match(mailformat)) {
  //     return true;
  //   }
  //   else {
  //     this.snackBar.open(`'${email}' is not a valid email address.`, '', {
  //       duration: 3500,
  //       panelClass: 'error-snackbar',
  //       horizontalPosition: 'end',
  //       verticalPosition: 'top'
  //     });
  //     return false;
  //   }
  // }

  onSubmit() {
    if (this.patientForm.valid) {
      const patientData: Patient = this.patientForm.value;     
      
      if(this.formMode == FormMode.Create) {
        this.patientService.create(patientData).subscribe(data => {
          console.log(data);
          if(data) {
            this.dialogRef.close(data);
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
      else {
        this.patientService.update(patientData).subscribe(data => {
          console.log(data);
          if(data) {
            this.dialogRef.close(data);
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

      console.log(patientData);
    }
  }

}
