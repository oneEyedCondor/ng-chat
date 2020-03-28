import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    count = 0;

    constructor(private spinner: NgxSpinnerService) { }
    
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('user-token');

        this.spinner.show();
        this.count++;
        
        const sendRequest = (req: HttpRequest<any>): Observable<HttpEvent<any>> => {
            return next.handle(req)
                .pipe(
                    finalize(() => {
                        this.count--;
                        if ( this.count == 0 ) this.spinner.hide();
                    })
                );
        };
        
        if(token) {
            const authReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`)
            });
            return sendRequest(authReq);
        }
        return sendRequest(req);
    }
}
