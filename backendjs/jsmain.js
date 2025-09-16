import { database } from './watermelondb/database';
import { Q } from "@nozbe/watermelondb";

export const getAllItems = async () => {
  const collection = await database.get('food_items').query().fetch();
  //console.log("*----"+collection[0].code)
  return collection;
};

export const getItemByCode = async (code) => {
  const item = await database.get('food_items').query(Q.where('code', code));
  //console.log(all[all.length - 1][0])
  return item;
};

export const insertProductFromAPI = async (barcode) => {
  try {
    const res = await fetch(`https://world.openfoodfacts.net/api/v3/product/${barcode}?fields=product_name,nutriments`);
    const json = await res.json();
    //console.log("jsmain "+ JSON.stringify(json));
    const product = json.product;
    
    if (!product) return { status: "no product" };

    const nutr = product.nutriments || {};
    const values = {
      code: barcode,
      product_name: product.product_name || "Unknown",
    };

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

export const updateProduct = async (productArray) => {
  const code = productArray[0][0];
  const collection = await database.get('food_items');
  const existing = await collection.query().fetch();
  const target = existing.find(i => i.code === code);
  if (!target) return;

  const updatedValues = {};
  updatedValues.product_name = productArray[1][0];
  const fieldsOnly = productArray.slice(2).map((val, i) => ({
    key: fields[i].replace(/-/g, '_'),
    value: val?.[0] ?? 0
  }));

  await database.write(async () => {
    await target.update(item => {
      item.product_name = updatedValues.product_name;
      fieldsOnly.forEach(f => {
        item[f.key] = f.value;
      });
    });
  });
};

export const deleteProduct = async (code) => {
  const collection = await database.get('food_items');
  const all = await collection.query().fetch();
  const toDelete = all.find(i => i.code === code);
  //console.log("jsmain/deleteProduct",toDelete);
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
  //console.log(data);
  return data.products.slice(0, 10).map(p => ({
    code: p.code,
    product_name: p.product_name
  }));
};
