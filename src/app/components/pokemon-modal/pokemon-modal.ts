import { Component, computed, input, output } from '@angular/core';
import { Pokemon, artworkUrl } from '../../models/pokemon';

/**
 * 契約: 表示する Pokemon を受け取り、「閉じたい」を通知するだけ。
 * 自分を消すのは状態(selected)を持つ親の仕事。
 */
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
