import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService, IAuthData } from '../auth.service';
import { EventBusService } from '../event-bus.service';

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
    isAuthentication: boolean = false;
    authForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private eventBus: EventBusService
    ) { 
        this.authForm = fb.group({
            'userName':             ['', this.isRequired()],
            'userLogin':            ['', [ Validators.required, Validators.email, Validators.minLength(6) ]],
            'userPassword':         ['', [ Validators.required, Validators.minLength(6) ]],
            'userConfirmPassword':  ['', this.isRequired()],
        }, { validator: this.checkPasswords });
    }

    ngOnInit(): void {
        this.eventBus.on('sign-in', () => this.isAuthentication = false);
        this.eventBus.on('sign-up', () => this.isAuthentication = true);
    }

    toggleAuthentication(val: boolean): void {
        this.isAuthentication = val;
    }

    isRequired() {
        return (this.isAuthentication)
            ? [ Validators.required, Validators.minLength(6) ]
            : [ Validators.minLength(6) ];
    }

    checkPasswords = (group: FormGroup): {[s:string]:boolean} => {
        if(!this.isAuthentication) return null;

        const pass = group.get('userPassword').value;
        const confirmPass = group.get('userConfirmPassword').value;
        return (pass === confirmPass) ? null : { notSame: true };   
    }

    submitHandler() {
        const body: IAuthData = { login: this.authForm.value.userLogin, password: this.authForm.value.userPassword };

        if(this.isAuthentication) {
            body.name = this.authForm.value.userName;
            this.authService.signUp(body);
        } else {
            this.authService.signIn(body);
        }
        this.authForm.reset();
    }

}
