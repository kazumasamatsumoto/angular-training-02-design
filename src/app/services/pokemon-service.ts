import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Pokemon } from '../models/pokemon';

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private http = inject(HttpClient);

  // shareReplay で何度呼ばれてもリクエストは1回だけ
  private pokemons$ = this.http.get<Pokemon[]>('pokemons.json').pipe(
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  getAll(): Observable<Pokemon[]> {
    return this.pokemons$;
  }
}
