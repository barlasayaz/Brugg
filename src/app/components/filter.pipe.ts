import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  
  transform(items: any[], filter: string,columnName: any): any {
    if(!items || !filter) {
      return items;
    }
    // To search values only of "name" variable of your object(item)
    if (columnName!="") {
      return items.filter(item => item[columnName].toLowerCase().indexOf(filter.toLowerCase()) !== -1);
    } else {  
    // To search in values of every variable of your object(item)
      return items.filter(item => JSON.stringify(item).toLowerCase().indexOf(filter.toLowerCase()) !== -1);
    }
  }

}