import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AuthService } from './auth.service';
import { ChatService } from './chat.service';
import { EventBusService } from './event-bus.service';
import { AuthInterceptor } from './auth-interceptor';
import { ChatGuard } from './chat/chat.guard';

import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { ChatComponent } from './chat/chat.component';
import { SearchPipe } from './search.pipe';
import { ExceptPipe } from './except.pipe';
import { MenuComponent } from './menu/menu.component';

@NgModule({
    declarations: [
        AppComponent,
        AuthComponent,
        ChatComponent,
        SearchPipe,
        ExceptPipe,
        MenuComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        NgxSpinnerModule,
        BrowserAnimationsModule
    ],
    providers: [ 
        AuthService,
        ChatService,
        EventBusService,
        ChatGuard,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        }
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule { }
