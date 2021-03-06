import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ListByPage } from 'ngx-bit/factory';

@Directive({
  selector: '[bitSearchClear]'
})
export class BitSearchClearDirective {
  @Input() bitSearchClear: ListByPage;
  @Input() reset: any;
  @Output() after: EventEmitter<any> = new EventEmitter<any>();

  @HostListener('click')
  onClick() {
    this.bitSearchClear.clearSearch(this.reset).subscribe(() => {
      this.after.emit(true);
    });
  }
}
