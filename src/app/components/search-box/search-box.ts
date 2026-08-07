import { Component, output, signal } from '@angular/core';

/**
 * 検索ボックス部品。
 * 契約: 確定した検索語を queryChange で通知するだけ。
 * クリアボタンは「空文字が確定した」として同じ契約で通知する(親の修正ゼロ)。
 */
@Component({
  selector: 'app-search-box',
  imports: [],
  templateUrl: './search-box.html',
  styleUrl: './search-box.css',
})
export class SearchBox {
  queryChange = output<string>();

  readonly value = signal('');

  onInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
    this.queryChange.emit(this.value());
  }

  clear(): void {
    this.value.set('');
    this.queryChange.emit('');
  }
}
