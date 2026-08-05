import { Component, output } from '@angular/core';

/**
 * 検索ボックス部品。
 * 契約: 確定した検索語を queryChange で通知するだけ。
 * 「何を検索するか」「どう絞り込むか」はこの部品は知らない(親の仕事)。
 */
@Component({
  selector: 'app-search-box',
  imports: [],
  templateUrl: './search-box.html',
  styleUrl: './search-box.css',
})
export class SearchBox {
  queryChange = output<string>();

  onInput(event: Event): void {
    this.queryChange.emit((event.target as HTMLInputElement).value);
  }
}
