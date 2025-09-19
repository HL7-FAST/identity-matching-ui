import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceService } from '@/ui/app/services/core/resource.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import {Clipboard} from '@angular/cdk/clipboard';
import { Resource } from 'fhir/r4';

@Component({
    selector: 'app-view-resource',
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
        MatSnackBarModule
    ],
    templateUrl: './view-resource.component.html',
    styleUrls: ['./view-resource.component.scss']
})
export class ViewResourceComponent implements OnInit {
  private resourceService = inject(ResourceService);
  private clipboard = inject(Clipboard);
  private snackBar = inject(MatSnackBar);

  resourceForm!: FormGroup;
  resourceTypes: string[] = this.resourceService.AvailableResources;
  resource: Resource | undefined;
  
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

  getResource() {
    this.resourceService.getResource(this.resourceTypeControl.value, this.resourceIdControl.value).subscribe(data => {
      this.resource = data as Resource;

      this.snackBar.open(`${this.resourceTypeControl.value} resource was retrieved.`, '', {
        duration: 3500,
        panelClass: 'success-snackbar',
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });

    })
  }

  copyResource() {
    this.clipboard.copy(JSON.stringify(this.resource, null, 2));

    this.snackBar.open(`${this.resourceTypeControl.value} resource was copied.`, '', {
      duration: 3500,
      panelClass: 'success-snackbar',
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });

  }

}
