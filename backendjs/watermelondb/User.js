import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class User extends Model {
  static table = 'user_data';

  @field('gender') gender;
  @field('age') age;
  @field('height') height;
  @field('weight') weight;
  @field('kcal') kcal;
}
