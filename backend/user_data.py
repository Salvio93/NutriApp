from fastapi import FastAPI, Request
import duckdb
from fastapi import APIRouter
router = APIRouter()

app = FastAPI()
conn = duckdb.connect("local_foods.duckdb")

# Crée la table si elle n'existe pas
conn.execute("""
CREATE TABLE IF NOT EXISTS user_data (
    id INTEGER PRIMARY KEY,
    gender TEXT,
    age INTEGER,
    height INTEGER,
    weight REAL,
    kcal INTEGER,
)
""")
fields = ["id", "gender", "age", "height", "weight","kcal"]
field_list = ', '.join([]+ [f'"{f}"' for f in fields])

values = [1, 'H', 21, 175, 65.0, 2300]
values_list = ', '.join([]+ [f'"{f}"' for f in values])

# Initialise une ligne par défaut si vide (first time)
conn.execute("""
INSERT INTO user_data (id, gender, age, height, weight, kcal)
SELECT 1, 'H', 21, 175, 65.0, 2006
WHERE NOT EXISTS (SELECT 1 FROM user_data WHERE id = 1)
""")
#conn.execute(f"""INSERT INTO user_data ({field_list}) VALUES ({values_list})""")

@router.get("/data")
def get_user_data():
    row = conn.execute("SELECT gender, age, height, weight, kcal FROM user_data WHERE id = 1").fetchone()
    return {
        "gender": row[0],
        "age": row[1],
        "height": row[2],
        "weight": row[3],
        "kcal": row[4]
    }

@router.post("/update")
async def update_user_data(request: Request):
    data = await request.json()
    kcal_reduction = 200
    kcal = calc_kcal(data['gender'],int(data['age']),int(data['height']),float(data['weight'])) - kcal_reduction
    data["kcal"]= kcal
    print(data)
    conn.execute("""
        UPDATE user_data
        SET gender = ?, age = ?, height = ?, weight = ?, kcal = ?
        WHERE id = 1
    """, [
        data['gender'],
        int(data['age']),
        int(data['height']),
        float(data['weight']),
        int(data['kcal']),
    ])


    return {"kcal": kcal}


def calc_kcal(gender,age,height,weight):
    is_female = gender == "F"

    if age < 4:
        return 1000
    elif age < 9:
        return 1200 if is_female else 1500
    elif age < 14:
        return 1600 if is_female else 1800
    elif age < 19:
        return 1800 if is_female else 2800
    elif age < 31:
        return 2000 if is_female else 2600
    elif age < 51:
        return 1800 if is_female else 2200
    else:
        return 1600 if is_female else 2000
