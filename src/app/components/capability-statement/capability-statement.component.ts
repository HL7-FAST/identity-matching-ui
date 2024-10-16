import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import {Clipboard} from '@angular/cdk/clipboard';
import { ResourceService } from 'src/app/services/core/resource.service';
import { CapabilityStatement, CapabilityStatementRestResource, CapabilityStatementRestResourceOperation } from 'fhir/r4';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-capability-statement',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule
  ],
  templateUrl: './capability-statement.component.html',
  styleUrls: ['./capability-statement.component.scss']
})
export class CapabilityStatementComponent implements OnInit {
  fhirServerForm!: FormGroup;
  capabilityStatement!: CapabilityStatement;
  
  patientResourceCapabilities!: CapabilityStatementRestResource;
  patientEverythingOperationCapability: boolean = false;
  patientFastIdentityMatchingOperationCapability: boolean = false;

  constructor(private resourceService: ResourceService, private snackBar: MatSnackBar, private clipboard: Clipboard) {}
  
  ngOnInit(): void {
    this.fhirServerForm = new FormGroup({
      fhirSever: new FormControl('', Validators.required)
    });
  }

  get fhirServerControl() : FormControl {
    return this.fhirServerForm.get('fhirSever') as FormControl;
  }

  getCapabilityStatement() {
    if(this.fhirServerForm.valid) {
      this.resourceService.getCapabilityStatement(this.fhirServerControl.value).subscribe(data => {
        if(data) {
          this.capabilityStatement = data;   
          
          //determine capabilities
          this.patientEverythingOperationCapability = this.serverHasPatientEverythingOperation();
          this.patientFastIdentityMatchingOperationCapability = this.serverHasFastIdentityMatchingOperation();
                  
          this.snackBar.open(`Capability statement for ${this.fhirServerControl.value} retrieved.`, '', {
            duration: 3500,
            panelClass: 'success-snackbar',
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }        
        else {
          this.snackBar.open(`No capability statement for ${this.fhirServerControl.value} was found.`, '', {
            duration: 3500,
            panelClass: 'error-snackbar',
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });     
    }
    else {
      this.snackBar.open(`You must provide a valid fhir server url.`, '', {
        duration: 3500,
        panelClass: 'error-snackbar',
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  copyCapabilityStatement() {
    this.clipboard.copy(JSON.stringify(this.capabilityStatement, null, 2));

    this.snackBar.open(`Capability statement was copied.`, '', {
      duration: 3500,
      panelClass: 'success-snackbar',
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });

  }

  get patientReourceCapabilities() : CapabilityStatementRestResource | null {
    if(this.capabilityStatement && this.capabilityStatement.rest) {
      let patientResourceCapabilities = this.capabilityStatement.rest[0].resource?.filter(x => x.type === "Patient");
      if(patientResourceCapabilities != undefined) {
        this.patientResourceCapabilities = patientResourceCapabilities[0];    
        return this.patientResourceCapabilities;    
      }
      else{
        return null;
      }
    }
    else {
      return null;
    }
  }

  serverHasPatientEverythingOperation() : boolean {
    if(this.patientReourceCapabilities?.operation) {
      return this.serverHasOperation(this.patientReourceCapabilities?.operation, "everything");
    }
    else
    {
      return false;
    }    
  }

  serverHasFastIdentityMatchingOperation() : boolean {
    if(this.patientReourceCapabilities?.operation) {
      return this.serverHasOperation(this.patientReourceCapabilities?.operation, "idi-match");
    }
    else
    {
      return false;
    }
  }

  serverHasOperation(operations: CapabilityStatementRestResourceOperation[], operationName: string) : boolean {
    let operationIndex = operations.findIndex(x => x.name === operationName);
    return operationIndex == -1 ? false : true;
  }

}
