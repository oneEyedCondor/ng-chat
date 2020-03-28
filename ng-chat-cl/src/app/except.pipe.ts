import { IUser } from './chat.service';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'except'
})
export class ExceptPipe implements PipeTransform {

    transform(items: Array<IUser>, search: string = ''): Array<IUser> {
        return items.filter( item => item.login !== JSON.parse(localStorage.getItem('current-user')).login );
    }

}
