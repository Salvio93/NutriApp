import { database } from './watermelondb/database';
import { Q } from "@nozbe/watermelondb";


const savedItemsCollection = database.get('saved_items');

//? for each should be for.. of?
//! The saved_items database is the journal of eaten items with quantity for a certain day (timestamp)

/**
 * Add a saved item to the journal of the current day (timestamp)
 * 
 * @param {Object} item 
 * @param {int} quantity (in grams)
 * @param {date} timestamp 
 */
export const addSavedItem = async (item,quantity,timestamp) => {
  await database.write(async () => {
    await savedItemsCollection.create(savedItem => {
      savedItem.code = item.code;
      savedItem.product_name = item.product_name;
      savedItem.quantity = quantity;
      savedItem.timestamp = new Date(timestamp).getTime();
      savedItem.kcal = Math.round((item["energy_kcal_100g"]/100) * quantity);
      nutrientFields.forEach((element) => savedItem[element] = item[element+"_100g"] || 0);

    });
  });
};

/**
 * Delete a saved item from the journal
 * 
 * @param {int} barcode 
 * @param {date} timestamp 
 */
export const deleteSavedItem = async (barcode, timestamp) => {
  const matches = await savedItemsCollection
    .query(
      Q.where('code', barcode),
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

/**
 * Calculates total vitamins and nutrients consumed on a given date of journal
 * 
 * @param {date} dateStr 
 * @returns {array} totals (of each nutrient)
 */
export const getAllVitaminsByDate = async (dateStr) => {
  const start = new Date(`${dateStr}T00:00:00`).getTime();
  const end = new Date(`${dateStr}T23:59:59`).getTime();

  const items = await savedItemsCollection
    .query(Q.where('timestamp', Q.between(start, end)))
    .fetch();

  const totals = {};
  nutrientFields.forEach((field)=> totals[field] =0)

  items.forEach((item) => {
    nutrientFields.forEach((field) => {
      const value = item[field];
      totals[field] += ((value * item.quantity) / 100);
    });
  });
  return totals; // e.g. { protein: 23.2, ... }
};


