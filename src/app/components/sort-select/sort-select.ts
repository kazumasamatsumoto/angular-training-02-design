import { Component, output } from '@angular/core';

export type SortKey = 'id' | 'ja';

/** 契約: 並びキーを通知するだけ。並び替えの実行はしない(データを知らない) */
@Component({
  selector: 'app-sort-select',
  imports: [],
  templateUrl: './sort-select.html',
  styleUrl: './sort-select.css',
})
export class SortSelect {
  sortChange = output<SortKey>();

  onChange(event: Event): void {
    this.sortChange.emit((event.target as HTMLSelectElement).value as SortKey);
  }
}
