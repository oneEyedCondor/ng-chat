import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChatService } from './chat.service';
import { EventBusService, EventData } from './event-bus.service';

export interface IAuthData {
    name?: string;
    login: string;
    password: string;
}

export interface IAuthInfo {
    message: string;
    user: IAuthData;
    token: string;
}

@Injectable()
export class AuthService {

    constructor(
        private http: HttpClient,
        private router: Router,
        private chatService: ChatService,
        private eventBus: EventBusService) { }

    successAuthenticationOrRegistration(token, user) {
        localStorage.setItem('current-user', JSON.stringify(user));
        localStorage.setItem('user-token', token);
        this.eventBus.emit(new EventData('sign-in'));
        this.router.navigate(['/chat']);
    };

    signIn(body: IAuthData): void {
        if(localStorage.getItem('current-user')) {
            this.chatService.initSocket();
            this.chatService.emitSignOut();
        };

        this.http.post('http://localhost:5005/api/authentication', body)
            .subscribe(
                (response: IAuthInfo) => {
                    const { message: infoMessage, user, token } = response;
                    if(infoMessage === 'authenticated' && token) {
                        this.successAuthenticationOrRegistration(token, user);
                    }
                },
                (err: HttpErrorResponse) => {
                    if (err.status === 401) {
                        this.router.navigate(['/']);
                    }
                });
    }

    signUp(body: IAuthData): void {
        this.http.post('http://localhost:5005/api/registration', body)
            .subscribe(
                (response: IAuthInfo) => {
                    const { message: infoMessage, user, token } = response;
                    if(infoMessage === 'registered' && token) {
                        this.successAuthenticationOrRegistration(token, user);
                    }
                },
                (err: HttpErrorResponse) => console.error(err.error.message));
    }

    signOut(): void {
        localStorage.clear();
        this.router.navigate(['/']);
    }
}
