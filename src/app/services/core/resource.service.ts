import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ErrorHandlingService } from './error-handling.service';
import { CapabilityStatement, Resource } from 'fhir/r4';

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
    private baseApiUrl = `${environment.baseApiUrl}`;
    
    private availableResources: string[] = [
        'Patient',
        'Organization'
    ];

    constructor(private http: HttpClient, private errorHandler: ErrorHandlingService) { }

    get AvailableResources() : string[] {
        return this.availableResources;
    }

    set AvailableResources(resources: string[]) {
        //clear options
        this.availableResources.splice(0);

        //set new options
        this.availableResources = [...resources];
    }

    getResource(resourceType: string, id: string) : Observable<any> {
        return this.http.get<any>(`${this.baseApiUrl}/${resourceType}/${id}`)
            .pipe(
                map((response: any) => {
                return response;
            }),
            catchError(this.handleError)
        );
    }

    createResource(resourceType: string, resource: Resource) : Observable<any> {    
        return this.http.post<any>(`${this.baseApiUrl}/${resourceType}`, resource)
          .pipe(
            tap(_ => console.log(`submit resource for creation`)),
            map((response: any) => {
              return response;
            }),
            catchError(this.handleError)
          );
    }

    updateResource(resourceType: string, id: string, resource: Resource) : Observable<any> {    
        return this.http.put<any>(`${this.baseApiUrl}/${resourceType}/${id}`, resource)
          .pipe(
            tap(_ => console.log(`submit resource for update`)),
            map((response: any) => {
              return response;
            }),
            catchError(this.handleError)
          );
    }

    deleteResource(resourceType: string, id: string) : Observable<any> {    
        return this.http.delete<any>(`${this.baseApiUrl}/${resourceType}/${id}`)
          .pipe(
            tap(_ => console.log(`submit resource for deletion`)),
            map((response: any) => {
              return response;
            }),
            catchError(this.handleError)
          );
    }

    getCapabilityStatement(resourceServer: string) : Observable<CapabilityStatement> {
      return this.http.get<CapabilityStatement>(`${resourceServer}/metadata`)
        .pipe(
          tap(_ => console.log(`submit request for capability statement`)),
          map((response: any) => {
            return response;
          }),
          catchError(this.handleError)
        );
    }

    private handleError(err: HttpErrorResponse) {
        return this.errorHandler.handleError(err);   
    }
}