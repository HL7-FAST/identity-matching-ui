import { Component, OnInit } from '@angular/core';

import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Resource } from 'fhir/r4';
import { ResourceService } from '@/ui/app/services/core/resource.service';

@Component({
    selector: 'app-update-resource',
    imports: [
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
    MatSnackBarModule
],
    templateUrl: './update-resource.component.html',
    styleUrls: ['./update-resource.component.scss']
})
export class UpdateResourceComponent implements OnInit {
  resourceForm!: FormGroup;
  resourceTypes: string[] = this.resourceService.AvailableResources;
  resource: Resource | undefined;

  constructor(private resourceService: ResourceService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.resourceForm = new FormGroup({
      resourceType: new FormControl('', Validators.required),
      id: new FormControl('', Validators.required),
      resourceContent: new FormControl('', Validators.required)        
    });  
  }

  get resourceTypeControl() : FormControl {
    return this.resourceForm.get('resourceType') as FormControl;
  }

  get resourceIdControl() : FormControl {
    return this.resourceForm.get('id') as FormControl;
  }

  get resourceContentControl() : FormControl {
    return this.resourceForm.get('resourceContent') as FormControl;
  }

  createResource() {
    if(this.resourceForm.valid) {

      const newResource = JSON.parse(this.resourceContentControl.value) as Resource;  
      newResource.id = this.resourceIdControl.value;      

      this.resourceService.updateResource(this.resourceTypeControl.value, this.resourceIdControl.value, newResource).subscribe(data => {
        this.resource = data as Resource;
  
        this.snackBar.open(`${this.resourceTypeControl.value} resource was updated.`, '', {
          duration: 3500,
          panelClass: 'success-snackbar',
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });  
      });
    }
    else {
      this.snackBar.open(`The ${this.resourceTypeControl.value} resource cannot updated until all fields are valid.`, '', {
        duration: 3500,
        panelClass: 'warning-snackbar',
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });  
    }
    
  }

}