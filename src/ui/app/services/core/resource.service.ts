import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { ErrorHandlingService } from './error-handling.service';
import { CapabilityStatement, Resource } from 'fhir/r4';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
    private http = inject(HttpClient);
    private errorHandler = inject(ErrorHandlingService);

    private baseApiUrl = '/api/fhir';
    
    private availableResources: string[] = [
        'Patient',
        'Organization'
    ];

    get AvailableResources(): string[] {
        return this.availableResources;
    }

    set AvailableResources(resources: string[]) {
        this.availableResources = [...resources];
    }

    getResource(resourceType: string, id: string): Observable<unknown> {
        return this.http.get<unknown>(`${this.baseApiUrl}/${resourceType}/${id}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    createResource(resourceType: string, resource: Resource): Observable<unknown> {
        return this.http.post<unknown>(`${this.baseApiUrl}/${resourceType}`, resource)
            .pipe(
                catchError(this.handleError)
            );
    }

    updateResource(resourceType: string, id: string, resource: Resource): Observable<unknown> {
        return this.http.put<unknown>(`${this.baseApiUrl}/${resourceType}/${id}`, resource)
            .pipe(
                catchError(this.handleError)
            );
    }

    deleteResource(resourceType: string, id: string): Observable<unknown> {
        return this.http.delete<unknown>(`${this.baseApiUrl}/${resourceType}/${id}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    getCapabilityStatement(resourceServer: string): Observable<CapabilityStatement> {
        return this.http.get<CapabilityStatement>(`${resourceServer}/metadata`)
            .pipe(
                catchError(this.handleError)
            );
    }

    private handleError(err: HttpErrorResponse) {
        return this.errorHandler.handleError(err);
    }
}