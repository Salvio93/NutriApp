// models/GarminData.js
import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Garmin extends Model {
  static table = 'garmin_data';

  @field('date') date;
  @field('updated') updated;
  @field('total_kcal') total_kcal;
  @field('rest_kcal') rest_kcal;
  @field('active_kcal') active_kcal;
}
