import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2, // bump schema version
      steps: [
        addColumns({
          table: 'saved_items',
          columns: [
            { name: 'product_name', type: 'string'},
          ],
        }),
      ],
    },{
      toVersion: 3, // bump schema version
      steps: [
        addColumns({
          table: 'saved_items',
          columns: [
            { name: 'kcal', type: 'string'},
          ],
        }),
      ],
    },
    {
      toVersion: 4, // bump schema version
      steps: [
        addColumns({
          table: 'food_items',
          columns: [
            { name: 'category', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
  ],
});
