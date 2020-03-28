import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export class EventData {
    constructor(
        public name: string, 
        public data?: any ) {}
};

@Injectable()
export class EventBusService {
    private subject$ = new Subject();
    
    constructor() { }

    emit(event: EventData): void {
        this.subject$.next(event);
    }

    on(eventName: string, action: (d: any) => void): Subscription {
        return this.subject$
            .pipe(
                filter( (e: EventData) => e.name === eventName),
                map( (e: EventData) => e.data)
            )
            .subscribe(action);
    }
}