import { Component, computed, input, output } from '@angular/core';
import { Pokemon, artworkUrl } from '../../models/pokemon';

@Component({
  selector: 'app-pokemon-card',
  imports: [],
  templateUrl: './pokemon-card.html',
  styleUrl: './pokemon-card.css',
})
export class PokemonCard {
  pokemon = input.required<Pokemon>();
  favorite = input(false);
  favoriteToggle = output<number>();

  imageUrl = computed(() => artworkUrl(this.pokemon().id));
}
