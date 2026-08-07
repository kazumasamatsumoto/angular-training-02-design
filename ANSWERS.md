# 課題02 練習課題 回答例

> **動くコード:** この回答例を実際に適用したソースコードが `exercises-answers` ブランチにあります。
> `git switch exercises-answers` で切り替えて動かせます(GitHub 上では branch 切り替えで閲覧)。
> **回答版デモ:** https://kadai02-answers.vercel.app


**回答は一例。** 設計シートの答えが合っていれば、コードの細部は違ってよい。

---

## 練習1: タイプフィルタ

**設計シート:**
1. 部品化しない(ボタン列はこの画面専用。基準①②を満たさない)。※基準の見立てが「今後3箇所で使う」なら部品化も正解
2. 選択中タイプは App(絞り込みは App の仕事)
3. 既存契約は変わらない

`app.ts`:

```ts
readonly selectedType = signal<string | null>(null);

// タイプ一覧はデータから導出する
readonly allTypes = computed(() => [...new Set(this.pokemons().flatMap(p => p.types))]);

readonly filtered = computed(() => {
  const q = this.query().trim().toLowerCase();
  const type = this.selectedType();
  let list = this.pokemons();
  if (this.favOnly()) list = list.filter(p => this.favoriteIds().has(p.id));
  if (type) list = list.filter(p => p.types.includes(type));
  if (!q) return list;
  return list.filter(p => p.ja.includes(q) || p.en.includes(q));
});

selectType(type: string): void {
  this.selectedType.set(this.selectedType() === type ? null : type);
}
```

`app.html`(お気に入りボタンの下):

```html
<div class="type-filter">
  @for (t of allTypes(); track t) {
    <button
      type="button"
      class="type-btn"
      [class.on]="selectedType() === t"
      (click)="selectType(t)"
    >
      {{ t }}
    </button>
  }
</div>
```

`app.css` 末尾:

```css
.type-filter { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.type-btn {
  padding: 3px 12px; border: 1.5px solid #e4e6ea; border-radius: 999px;
  background: #fff; cursor: pointer; font-size: 12px;
}
.type-btn.on { background: #e3350d; border-color: #e3350d; color: #fff; }
```

## 練習2: SearchBox のクリアボタン

**設計シートの答え: 契約は変わらない。** 「×を押した」= 「空文字が確定した」なので、既存の `queryChange` に `''` を流せばよい。**親の修正はゼロ。** これが契約を安定させる御利益。

`search-box.ts`:

```ts
import { Component, output, signal } from '@angular/core';

@Component({ /* 変更なし */ })
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
```

`search-box.html`:

```html
<div class="wrap">
  <input
    class="search"
    type="search"
    placeholder="なまえで検索(例: ピカ / pika)"
    [value]="value()"
    (input)="onInput($event)"
  />
  @if (value()) {
    <button type="button" class="clear" (click)="clear()">×</button>
  }
</div>
```

`search-box.css` に追記:

```css
.wrap { position: relative; }
.clear {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  border: 0; background: none; font-size: 16px; cursor: pointer; color: #7c828a;
}
```

## 練習3: SortSelect 部品

**設計シート:**
1. 部品化する(並び替え UI は一覧系画面で使い回せる/名前が付く/親を知らない)
2. 「選択中の並びキー」は SortSelect の見た目用に内部で持ってよいが、**正の状態は App**
3. 新しい契約: `sortChange = output<'id' | 'ja'>()`。**並び替えの実行は App の仕事**(SortSelect はデータを知らない)

```bash
npx ng generate component components/sort-select
```

`sort-select.ts`:

```ts
import { Component, output } from '@angular/core';

export type SortKey = 'id' | 'ja';

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
```

`sort-select.html`:

```html
<select class="sort" (change)="onChange($event)">
  <option value="id">ばんごう順</option>
  <option value="ja">なまえ順</option>
</select>
```

App 側: `sortKey = signal<SortKey>('id')` を持ち、`filtered` の最後で `[...list].sort(...)`。テンプレートは:

```html
<app-sort-select (sortChange)="sortKey.set($event)" />
```

## 練習4: お気に入り数バッジ

**設計シートの答え: 新しい状態は不要。** `favoriteIds` から**導出**する。状態を増やすと同期バグの温床になる。

`app.ts`:

```ts
readonly favCount = computed(() => this.favoriteIds().size);
```

`app.html` のヘッダー:

```html
<header class="header">
  <h1>ポケモン図鑑ミニ(設計編)</h1>
  <span class="fav-count">★ {{ favCount() }}</span>
</header>
```

`app.css`:

```css
.header { display: flex; justify-content: space-between; align-items: center; }
.fav-count { font-weight: 700; }
```

## 練習5(挑戦): 詳細モーダル

**設計シートの答え:**
- 選択状態は **App** が持つ: `selected = signal<Pokemon | null>(null)`
- モーダルは **Pokemon を受け取る**。id だと部品が「id→データ」の解決方法(サービス)を知る必要が生まれ、契約が重くなる。表示するだけの部品にはデータ本体を渡す
- 閉じる操作は **Output**(`closed = output<void>()`)。部品が勝手に消えるのではなく「閉じたいです」と通知し、消すのは状態を持つ親

```bash
npx ng generate component components/pokemon-modal
```

`pokemon-modal.ts`:

```ts
import { Component, computed, input, output } from '@angular/core';
import { Pokemon, artworkUrl } from '../../models/pokemon';

@Component({
  selector: 'app-pokemon-modal',
  imports: [],
  templateUrl: './pokemon-modal.html',
  styleUrl: './pokemon-modal.css',
})
export class PokemonModal {
  pokemon = input.required<Pokemon>();
  closed = output<void>();

  imageUrl = computed(() => artworkUrl(this.pokemon().id));
}
```

`pokemon-modal.html`:

```html
<div class="backdrop" (click)="closed.emit()">
  <div class="dialog" (click)="$event.stopPropagation()">
    <button type="button" class="close" (click)="closed.emit()">×</button>
    <img [src]="imageUrl()" [alt]="pokemon().ja" width="200" height="200" />
    <h2>{{ pokemon().ja }}</h2>
    <p>{{ pokemon().en }} / No.{{ pokemon().id }}</p>
    <p>タイプ: {{ pokemon().types.join('・') }}</p>
  </div>
</div>
```

`pokemon-modal.css`:

```css
.backdrop {
  position: fixed; inset: 0; background: rgb(0 0 0 / 0.5);
  display: grid; place-items: center; z-index: 100;
}
.dialog {
  position: relative; background: #fff; border-radius: 16px;
  padding: 24px 32px; text-align: center; max-width: 320px;
}
.close {
  position: absolute; top: 8px; right: 12px;
  border: 0; background: none; font-size: 20px; cursor: pointer;
}
```

App 側:

```ts
readonly selected = signal<Pokemon | null>(null);
```

```html
<!-- カードを div で包んでクリックを拾う(カードの契約は変えない) -->
<div (click)="selected.set(p)">
  <app-pokemon-card ... />
</div>

<!-- テンプレート末尾 -->
@if (selected(); as p) {
  <app-pokemon-modal [pokemon]="p" (closed)="selected.set(null)" />
}
```

> 発展: カードクリックとモーダルを本格的にやるなら、カードに `select = output<number>()` を**契約として追加する**のも正解。その場合は「契約が変わる=カードを使う全箇所に影響する」ことを意識して選ぶこと。
