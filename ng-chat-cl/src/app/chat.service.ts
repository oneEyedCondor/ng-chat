import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as socketIo from 'socket.io-client';
import { EventBusService, EventData } from './event-bus.service';

export interface IUser {
    id: number;
    name: string;
    login: string;
    unread?: number;
}

export interface IMessage {
    text: string;       
    date: Date;
    user: IUser;
}

@Injectable()
export class ChatService {
    private socket;

    constructor(private eventBus: EventBusService) {}

    initSocket(): void {
        const SERVER_URL = `ws://localhost:5005?token=${localStorage.getItem('user-token')}`;
        this.socket = socketIo(SERVER_URL);
    }

    emitSignIn(): void {
        this.socket.emit('sign-in', localStorage.getItem('current-user'));
    }

    emitSignOut(): void {
        this.socket.emit('sign-out', localStorage.getItem('current-user'));
    }

    emitCorrespondence(currentUser: IUser, interlocutor: IUser = null): void {
        this.socket.emit('correspondence', { currentUser, interlocutor });
    }

    emitUpdateUnread(currentUser: IUser, interlocutor: IUser): void {
        this.socket.emit('update-unread', { currentUser, interlocutor });
    }

    emitGeneralMessage(textOfMessage: string): void {
        const messageData = {
            text: textOfMessage,
            date: new Date(),
            userId: JSON.parse(localStorage.getItem('current-user')).id
        };
        this.socket.emit('general-message', messageData);
    }

    emitPrivateMessage(textOfMessage: string, interlocutor: IUser): void {
        const messageData = {
            text: textOfMessage,
            date: new Date(),
            userId: JSON.parse(localStorage.getItem('current-user')).id
        };
        this.socket.emit('private-message', { data: messageData, interlocutor });
    }

    onEvent(event): Observable<any> {
        return new Observable<Event>(observer => {
            this.socket.on(event, (arg?: any) => observer.next(arg));
        });
    }

    onGetAllContacts(): Observable<IUser[]> {
        return new Observable<IUser[]>(observer => {
            this.socket.on('all-contacts', (users: IUser[]) => observer.next(users));
        });
    }

    onGetUsersOnline(): Observable<IUser[]> {
        return new Observable<IUser[]>(observer => {
            this.socket.on('users-online', (usersOnline: IUser[]) => observer.next(usersOnline));
        });
    }

    onGetGeneralMessages(): Observable<IMessage[]> {
        return new Observable<IMessage[]>(observer => {
            this.socket.on('general-messages', (generalMessages: Array<IMessage>) => observer.next(generalMessages));
        });
    }

    onGetMessagesOfCorrespondence(): Observable<IMessage[]> {
        return new Observable<IMessage[]>(observer => {
            this.socket.on('correspondence', (messagesOfCorrespondence: Array<IMessage>, interlocutorId?: number) => {
                interlocutorId && this.eventBus.emit(new EventData('rerender-correspondence', interlocutorId));
                observer.next(messagesOfCorrespondence);
            });
        });
    }
}