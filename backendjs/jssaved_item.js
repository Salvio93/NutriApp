import { database } from './watermelondb/database';
import { Q } from "@nozbe/watermelondb";


const savedItemsCollection = database.get('saved_items'); //ici

export const addSavedItem = async (item,quantity,timestamp) => {
  await database.write(async () => {
    await savedItemsCollection.create(savedItem => {
      savedItem.code = item.code;
      savedItem.product_name = item.product_name;
      savedItem.quantity = quantity;
      savedItem.timestamp = new Date(timestamp).getTime();
      savedItem.kcal = (item["energy_kcal_100g"]/100) * quantity
      nutrientFields.forEach((element) => savedItem[element] = item[element+"_100g"] || 0);

    });
  });
  //console.log(await getAllSavedItems());
};

export const deleteSavedItem = async (code, timestamp) => {
  const matches = await savedItemsCollection
    .query(
      Q.where('code', code),
      Q.where('timestamp', new Date(timestamp).getTime())
    )
    .fetch();

  await database.write(async () => {
    for (const item of matches) {
      await item.destroyPermanently();
    }
  });
};

export const getSavedItemsByDate = async (dateStr) => {
  const start = new Date(`${dateStr}T00:00:00`).getTime();
  const end = new Date(`${dateStr}T23:59:59`).getTime();

  const res = await savedItemsCollection
    .query(Q.where('timestamp', Q.between(start, end)))
    .fetch();
  console.log(res)
  return res;
};

export const getAllSavedItems = async () => {
  return await savedItemsCollection.query().fetch();
};

const nutrientFields = [
  "proteins", "carbohydrates", "sugars", "fat",
  "omega_3", "omega_6", "omega_9",
  "cholesterol", "fiber", "sodium", "potassium",
  "calcium", "iron", "magnesium", "zinc", "alcohol",
  "vitamin_a", "vitamin_d", "vitamin_e", "vitamin_k",
  "vitamin_c", "vitamin_b1", "vitamin_b2", "vitamin_pp",
  "vitamin_b6", "vitamin_b9", "vitamin_b12",
  "nutrition_score_fr"
];

export const getAllVitaminsByDate = async (dateStr) => {
  const start = new Date(`${dateStr}T00:00:00`).getTime();
  const end = new Date(`${dateStr}T23:59:59`).getTime();

  const items = await savedItemsCollection
    .query(Q.where('timestamp', Q.between(start, end)))
    .fetch();

  // Initialize totals
  const totals = {};
  nutrientFields.forEach((field)=> totals[field] =0)
  // Sum nutrients
  items.forEach((item) => nutrientFields.forEach((field) => totals[field] += item[field]*(item[quantity]/100) || 0 ));
  

  return totals; // e.g. { protein: 23.2, ... }
};


//modif