import {Injectable, PipeTransform} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PipeService implements PipeTransform{
  constructor() { }
    transform(value: string, index = 0): string {
        if (value) {
            const split = value.split(' ');

            return split.length ? split[index] : value;
        }

        return value;
    }
}
