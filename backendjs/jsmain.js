import { database } from './watermelondb/database';
import { Q } from "@nozbe/watermelondb";

const fields = [
      "energy_100g", "energy-kcal_100g", "proteins_100g", "carbohydrates_100g", "sugars_100g",
      "glucose_100g", "fructose_100g", "lactose_100g", "fat_100g",
      "omega-3-fat_100g", "omega-6-fat_100g", "omega-9-fat_100g", "cholesterol_100g",
      "fiber_100g", "sodium_100g", "potassium_100g", "calcium_100g", "iron_100g", "magnesium_100g",
      "zinc_100g", "alcohol_100g", "vitamin-a_100g", "vitamin-d_100g", "vitamin-e_100g",
      "vitamin-k_100g", "vitamin-c_100g", "vitamin-b1_100g", "vitamin-b2_100g", "vitamin-pp_100g",
      "vitamin-b6_100g", "vitamin-b9_100g", "vitamin-b12_100g", "nutrition-score-fr_100g",
      "nutrition-score-uk_100g"
    ];

export const getAllItems = async () => {
  const collection = await database.get('food_items').query().fetch();
  return collection;
};

export const getItemByCode = async (code) => {
  const item = await database.get('food_items').query(Q.where('code', code));
  return item;
};

export const insertProductFromAPI = async (barcode) => {
  try {
    const res = await fetch(`https://world.openfoodfacts.net/api/v3/product/${barcode}?fields=product_name,nutriments`);
    const json = await res.json();
    const product = json.product;
    
    if (!product) return { status: "no product" };

    const nutr = product.nutriments || {};
    const values = {
      code: barcode,
      product_name: product.product_name || "Unknown",
    };


    fields.forEach(f => {
      values[f.replace(/-/g, '_')] = parseFloat(nutr[f]) || 0;
    });

    const collection = await database.get('food_items');
    await database.write(async () => {
      await collection.create(item => {
        Object.keys(values).forEach(key => {
          item[key] = values[key];
        });
      });
    });

    return { status: "stored", name: product.product_name };
  } catch (err) {
    console.error("Insert error", err);
    return { status: "error" };
  }
};
export const modifyProduct = async (updatedItem) => {
  try {
    if (!updatedItem.code) {
      throw new Error("Missing primary key field: code");
    }

    const matches = await database.get("food_items") // ✅ corrected collection
      .query(Q.where("code", updatedItem.code))
      .fetch();

    if (matches.length === 0) {
      console.warn("No item found to modify:", updatedItem);
      return;
    }
    const itemToModify = matches[0];

    await database.write(async () => {
      await itemToModify.update((savedItem) => {
        Object.keys(updatedItem).forEach((key) => {
          if (updatedItem[key] !== undefined && key != "id") {
            savedItem[key] = updatedItem[key];
          }
        });
      });
    });

  } catch (err) {
    console.error("Failed to modify item:", err);
  }
};



export const deleteProduct = async (code) => {
  const collection = await database.get('food_items');
  const all = await collection.query().fetch();
  const toDelete = all.find(i => i.code === code);
  if (toDelete) {
    await database.write(async () => {
      await toDelete.markAsDeleted();
      await toDelete.destroyPermanently();
    });
  }
};

export const searchFoodOnline = async (query) => {
  const res = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1`);
  const data = await res.json();


  const filtered = data.products.filter((p) => {
    // 1. Must have kcal4
    console.log(p["product_name"])
    const hasKcal = true//p["energy_kcal_100g"] && p["energy_kcal_100g"] > 0;

    return hasKcal;
  });

  // 3. Limit to 10 items
  return filtered.slice(0, 10).map((p) => ({
    code: p.code,
    product_name: p.product_name,
  }));
};
