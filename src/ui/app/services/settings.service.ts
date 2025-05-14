import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ClientDTO } from '@/lib/models/client';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  
  // BehaviorSubject to hold current client info
  private currentClientSubject = new BehaviorSubject<ClientDTO|undefined>(undefined);
  
  // Observable that components can subscribe to
  public currentClient$ = this.currentClientSubject.asObservable();

  http = inject(HttpClient);

  // Load current client data
  async loadCurrentClient(): Promise<ClientDTO | undefined> {

    if (this.currentClientSubject.value) {
      return this.currentClientSubject.value;
    }

    const client = await firstValueFrom(this.http.get<ClientDTO | { message: string }>('/api/client/current'));

    if (client instanceof Object && 'id' in client) {
      this.updateCurrentClient(client);
      return client;
    }

    if (client instanceof Object && 'message' in client) {
      console.error(client.message);
      this.updateCurrentClient(undefined);
      return undefined;
    }

    this.updateCurrentClient(undefined);
    return undefined;    
  }

  // Select a client and update the current client subject
  async selectClient(clientId: string): Promise<ClientDTO> {
    try{
      const res = await firstValueFrom(this.http.get<ClientDTO>(`/api/client/select/${clientId}`));
      if (res instanceof Object && 'id' in res) {
        const client: ClientDTO = {
          id: res.id,
          fhirBaseUrl: res.fhirBaseUrl,
          grantTypes: res.grantTypes,
          scopesRequested: res.scopesRequested,
          scopesGranted: res.scopesGranted,
          redirectUris: res.redirectUris,
          authorizationEndpoint: res.authorizationEndpoint,
          userinfoEndpoint: res.userinfoEndpoint,
          tokenEndpoint: res.tokenEndpoint,
          revocationEndpoint: res.revocationEndpoint,
          createdAt: res.createdAt,
          updatedAt: res.updatedAt,
          lastUsedAt: null
        };
        this.updateCurrentClient(client);
        return client;
      } else {
        throw new Error('Invalid response from server');
      }
    }
    catch (error) {
      console.error('Error selecting client:', error);
      this.resetClient();
      throw error;
    }
  }

  // Update the current client data (called after successful selection)
  updateCurrentClient(client: ClientDTO | undefined) {
    this.currentClientSubject.next(client);
  }

  // Reset client data
  resetClient() {
    this.currentClientSubject.next(undefined);
  }
}