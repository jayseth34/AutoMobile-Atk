import { HttpClient, HttpErrorResponse, HttpHandler, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { GetPartyTransactionDetailsRq } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  baseURL = "https://localhost:7002/api/";
  authToken: any;
  httpOptions = {
    headers: new HttpHeaders({
      "Content-Type": "application/json; charset=utf-8",
      // authorization: "",
      // "cache-control": "no-cache",
    }),
  };
  constructor(public http: HttpClient) { }

  errorHandler(error: HttpErrorResponse) {
    return throwError(error);
  }

  UpdateHttpRequest() {
    // this.authToken = JSON.parse(localStorage.getItem("AuthToken") || '{}');
    this.httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json; charset=utf-8",
        // authorization: "Bearer " + this.authToken.token,
        // "cache-control": "no-cache",
      }),
    };
  }

  Post(endPoint: any, body: any): Observable<any> {
    // this.authToken = JSON.parse(localStorage.getItem("AuthToken") || '{}');
    let headers = new HttpHeaders();
    // headers = headers.append("Authorization", "Bearer" + this.authToken.token);
    headers = headers.append("Content-Type", "application/json");
    return this.http
      .post(this.baseURL + endPoint, body, { headers: headers })
      .pipe(catchError(this.errorHandler));
  }

  get(endPoint: any): Observable<any> {
    this.UpdateHttpRequest();
    return this.http
      .get(this.baseURL + endPoint, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  typeGet<T>(endPoint: any, requestParams?: HttpParams): Observable<T> {
    let newHttpOptions;
    this.UpdateHttpRequest();
    if (requestParams) {
      newHttpOptions = { ...this.httpOptions, params: requestParams }
      console.log(newHttpOptions)
    }
    return this.http
      .get<T>(this.baseURL + endPoint, requestParams ? newHttpOptions : this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  PostType<T, P>(endPoint: string, body: P): Observable<T> {
    this.authToken = JSON.parse(localStorage.getItem("AuthToken") || '{}');
    let headers = new HttpHeaders();
    headers = headers.append("Authorization", "Bearer" + this.authToken.token);
    headers = headers.append("Content-Type", "application/json");
    return this.http
      .post<T>(this.baseURL + endPoint, body, { headers: headers })
      .pipe(catchError(this.errorHandler));
  }
}
