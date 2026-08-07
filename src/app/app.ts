import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Pokemon } from './models/pokemon';
import { PokemonService } from './services/pokemon-service';
import { PokemonCard } from './components/pokemon-card/pokemon-card';
import { SearchBox } from './components/search-box/search-box';
import { SortKey, SortSelect } from './components/sort-select/sort-select';
import { PokemonModal } from './components/pokemon-modal/pokemon-modal';

@Component({
  selector: 'app-root',
  imports: [PokemonCard, SearchBox, SortSelect, PokemonModal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private service = inject(PokemonService);

  readonly pokemons = toSignal(this.service.getAll(), { initialValue: [] });

  // ─── 状態(すべて親が持つ)───
  readonly query = signal('');
  readonly favoriteIds = signal<ReadonlySet<number>>(new Set());
  readonly favOnly = signal(false);
  readonly selectedType = signal<string | null>(null);
  readonly sortKey = signal<SortKey>('id');
  readonly selected = signal<Pokemon | null>(null); // 練習5: モーダルの選択状態

  // ─── 導出 ───
  readonly allTypes = computed(() => [...new Set(this.pokemons().flatMap(p => p.types))]);
  readonly favCount = computed(() => this.favoriteIds().size); // 練習4: 新しい状態ではなく導出

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const type = this.selectedType();
    let list = this.pokemons();
    if (this.favOnly()) list = list.filter(p => this.favoriteIds().has(p.id));
    if (type) list = list.filter(p => p.types.includes(type));
    if (q) list = list.filter(p => p.ja.includes(q) || p.en.includes(q));
    return [...list].sort((a, b) =>
      this.sortKey() === 'id' ? a.id - b.id : a.ja.localeCompare(b.ja, 'ja'),
    );
  });

  selectType(type: string): void {
    this.selectedType.set(this.selectedType() === type ? null : type);
  }

  toggleFavorite(id: number): void {
    const next = new Set(this.favoriteIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.favoriteIds.set(next);
  }
}
