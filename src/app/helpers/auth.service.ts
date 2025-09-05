import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { Observable, throwError as _observableThrow, of as _observableOf, Subject, BehaviorSubject } from 'rxjs';
import { Injectable} from '@angular/core';
import { User } from './data/user';
import jwt_decode from 'jwt-decode'; 
@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private token = new BehaviorSubject<string>('');
    token$: Observable<string> = this.token.asObservable();


    private loggedInStatus = JSON.parse(localStorage.getItem('loggedIn') || ('false'));
    constructor() {
        this.token = new BehaviorSubject<string>(localStorage.getItem('token')||'');
        this.token$ = this.token.asObservable();
    }

    setLoginStatus(value: any) {
        this.loggedInStatus = value;
        localStorage.setItem('loggedIn', 'true');        
    }

    get LoginStatus() {
        return JSON.parse(localStorage.getItem('loggedIn') ||
            this.loggedInStatus.toString());
    }
    public get currentToken(): string {
        return this.token.value;
    }
    setToken(token: string) {
        localStorage.setItem('token', token);
        this.token.next(token);
    }

    getUserFromToken(): User {
        let loginToken ='';
       this.token$.subscribe(data =>  loginToken = data);;
        const payload = jwt_decode(loginToken) as any;
        const user = new User(); 
        user.email=payload.email;
        user.id = payload.id;
        user.fullName=payload.fullName;
        user.resetPassword= payload.resetPassword;
        user.role=payload.role;
        user.questionAccess=payload.questionAccess;
        return user;
    }
}
