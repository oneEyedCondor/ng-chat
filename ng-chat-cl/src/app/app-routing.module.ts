import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthComponent } from './auth/auth.component';
import { ChatComponent } from './chat/chat.component';
import { ChatGuard } from './chat/chat.guard';

const routes: Routes = [
    { path: 'auth', component: AuthComponent },
    { path: 'chat', component: ChatComponent, canActivate: [ ChatGuard ] },
    { path: '**',   component: AuthComponent }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule { }
