import { tableSchema } from '@nozbe/watermelondb';

export const userSchema = tableSchema({
  name: 'user_data',
  columns: [
    { name: 'gender', type: 'string' },
    { name: 'age', type: 'number' },
    { name: 'height', type: 'number' },
    { name: 'weight', type: 'number' },
    { name: 'kcal', type: 'number' },
  ],
});
