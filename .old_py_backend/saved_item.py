from fastapi import FastAPI,APIRouter, Request
import duckdb

router = APIRouter()
conn = duckdb.connect("local_foods.duckdb")

conn.execute("""
CREATE TABLE IF NOT EXISTS saved_items (
    code TEXT,
    quantity FLOAT,
    timestamp TIMESTAMP,
    FOREIGN KEY (code) REFERENCES food_items(code),

    proteins FLOAT,
    carbohydrates FLOAT,
    sugars FLOAT,
    fat FLOAT,
    omega_3 FLOAT,
    omega_6 FLOAT,
    omega_9 FLOAT,
    cholesterol FLOAT,
    fiber FLOAT,
    sodium FLOAT,
    potassium FLOAT,
    calcium FLOAT,
    iron FLOAT,
    magnesium FLOAT,
    zinc FLOAT,
    alcohol FLOAT,
    vitamin_a FLOAT,
    vitamin_d FLOAT,
    vitamin_e FLOAT,
    vitamin_k FLOAT,
    vitamin_c FLOAT,
    vitamin_b1 FLOAT,
    vitamin_b2 FLOAT,
    vitamin_pp FLOAT,
    vitamin_b6 FLOAT,
    vitamin_b9 FLOAT,
    vitamin_b12 FLOAT,
    nutrition_score_fr FLOAT
)
""")


@router.get("/all")
def get_all_saved():
    rows = conn.execute("""
        SELECT 
            s.code, 
            f.product_name, 
            s.quantity, 
            s.timestamp, 
            f."energy-kcal_100g" AS kcal
        FROM saved_items s
        JOIN food_items f ON s.code = f.code
    """).fetchall()
    return {"items": rows}

@router.get("/all_vitamine/{date}")
def get_all_vitamine_saved(date: str):
    rows = conn.execute("""
        SELECT 
            *
        FROM saved_items
                                WHERE strftime('%Y-%m-%d', saved_items.timestamp) = ?

    """, [date]).fetchall()
    return {"items": rows}



@router.get("/by-date/{date}")
def get_saved_by_date(date: str):
    rows = conn.execute("""
        SELECT 
            saved_items.code, 
            food_items.product_name, 
            saved_items.quantity, 
            saved_items.timestamp, 
            food_items."energy-kcal_100g" AS kcal
        FROM saved_items
        JOIN food_items ON saved_items.code = food_items.code
        WHERE strftime('%Y-%m-%d', saved_items.timestamp) = ?
    """, [date]).fetchall()
    return {"items": rows}




@router.post("/add")
async def add_saved(request: Request):
    data = await request.json()
    code = data["code"]
    quantity = float(data["quantity"])
    timestamp = data["timestamp"] # fallback if not provided
    print(code)
    # Fetch nutrients
    food = conn.execute("SELECT * FROM food_items WHERE code = ?", [code]).fetchone()
    if not food:
        return {"error": f"Food item with code {code} not found in food_items"}

    # Columns from food_items
    col_names = [desc[0] for desc in conn.description]
    nutrient_fields = [
        "proteins_100g", "carbohydrates_100g", "sugars_100g", "fat_100g",
        "omega-3-fat_100g", "omega-6-fat_100g", "omega-9-fat_100g",
        "cholesterol_100g", "fiber_100g", "sodium_100g", "potassium_100g",
        "calcium_100g", "iron_100g", "magnesium_100g", "zinc_100g", "alcohol_100g",
        "vitamin-a_100g", "vitamin-d_100g", "vitamin-e_100g", "vitamin-k_100g",
        "vitamin-c_100g", "vitamin-b1_100g", "vitamin-b2_100g", "vitamin-pp_100g",
        "vitamin-b6_100g", "vitamin-b9_100g", "vitamin-b12_100g",
        "nutrition-score-fr_100g"
    ]

    # Scale nutrient values
    scaled = {}
    for field in nutrient_fields:
        if field in col_names:
            idx = col_names.index(field)
            val_per_100g = food[idx]
            scaled[field.replace("-fat", "").replace("-", "_").replace("_100g", "")] = round((val_per_100g or 0) * quantity / 100, 2)

    fields = ["code", "quantity", "timestamp"] + list(scaled.keys())
    placeholders = ", ".join(["?"] * len(fields))
    values = [code, quantity, timestamp] + list(scaled.values())

    # Always insert a new record
    conn.execute(
        f"INSERT INTO saved_items ({', '.join(fields)}) VALUES ({placeholders})",
        values
    )

    return {
        "status": "added",
        "code": code,
        "quantity": quantity,
        "timestamp": timestamp,
        "nutrients": scaled
    }


@router.post("/add_old")
async def add_saved_old(request: Request):
    data = await request.json()
    code = data["code"]
    quantity = float(data["quantity"])
    timestamp = data["timestamp"].split("T")[0]

    # Fetch nutrients from food_items
    food = conn.execute("SELECT * FROM food_items WHERE code = ?", [code]).fetchone()
    if not food:
        return {"error": f"Food item with code {code} not found in food_items"}

    # Get column names from food_items (so we can map them to saved_items)
    col_names = [desc[0] for desc in conn.description]

    # Nutrient fields to copy & scale
    nutrient_fields = [
        "proteins_100g",
        "carbohydrates_100g",
        "sugars_100g",
        "fat_100g",
        "omega-3-fat_100g",
        "omega-6-fat_100g",
        "omega-9-fat_100g",
        "cholesterol_100g",
        "fiber_100g",
        "sodium_100g",
        "potassium_100g",
        "calcium_100g",
        "iron_100g",
        "magnesium_100g",
        "zinc_100g",
        "alcohol_100g",
        "vitamin-a_100g",
        "vitamin-d_100g",
        "vitamin-e_100g",
        "vitamin-k_100g",
        "vitamin-c_100g",
        "vitamin-b1_100g",
        "vitamin-b2_100g",
        "vitamin-pp_100g",
        "vitamin-b6_100g",
        "vitamin-b9_100g",
        "vitamin-b12_100g",
        "nutrition-score-fr_100g"
    ]

    # Check if item already saved TODAY TODAY TODAT

    #TODAY TODAY TODAY
    existing = conn.execute("SELECT quantity FROM saved_items WHERE code = ? AND timestamp = ?", [code,timestamp]).fetchone()
    #la qtt en gros
    print(existing)
    print("aaaaaaa")
    if existing:
        prev_qty = existing[0] or 0.0
        quantity = prev_qty + quantity


    # Scale nutrients
    scaled = {}
    for field in nutrient_fields:
        if field in col_names:
            idx = col_names.index(field)
            val_per_100g = food[idx]
            if val_per_100g is not None:
                #[f'"{f}"' for f in fields]
                scaled[field.replace("-fat", "").replace("-", "_").replace("_100g", "")] = round((val_per_100g * quantity / 100), 2)
            else:
                scaled[field.replace("-fat", "").replace("-", "_").replace("_100g", "")] = 0


    
    big_string = "quantity = " + str(quantity) +", "
    for fields,values in scaled.items():
        big_string = big_string + str(fields) + " = " + str(values) + ", " 
    print(big_string[:-2])

    if existing:
        conn.execute(
            f"""UPDATE saved_items SET {big_string[:-2]}
            WHERE code = {code} """
        )
    else:
        fields = ["code", "quantity", "timestamp"] + list(scaled.keys())
        placeholders = ", ".join(["?"] * len(fields))
        values = [code, quantity, timestamp] + list(scaled.values())

        conn.execute(
            f"INSERT INTO saved_items ({', '.join(fields)}) VALUES ({placeholders})",
            values
        )

    return {
        "status": "added",
        "code": code,
        "quantity": quantity,
        "nutrients": scaled
    }

@router.post("/delete")
async def delete_saved(request: Request):
    data = await request.json()
    code = data["code"]
    timestamp = data["timestamp"]

    if not code or not timestamp:
        return {"error": "Missing code or timestamp"}

    conn.execute("DELETE FROM saved_items WHERE code = ? AND timestamp = ?", [code, timestamp])
    return {"status": "deleted", "code": code, "timestamp": timestamp}

@router.post("/delete_old")
async def delete_saved_old(request: Request):
    data = await request.json()
    code = data.get("code")
    if not code:
        return {"error": "Missing code"}
    conn.execute("DELETE FROM saved_items WHERE code = ?", [code])
    return {"status": "deleted", "code": code}