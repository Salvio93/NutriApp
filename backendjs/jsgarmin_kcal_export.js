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
  if (row && row.date === dateStr && dayjs(row.updated).isAfter(tenMinAgo)) {
    return {
      date: row.date,
      total_kcal: row.total_kcal,
      rest_kcal: row.rest_kcal,
      active_kcal: row.active_kcal,
      updated: row.updated,
      source: 'cache_of_today'
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
    const start = dayjs(dateStr).startOf('day').toDate();
    const end = dateStr === now.format('YYYY-MM-DD') ? now.toDate() : dayjs(dateStr).endOf('day').toDate();

    const opt = {
      startDate: start,
      endDate: end, // required
      basalCalculation: true, // optional, to calculate or not basalAVG over the week
      bucketUnit: BucketUnit.DAY, // optional - default "DAY". Valid values: "NANOSECOND" | "MICROSECOND" | "MILLISECOND" | "SECOND" | "MINUTE" | "HOUR" | "DAY"
      bucketInterval: 1, // optional - default 1. 
    };
    let stats;
    await GoogleFit.getDailyCalorieSamples(opt).then((res) => {
      console.log(res);
      stats = res[0]
    });
    console.log(stats)
    
    const data = {
      date: dateStr,
      total_kcal: stats.totalKilocalories ?? Math.round(stats.calorie), //no data with this shit api
      rest_kcal: stats.bmrKilocalories ?? 1486, //no data with this shit api
      active_kcal: Math.round(stats.calorie) ?? 0,
      updated: now.toISOString(),
    };
    console.log(data)
    
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
    });

    return {
      date: dateStr,
      total_kcal: data.total_kcal|| 0,
      rest_kcal: data.rest_kcal || 0,
      active_kcal: data.active_kcal ||0,
      source: 'google-fit',
    };
  } catch (err) {
    console.error('Google Fit error:', err);
    return { error: err.message };
  }

  
};


//test