import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { appSchema } from '@nozbe/watermelondb';
import { migrations } from './migrations';
import { userSchema } from './user_schema';
import { foodSchema } from './food_schema';
import { savedSchema } from './saved_schema';
import { garminSchema } from './garmin_schema';

// import other schemas as needed

import User from './User';
import Food from './Food';
import Saved from './Saved';
import Garmin from './Garmin';
// import other models as needed

const schema = appSchema({
  version: 3,
  tables: [
    userSchema,
    foodSchema,
    savedSchema,
    garminSchema,
  ],
    migrations,
});

const adapter = new SQLiteAdapter({
  schema,
});

export const database = new Database({
  adapter,
  modelClasses: [
    User,
    Food,
    Saved,
    Garmin,
  ],
});
