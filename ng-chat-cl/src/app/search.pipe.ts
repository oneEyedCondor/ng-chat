import { Pipe, PipeTransform } from '@angular/core';
import { IUser } from './chat.service';

@Pipe({
    name: 'search',
    pure: false
})
export class SearchPipe implements PipeTransform {
    transform(items: Array<IUser>, search: string = ''): Array<IUser> {
        if(!search.trim()) return items;
        
        return items.filter( item => item.name.toLowerCase().startsWith(search.toLowerCase()) );
    }
}