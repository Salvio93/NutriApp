// models/schemas/garminSchema.js
import { tableSchema } from '@nozbe/watermelondb';

export const garminSchema = tableSchema({
  name: 'garmin_data',
  columns: [
    { name: 'date', type: 'string', isIndexed: true },
    { name: 'updated', type: 'string' },
    { name: 'total_kcal', type: 'number' },
    { name: 'rest_kcal', type: 'number' },
    { name: 'active_kcal', type: 'number' },
  ],
});
