import { Component, OnInit, inject } from '@angular/core';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-delete-item-dialog',
    imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule
],
    templateUrl: './delete-item-dialog.component.html',
    styleUrls: ['./delete-item-dialog.component.scss']
})
export class DeleteItemDialogComponent implements OnInit {
  data = inject<{
    dialogTitle: string;
    dialogMessage: string;
}>(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<DeleteItemDialogComponent>>(MatDialogRef);

  dialogTitle = 'Are you sure you want to delete this item';
  dialogMessage = '';

  ngOnInit() {
    this.dialogTitle = this.data.dialogTitle;
    this.dialogMessage = this.data.dialogMessage;
  }

  confirmDeletion() {
    this.dialogRef.close(true);
  }

}
