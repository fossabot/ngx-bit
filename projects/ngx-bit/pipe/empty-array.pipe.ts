import { Pipe, PipeTransform } from '@angular/core';
import { emptyArray } from 'ngx-bit/operates';

@Pipe({ name: 'EmptyArray' })
export class EmptyArrayPipe implements PipeTransform {
  transform(value: any[]): boolean {
    return emptyArray(value);
  }
}
