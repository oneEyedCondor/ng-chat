import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EventBusService, EventData } from '../event-bus.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
    userLogin: string;

    constructor(
        private router: Router,
        private eventBus: EventBusService) {
            if(JSON.parse(localStorage.getItem('current-user'))) {
                this.userLogin = JSON.parse(localStorage.getItem('current-user')).login;
            }
    }

    ngOnInit(): void {
        this.eventBus.on('sign-in', () =>
            this.userLogin = JSON.parse(localStorage.getItem('current-user'))?.login
        );
    }

    controlHandler(e) {
        switch(e.target.textContent) {
            case 'sign in':
                this.router.navigate(['/auth']);
                this.eventBus.emit(new EventData('sign-in'));
                break;
            case 'sign up':
                this.router.navigate(['/auth']);
                this.eventBus.emit(new EventData('sign-up'));
                break;
            case 'sign out':
                this.userLogin = '';
                this.eventBus.emit(new EventData('sign-out'));
                break;
        }
    }

}
