import { Component } from '@angular/core';
import { ClientDTO } from '@/lib/models/client';
import { MatTabsModule } from '@angular/material/tabs';
import { EditClientsComponent } from "../edit-clients/edit-clients.component";
import { EditHeadersComponent } from "../edit-headers/edit-headers.component";



type ClientListResponse = ClientDTO[] | { message: string };

@Component({
  selector: 'app-edit-settings',
  templateUrl: './edit-settings.component.html',
  styleUrl: './edit-settings.component.scss',
  imports: [
    MatTabsModule,
    EditClientsComponent,
    EditHeadersComponent
],
})
export class EditSettingsComponent {

  

}
