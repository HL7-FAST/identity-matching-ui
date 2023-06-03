import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Bundle, Patient, Resource, Parameters } from 'fhir/r4';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientService { 
  private baseApiUrl = `${environment.baseApiUrl}`;

  constructor(private http: HttpClient) { }

  list(queryString: string): Observable<Bundle<Patient>> {

    let requestUrl = `${this.baseApiUrl}/Patient`;

    if (queryString.startsWith(`${this.baseApiUrl}`)) {
      requestUrl = queryString;
    }  
    else {
      requestUrl = requestUrl.concat(queryString);
    }

    return this.http.get<Bundle<Patient>>(`${requestUrl}`)
    .pipe(
      tap(_ => console.log(`fetched audit logs.`)),
      map((response: Bundle<Patient>) => {        
        return response;
      }),
      catchError(this.handleError)
    )
  }

  create(patient: Patient) : Observable<any> {    
    return this.http.post<any>(`${this.baseApiUrl}/Patient`, patient)
      .pipe(
        tap(_ => console.log(`submit patient for creation`)),
        map((response: any) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  update(patient: Patient) : Observable<any> {
    return this.http.put<any>(`${this.baseApiUrl}/Patient/${patient.id}`, patient)
      .pipe(
        tap(_ => console.log(`submit patient for update`)),
        map((response: any) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  delete(patientId: string) : Observable<any> {
    return this.http.delete<any>(`${this.baseApiUrl}/Patient/${patientId}`)
      .pipe(
        tap(_ => console.log(`submit patient for deletion`)),
        map((response: any) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  match(parameters: Parameters) : Observable<Bundle> {
    return this.http.post<Bundle>(`${this.baseApiUrl}/Patient/$match`, parameters)
    .pipe(
      tap(_ => console.log(`submit patient for deletion`)),
      map((response: any) => {
        return response;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';

    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occured: ${err.error.message}`;
    }
    else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }

    console.error(errorMessage);
    return throwError(() => errorMessage);

  }

}
