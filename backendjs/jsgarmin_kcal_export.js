import { Q } from '@nozbe/watermelondb';
import dayjs from 'dayjs';
import { database } from './watermelondb/database';
import GoogleFit, { Scopes, BucketUnit } from 'react-native-google-fit';

const garminCollection = database.get('garmin_data');

// ⏪ Pure local cache fetch
export const getGarminKcalFromCache = async (dateStr) => {
  const result = await garminCollection.query(Q.where('date', dateStr)).fetch();
  const row = result[0];

  if (!row) return { error: 'Not found in local DB' };

  return {
    date: row.date,
    total_kcal: row.total_kcal,
    rest_kcal: row.rest_kcal,
    active_kcal: row.active_kcal,
    updated: row.updated,
    source: 'cache_only'
  };
};

// 🌐 Smart fetch with cache check
export const getGarminKcalByDate = async (dateStr) => {
  const now = dayjs();
  const tenMinAgo = now.subtract(10, 'minute');

  const result = await garminCollection.query(Q.where('date', dateStr)).fetch();
  const row = result[0];

  if (row && dayjs(row.updated).isAfter(tenMinAgo)) {
    return {
      date: row.date,
      total_kcal: row.total_kcal,
      rest_kcal: row.rest_kcal,
      active_kcal: row.active_kcal,
      updated: row.updated,
      source: 'cache'
    };
  }

  try {
    

    const options = {
      scopes: [
        Scopes.FITNESS_ACTIVITY_READ,
        Scopes.FITNESS_BODY_READ,
      ],
    };

    const authorized = await GoogleFit.authorize(options);

    if (!authorized.success) {
      return { error: 'Authorization failed'+ authorized.message };
    }

    const start = dayjs(dateStr).startOf('day').toISOString();
    const end = dayjs(dateStr).endOf('day').toISOString();

    const results = await GoogleFit.getDailyCalorieSamples({
      startDate: start,
      endDate: end,
    });

    const calories = results.find(r => r.source === 'com.google.android.gms.fit') || results[0];
    console.log(calories)
    /*
    const data = {
      date: dateStr,
      total_kcal: stats.totalKilocalories ?? 0,
      rest_kcal: stats.bmrKilocalories ?? 0,
      active_kcal: stats.activeKilocalories ?? 0,
      updated: now.toISOString(),
    };

    await database.write(async () => {
      if (row) {
        await row.update(r => {
          r.total_kcal = data.total_kcal;
          r.rest_kcal = data.rest_kcal;
          r.active_kcal = data.active_kcal;
          r.updated = data.updated;
        });
      } else {
        await garminCollection.create(r => {
          r.date = data.date;
          r.total_kcal = data.total_kcal;
          r.rest_kcal = data.rest_kcal;
          r.active_kcal = data.active_kcal;
          r.updated = data.updated;
        });
      }
    });*/

    return {
      date: dateStr,
      total_kcal: calories?.calorie || 0,
      source: 'google-fit',
    };
  } catch (err) {
    console.error('Google Fit error:', err);
    return { error: err.message };
  }

  
};


//    await GCClient.login("salviostrazzante0@gmail.com" ,"IDon'tAimeCambiareDiWachtWoord-GarminCorp0" );
