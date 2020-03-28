import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ChatService, IUser, IMessage } from '../chat.service';
import { AuthService } from '../auth.service';
import { EventBusService } from '../event-bus.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, AfterViewChecked {
    allContacts: Array<IUser> = [];
    usersOnline: Array<IUser> = [];
    generalMessages: Array<IMessage> = [];
    messagesOfCorrespondence: Array<IMessage> = [];
    isGeneralChat: boolean = true;
    searchVal: string = '';
    currentUser: IUser = JSON.parse(localStorage.getItem('current-user'));
    interlocutor: IUser;
    rerenderCorrespondence: boolean = true;

    @ViewChild('MessageList') messageList: ElementRef;
    
    constructor(
        private chatService: ChatService,
        private authService: AuthService,
        private eventBus: EventBusService) { }

    ngOnInit(): void {
        this.chatService.initSocket();

        this.chatService.onEvent('connect').subscribe(() => console.log('connected'));

        this.chatService.emitSignIn();

        this.chatService.emitCorrespondence(this.currentUser);

        this.chatService.onGetUsersOnline()
            .subscribe((usersOnline: Array<IUser>) => this.usersOnline = usersOnline);

        this.chatService.onGetAllContacts()
            .subscribe((allContacts: Array<IUser>) => {
                this.allContacts = allContacts.map(c => {
                    if(this.interlocutor && c.login === this.interlocutor.login) { c.unread = 0; }
                    return c;
                });
                if(!this.interlocutor) {
                    this.interlocutor = allContacts[0];
                }
                this.chatService.emitUpdateUnread(this.currentUser, this.interlocutor);
            });

        this.chatService.onGetGeneralMessages()
            .subscribe(
                (generalMessages: Array<IMessage>) => this.generalMessages = generalMessages,
                (err: HttpErrorResponse) => console.error(err)
            );
        
        this.chatService.onGetMessagesOfCorrespondence()
            .subscribe(
                (messagesOfCorrespondence: Array<IMessage>) => {
                    if(this.rerenderCorrespondence) {
                        this.messagesOfCorrespondence = messagesOfCorrespondence;
                    }
                    this.rerenderCorrespondence = true;
                },
                (err: HttpErrorResponse) => console.error(err)
            );
        
        this.chatService.onEvent('error').subscribe((err) => console.error(err));

        this.chatService.onEvent('disconnect').subscribe(() => console.log('disconnected'));

        this.eventBus.on('sign-out', () => this.signOut());

        this.eventBus.on('rerender-correspondence', (interlocutorId) => {
            if( interlocutorId !== this.interlocutor.id ) {
                this.rerenderCorrespondence = false;
            }
        });
    }

    ngAfterViewChecked(): void {        
        this.autoScroll();        
    }

    chooseConversation(interlocutor: IUser): void {
        this.interlocutor = interlocutor;
        this.isGeneralChat = false;
        this.messagesOfCorrespondence = [];

        this.chatService.emitCorrespondence(this.currentUser, interlocutor);
    }

    sendMessage(textOfMessage: string): void {
        if(!textOfMessage.trim()) return;

        if(this.isGeneralChat) {
            this.chatService.emitGeneralMessage(textOfMessage);
        } else {
            this.chatService.emitPrivateMessage(textOfMessage, this.interlocutor);
        }
    }

    signOut(): void {
        this.chatService.emitSignOut();
        this.authService.signOut();
    }

    autoScroll(): void {
        this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight;
    }
}