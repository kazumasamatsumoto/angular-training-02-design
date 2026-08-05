# 課題02: 設計する

**ゴール:** コードを書き始める前に「部品の分け方」と「部品同士の契約(Input / Output)」を決められるようになる。

**このリポジトリの使い方:** clone して手元で動かしながら進めます。前半は完成済みのコードを読んで設計を逆算し、後半は**新機能を自分で設計してから**実装します。

**パート1時点のデモ:** https://angular-training-02-design.vercel.app

```bash
git clone <このリポジトリのURL>
cd angular-training-02-design
npm install
npx ng serve
```

---

## パート1: 完成品から設計を読み取る(30分)

### 1. 画面を部品に分解する

1. ブラウザで http://localhost:4200 を開きます。
2. 紙かメモアプリに、画面のスケッチを描き、**「独立した部品になっていそうな箇所」を四角で囲みます。**
3. 囲んだら `src/app/` のフォルダ構成と見比べます。答えは3つ:

   ```
   App(全体の親)
   ├── SearchBox(検索ボックス)
   └── PokemonCard(カード)× 表示数ぶん
   ```

### 2. 契約を読み取る

1. `src/app/components/pokemon-card/pokemon-card.ts` を開きます。
2. 次の3行に印を付けます。**これがこの部品の契約のすべてです。**

   ```ts
   pokemon = input.required<Pokemon>();   // 受け取るもの(必須)
   favorite = input(false);               // 受け取るもの(任意)
   favoriteToggle = output<number>();     // 通知するもの
   ```

3. `src/app/components/search-box/search-box.ts` を開きます。契約は `queryChange = output<string>()` の1行だけです。
4. **重要な観察:** SearchBox は「検索結果をどう絞り込むか」を知りません。PokemonCard は「お気に入り一覧」を持っていません。**部品は契約の外側を知らないから、どの画面でも使い回せます。**

### 3. 親の仕事を読み取る

1. `src/app/app.ts` を開きます。
2. 状態(`query` / `favoriteIds`)と、状態から導出される表示リスト(`filtered`)が**すべて親にある**ことを確認します。
3. `src/app/app.html` を開き、親が子をどう「結線」しているかを確認します。

   ```html
   <app-search-box (queryChange)="query.set($event)" />
   ```

---

## パート2: 新機能を「設計してから」作る(60分)

追加する要件: **「★お気に入りだけを表示する」切り替えボタン**

### 4. コードを書く前に3つの問いに答える(紙に書く)

1. **新しい部品を切るか、既存部品に足すか?**
   - 判断基準: ①2箇所以上で使うか ②単体で名前が付くか ③親を知らずに動くか
   - 今回の答え: ボタン1個なので部品化しない(App のテンプレートに直接置く)。**「切らない」も設計判断です。**
2. **状態はどこに持つか?**
   - 答え: 絞り込みは App の仕事なので、App に `favOnly` を持つ。
3. **既存の契約は変わるか?**
   - 答え: 変わらない。PokemonCard も SearchBox も無修正。**契約が変わらない追加は安全な追加です。**

### 5. 状態を追加する

1. `src/app/app.ts` を開きます。
2. `readonly favoriteIds = ...` の行の**下**に、次をコピペします。

   ```ts
   readonly favOnly = signal(false);
   ```

### 6. 導出リストに絞り込みを足す

1. 同じファイルの `filtered` を、次で**丸ごと置き換えて**保存します。

   ```ts
   readonly filtered = computed(() => {
     const q = this.query().trim().toLowerCase();
     let list = this.pokemons();
     if (this.favOnly()) {
       list = list.filter(p => this.favoriteIds().has(p.id));
     }
     if (!q) return list;
     return list.filter(p => p.ja.includes(q) || p.en.includes(q));
   });
   ```

### 7. ボタンを置いて結線する

1. `src/app/app.html` を開きます。
2. `<app-search-box ...>` の行の**下**に、次をコピペして保存します。

   ```html
   <button
     type="button"
     class="fav-filter"
     [class.on]="favOnly()"
     (click)="favOnly.set(!favOnly())"
   >
     ★ お気に入りのみ
   </button>
   ```

3. `src/app/app.css` の**末尾**に、次をコピペして保存します。

   ```css
   .fav-filter {
     margin-top: 10px;
     padding: 4px 14px;
     border: 1.5px solid #e4e6ea;
     border-radius: 999px;
     background: #fff;
     cursor: pointer;
   }

   .fav-filter.on {
     background: #ffedad;
     border-color: #f6b500;
   }
   ```

### 8. ブラウザで確認する

1. カードを2〜3枚 ★ にします。
2. 「★ お気に入りのみ」を押します → その2〜3枚だけになることを確認します。
3. その状態で検索もしてみます → **お気に入り絞り込みと検索が同時に効く**ことを確認します(手順6で書いた `computed` が2つの状態を合成しているからです)。

---

## 仕上げ課題(答えはこのリポジトリにありません)

「タイプで絞り込むボタン列」を、**手順4の3つの問いに紙で答えてから**実装してください。ヒント: タイプボタンは複数箇所で使う見込みがあるか?を考えること。

## チェックリスト

- [ ] 部品の契約(Input / Output)を3つとも言える
- [ ] 「状態は誰が持つか」を先に決めてから実装した
- [ ] 既存部品を1文字も変えずに機能を追加できた
