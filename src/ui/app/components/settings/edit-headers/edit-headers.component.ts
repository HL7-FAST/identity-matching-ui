import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { isPlatformBrowser } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomHeader } from '@/lib/utils/http';
import { MatCardModule } from '@angular/material/card';
import { InfoCardComponent } from "../../core/info-card/info-card.component";

@Component({
  selector: 'app-edit-headers',
  templateUrl: './edit-headers.component.html',
  styleUrls: ['./edit-headers.component.scss'],
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule,
    InfoCardComponent
]
})
export class EditHeadersComponent implements OnInit {
  displayedColumns: string[] = ['actions', 'key', 'value'];
  dataSource = new MatTableDataSource<CustomHeader>([]);

  rowCopy: CustomHeader = { key: '', value: '' };
  editingRowIndex: number | null = null;
  
  platformId = inject(PLATFORM_ID);
  snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadHeaders();
  }

  loadHeaders(): void {
    this.dataSource.data = [];
    if (isPlatformBrowser(this.platformId)) {
      const headers = localStorage.getItem('custom-headers');
      if (headers) {
        try {
          this.dataSource.data = JSON.parse(headers);
        } catch (e) {
          console.error('Failed to parse custom headers from localStorage', e);
          this.snackBar.open('Failed to load custom headers', 'Dismiss', { 
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      }
    }
  }

  addHeader(): void {

    // If the first row is already being edited, do not add a new one
    if (this.editingRowIndex === 0) {
      return;
    }

    // Create a new header object with empty values
    const newHeader: CustomHeader = { key: '', value: '' };
    this.rowCopy = { ...newHeader };
    
    // Add to the beginning of the array to make it more visible
    this.dataSource.data = [newHeader, ...this.dataSource.data];
    
    // Start editing the new header immediately
    this.editingRowIndex = 0;
  }

  editHeader(index: number): void {
    this.editingRowIndex = index;
    this.rowCopy = { ...this.dataSource.data[index] };
  }

  cancelEdit(index: number): void {
    console.log('Cancelling edit for header', index, this.dataSource.data[index]);
    // If it was a new header with no key, remove it
    if (!this.dataSource.data[index].key) {
      this.dataSource.data = this.dataSource.data.filter((_, i) => i !== index);
    } else {
      // Otherwise, just reset the editing row
      this.dataSource.data[index] = { ...this.rowCopy };
    }
    this.editingRowIndex = null;
    this.rowCopy = { key: '', value: '' };
  }

  saveHeader(index: number): void {
    if (!this.rowCopy.key) {
      this.snackBar.open('Header key is required', 'Dismiss', { 
        duration: 5000,
        panelClass: 'error-snackbar'
      });
      return;
    }
    
    this.editingRowIndex = null;
    this.dataSource.data[index] = { ...this.rowCopy };
    this.dataSource.data = [...this.dataSource.data];
    this.rowCopy = { key: '', value: '' };

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('custom-headers', JSON.stringify(this.dataSource.data));
    }

  }

  deleteHeader(index: number): void {
    // If it doesn't have a key, it's a new header
    this.dataSource.data = this.dataSource.data.filter((_, i) => i !== index);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('custom-headers', JSON.stringify(this.dataSource.data));
    }
  }
}