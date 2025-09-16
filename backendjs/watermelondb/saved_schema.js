import { tableSchema } from '@nozbe/watermelondb';

export const savedSchema = tableSchema({
  name: 'saved_items',
  columns: [
    { name: 'code', type: 'string' },
    { name: 'product_name', type: 'string' },
    { name: 'quantity', type: 'number' },
    { name: 'timestamp', type: 'number' },
    
    // Nutrient fields
    { name: 'kcal', type: 'number' },
    { name: 'proteins', type: 'number' },
    { name: 'carbohydrates', type: 'number' },
    { name: 'sugars', type: 'number' },
    { name: 'fat', type: 'number' },
    { name: 'omega_3', type: 'number' },
    { name: 'omega_6', type: 'number' },
    { name: 'omega_9', type: 'number' },
    { name: 'cholesterol', type: 'number' },
    { name: 'fiber', type: 'number' },
    { name: 'sodium', type: 'number' },
    { name: 'potassium', type: 'number' },
    { name: 'calcium', type: 'number' },
    { name: 'iron', type: 'number' },
    { name: 'magnesium', type: 'number' },
    { name: 'zinc', type: 'number' },
    { name: 'alcohol', type: 'number' },
    { name: 'vitamin_a', type: 'number' },
    { name: 'vitamin_d', type: 'number' },
    { name: 'vitamin_e', type: 'number' },
    { name: 'vitamin_k', type: 'number' },
    { name: 'vitamin_c', type: 'number' },
    { name: 'vitamin_b1', type: 'number' },
    { name: 'vitamin_b2', type: 'number' },
    { name: 'vitamin_pp', type: 'number' },
    { name: 'vitamin_b6', type: 'number' },
    { name: 'vitamin_b9', type: 'number' },
    { name: 'vitamin_b12', type: 'number' },
    { name: 'nutrition_score_fr', type: 'number' }
  ]
});
