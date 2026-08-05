import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PokemonService } from './services/pokemon-service';
import { PokemonCard } from './components/pokemon-card/pokemon-card';
import { SearchBox } from './components/search-box/search-box';

@Component({
  selector: 'app-root',
  imports: [PokemonCard, SearchBox],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private service = inject(PokemonService);

  readonly pokemons = toSignal(this.service.getAll(), { initialValue: [] });

  readonly query = signal('');
  readonly favoriteIds = signal<ReadonlySet<number>>(new Set());

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.pokemons();
    return this.pokemons().filter(p => p.ja.includes(q) || p.en.includes(q));
  });

  toggleFavorite(id: number): void {
    const next = new Set(this.favoriteIds());
    next.has(id) ? next.delete(id) : next.add(id);
    this.favoriteIds.set(next);
  }
}
