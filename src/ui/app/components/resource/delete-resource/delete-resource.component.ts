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
import { ResourceService } from '@/ui/app/services/core/resource.service';
import { Resource } from 'fhir/r4';

@Component({
    selector: 'app-delete-resource',
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
    templateUrl: './delete-resource.component.html',
    styleUrls: ['./delete-resource.component.scss']
})
export class DeleteResourceComponent implements OnInit {
  resourceForm!: FormGroup;
  resourceTypes: string[] = this.resourceService.AvailableResources;
  resource: Resource | undefined;

  constructor(private resourceService: ResourceService, private snackBar: MatSnackBar) {}
  
  ngOnInit(): void {
    this.resourceForm = new FormGroup({
      resourceType: new FormControl('', Validators.required),
      id: new FormControl('', Validators.required)        
    });  
  }

  get resourceTypeControl() : FormControl {
    return this.resourceForm.get('resourceType') as FormControl;
  }

  get resourceIdControl() : FormControl {
    return this.resourceForm.get('id') as FormControl;
  }

  deleteResource() {
    if(this.resourceForm.valid) {
      this.resourceService.deleteResource(this.resourceTypeControl.value, this.resourceIdControl.value).subscribe(data => {
        this.resource = data as Resource;
  
        this.snackBar.open(`${this.resourceTypeControl.value} resource was deleted.`, '', {
          duration: 3500,
          panelClass: 'success-snackbar',
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
  
      });
    }
    
  }
}
