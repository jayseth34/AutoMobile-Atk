import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeHyphen'
})
export class RemoveHyphenPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    return value.replace("-", " ");
  }

}
