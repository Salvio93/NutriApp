import { database } from './watermelondb/database';
import { Q } from "@nozbe/watermelondb";

const calcKcal = (gender, age) => {
  const isFemale = gender === 'F';
  if (age < 4) return 1000;
  if (age < 9) return isFemale ? 1200 : 1500;
  if (age < 14) return isFemale ? 1600 : 1800;
  if (age < 19) return isFemale ? 1800 : 2800;
  if (age < 31) return isFemale ? 2000 : 2600;
  if (age < 51) return isFemale ? 1800 : 2200;
  return isFemale ? 1600 : 2000;
};

// Creates default user row if not present
export const initUserData = async () => {
  const userCollection =  await database.get('user_data');
  const allUsers = await userCollection.query().fetch();

  if (allUsers.length === 0) {
    await database.write(async () => {
      await userCollection.create(user => {
        user.gender = 'H';
        user.age = 21;
        user.height = 175;
        user.weight = 65;
        user.kcal = 2006;
      });
    });
  }
};

export const getUserData = async () => {
  const user =  await database.get('user_data').query().fetch();
  const firstUser = user[0]
  const userData = {
    gender: firstUser.gender,
    age: firstUser.age,
    height: firstUser.height,
    weight: firstUser.weight,
    kcal: firstUser.kcal,
  };
  console.log(userData);
  return userData; // Only one row expected
};

export const updateUserData = async ({ gender, age, height, weight }) => {
  const userCollection = await database.get('user_data');
  const [user] = await userCollection.query().fetch();

  const kcalReduction = 200;
  const kcal = calcKcal(gender, age) - kcalReduction;
  console.log(user)
  if (user) {
    await database.write(async () => {
      await user.update(u => {
        u.gender = gender;
        u.age = age;
        u.height = height;
        u.weight = weight;
        u.kcal = kcal;
      });
    });
  }

  return kcal;
};
