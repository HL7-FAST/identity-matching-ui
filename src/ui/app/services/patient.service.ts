import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Bundle, Patient, Parameters, OperationOutcome, OperationOutcomeIssue } from 'fhir/r4';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private http = inject(HttpClient);
 
  private baseApiUrl = `/api/fhir`;

  list(queryString: string): Observable<Bundle<Patient>> {

    let requestUrl = `${this.baseApiUrl}/Patient`;

    if (queryString.startsWith(`${this.baseApiUrl}`)) {
      requestUrl = queryString;
    }
    else if (queryString.match(/^https?:\/\//)) {
      requestUrl = queryString;
    }
    else {
      requestUrl = requestUrl.concat(queryString);
    }

    return this.http.get<Bundle<Patient>>(`${requestUrl}`)
    .pipe(
      tap(() => console.log(`fetched audit logs.`)),
      map((response: Bundle<Patient>) => {        
        return response;
      }),
      catchError(this.handleError)
    )
  }

  create(patient: Patient) : Observable<Patient> {    
    return this.http.post<Patient>(`${this.baseApiUrl}/Patient`, patient)
      .pipe(
        tap(() => console.log(`submit patient for creation`)),
        map((response: Patient) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  update(patient: Patient) : Observable<Patient> {
    return this.http.put<Patient>(`${this.baseApiUrl}/Patient/${patient.id}`, patient)
      .pipe(
        tap(() => console.log(`submit patient for update`)),
        map((response: Patient) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  delete(patientId: string) : Observable<OperationOutcome> {
    return this.http.delete<OperationOutcome>(`${this.baseApiUrl}/Patient/${patientId}`)
      .pipe(
        tap(() => console.log(`submit patient for deletion`)),
        map((response: OperationOutcome) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  match(parameters: Parameters) : Observable<Bundle> {
    return this.http.post<Bundle>(`${this.baseApiUrl}/Patient/$idi-match`, parameters)
    .pipe(
      tap(() => console.log(`submit patient for match`)),
      map((response: Bundle) => {
        return response;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(err: HttpErrorResponse) {
    let errorMessage = '';
    if (err.error instanceof Error) {
      errorMessage = `An error occured: ${err.error.message}`;
    }
    else if (err.error instanceof Object && err.error.issue instanceof Array) {
      errorMessage = (err.error.issue || []).filter((issue: OperationOutcomeIssue) => issue.severity === 'error').map((issue: OperationOutcomeIssue) => issue.diagnostics).join('\n');
    }
    else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }

    console.error(errorMessage);
    return throwError(() => errorMessage);

  }

}
