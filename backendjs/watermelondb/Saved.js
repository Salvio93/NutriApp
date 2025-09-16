import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, immutableRelation } from '@nozbe/watermelondb/decorators';

export default class Saved extends Model {
  static table = 'saved_items';

  @field('code') code;
  @field('product_name') product_name;
  @field('quantity') quantity;
  @field('timestamp') timestamp;

  @field('kcal') kcal;
  @field('proteins') proteins;
  @field('carbohydrates') carbohydrates;
  @field('sugars') sugars;
  @field('fat') fat;
  @field('omega_3') omega_3;
  @field('omega_6') omega_6;
  @field('omega_9') omega_9;
  @field('cholesterol') cholesterol;
  @field('fiber') fiber;
  @field('sodium') sodium;
  @field('potassium') potassium;
  @field('calcium') calcium;
  @field('iron') iron;
  @field('magnesium') magnesium;
  @field('zinc') zinc;
  @field('alcohol') alcohol;
  @field('vitamin_a') vitamin_a;
  @field('vitamin_d') vitamin_d;
  @field('vitamin_e') vitamin_e;
  @field('vitamin_k') vitamin_k;
  @field('vitamin_c') vitamin_c;
  @field('vitamin_b1') vitamin_b1;
  @field('vitamin_b2') vitamin_b2;
  @field('vitamin_pp') vitamin_pp;
  @field('vitamin_b6') vitamin_b6;
  @field('vitamin_b9') vitamin_b9;
  @field('vitamin_b12') vitamin_b12;
  @field('nutrition_score_fr') nutrition_score_fr;
}
