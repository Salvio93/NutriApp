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
    const res = await fetch(`https://world.openfoodfacts.net/api/v3/product/${barcode}?fields=product_name,abbreviated_product_name,generic_name,nutriments`);
    const json = await res.json();
    const product = json.product;
    
    if (!product) return { status: "no product" };

    mergeEstimatedNutriments(product);

    const nutr = product.nutriments || {};
    const values = {
      code: barcode,
      product_name: product.abbreviated_product_name  || product.product_name || product.generic_name || "Unknown",
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



export const insertProductBySearch = async (searched_item) => {
  try {
    const nutr = searched_item.nutriments || {};
    const values = {
      code: searched_item.code,
      product_name: searched_item.product_name  || "Unknown",
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

    return { status: "storedbysearch", name: searched_item.product_name };
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


  const filtered = data.products
  .map((p) => mergeEstimatedNutriments(p))
  .filter((p) => {
    const hasKcal = checkHasKcal(p);
    const hasName = checkHasName(p);
    return hasKcal && hasName;
  })

  // 3. Limit to 30 items
  return filtered.slice(0, 30)
};
const checkHasKcal = (p) => {
  if (!p?.nutriments) return false;

  // already has kcal_100g
  if (p.nutriments["energy-kcal_100g"] !== undefined) return true;

  // fallback: energy-kcal (no _100g)
  if (p.nutriments["energy-kcal"] !== undefined) {
    p.nutriments["energy-kcal_100g"] = p.nutriments["energy-kcal"];
    return true;
  }

  return false;
};

const checkHasName = (p) => {
  const { abbreviated_product_name, product_name, generic_name } = p;

  if (abbreviated_product_name && abbreviated_product_name.trim() !== "") {
    p.product_name = abbreviated_product_name;
    return true;
  }

  if (product_name && product_name.trim() !== "") {
    p.product_name = product_name;
    return true;
  }

  if (generic_name && generic_name.trim() !== "") {
    p.product_name = generic_name;
    return true;
  }

  return false;
};

const mergeEstimatedNutriments = (p) => {
  if (!p.nutriments) p.nutriments = {};
  const estimated = p.nutriments_estimated || {};

  for (const key in estimated) {
    if (
      p.nutriments[key] === undefined ||
      p.nutriments[key] === null ||
      p.nutriments[key] === ""
    ) {
      p.nutriments[key] = estimated[key];
    }
  }

  return p; // returns the updated product
};

