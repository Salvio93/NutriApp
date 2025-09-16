import { tableSchema } from '@nozbe/watermelondb';

export const foodSchema = tableSchema({
  name: 'food_items',
  columns: [
    { name: 'code', type: 'string' },
    { name: 'product_name', type: 'string' },
    ...[
      "energy_100g", "energy-kcal_100g", "proteins_100g", "carbohydrates_100g", "sugars_100g",
      "glucose_100g", "fructose_100g", "lactose_100g", "fat_100g",
      "omega-3-fat_100g", "omega-6-fat_100g", "omega-9-fat_100g", "cholesterol_100g",
      "fiber_100g", "sodium_100g", "potassium_100g", "calcium_100g", "iron_100g", "magnesium_100g",
      "zinc_100g", "alcohol_100g", "vitamin-a_100g", "vitamin-d_100g", "vitamin-e_100g",
      "vitamin-k_100g", "vitamin-c_100g", "vitamin-b1_100g", "vitamin-b2_100g", "vitamin-pp_100g",
      "vitamin-b6_100g", "vitamin-b9_100g", "vitamin-b12_100g", "nutrition-score-fr_100g",
      "nutrition-score-uk_100g"
    ].map(f => ({
      name: f.replace(/-/g, '_'),
      type: 'number'
    }))
  ]
});
