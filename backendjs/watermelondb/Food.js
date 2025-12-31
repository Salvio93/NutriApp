import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Food extends Model {
  static table = 'food_items';

  @field('code') code;
  @field('product_name') product_name;
  @field('category') category

  @field('energy_100g') energy_100g;
  @field('energy_kcal_100g') energy_kcal_100g;
  @field('proteins_100g') proteins_100g;
  @field('carbohydrates_100g') carbohydrates_100g;
  @field('sugars_100g') sugars_100g;
  @field('glucose_100g') glucose_100g;
  @field('fructose_100g') fructose_100g;
  @field('lactose_100g') lactose_100g;
  @field('fat_100g') fat_100g;
  @field('omega_3_fat_100g') omega_3_fat_100g;
  @field('omega_6_fat_100g') omega_6_fat_100g;
  @field('omega_9_fat_100g') omega_9_fat_100g;
  @field('cholesterol_100g') cholesterol_100g;
  @field('fiber_100g') fiber_100g;
  @field('sodium_100g') sodium_100g;
  @field('potassium_100g') potassium_100g;
  @field('calcium_100g') calcium_100g;
  @field('iron_100g') iron_100g;
  @field('magnesium_100g') magnesium_100g;
  @field('zinc_100g') zinc_100g;
  @field('alcohol_100g') alcohol_100g;
  @field('vitamin_a_100g') vitamin_a_100g;
  @field('vitamin_d_100g') vitamin_d_100g;
  @field('vitamin_e_100g') vitamin_e_100g;
  @field('vitamin_k_100g') vitamin_k_100g;
  @field('vitamin_c_100g') vitamin_c_100g;
  @field('vitamin_b1_100g') vitamin_b1_100g;
  @field('vitamin_b2_100g') vitamin_b2_100g;
  @field('vitamin_pp_100g') vitamin_pp_100g;
  @field('vitamin_b6_100g') vitamin_b6_100g;
  @field('vitamin_b9_100g') vitamin_b9_100g;
  @field('vitamin_b12_100g') vitamin_b12_100g;
  @field('nutrition_score_fr_100g') nutrition_score_fr_100g;
  @field('nutrition_score_uk_100g') nutrition_score_uk_100g;
}
