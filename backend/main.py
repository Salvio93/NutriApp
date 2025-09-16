import duckdb
import requests
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI,Request, Query
from user_data import router as user_router
from saved_item import router as saved_router
from garmin_kcal_export import router as garmin_router

import openfoodfacts


api = openfoodfacts.API(user_agent="my-nutrition-app/1.0")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["192.168.0.81:8081"],  # Replace with your actual frontend IP in production
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(user_router, prefix="/user")
app.include_router(saved_router, prefix="/saved")
app.include_router(garmin_router, prefix="/garmin")


# Connect to DuckDB file
conn = duckdb.connect("local_foods.duckdb")

# Field list (all are FLOAT)
fields = [
    "energy_100g",
    "energy-kcal_100g",
    "proteins_100g", #ordre pas bon lol
    "carbohydrates_100g",
    "sugars_100g",
    "glucose_100g",
    "fructose_100g",
    "lactose_100g",
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
    "nutrition-score-fr_100g",
    "nutrition-score-uk_100g"
]

# Build SQL CREATE TABLE dynamically
columns_sql = ",\n    ".join([f'"{f}" FLOAT' for f in fields])


create_sql = f"""
CREATE TABLE IF NOT EXISTS food_items (
    code TEXT PRIMARY KEY,
    product_name TEXT,
    {columns_sql}
);
"""
conn.execute(create_sql)









@app.get("/")
def root():
    return {"status": "server is alive"}

@app.get("/scan/all")
def get_all_product_names():
    rows = conn.execute("SELECT * FROM food_items").fetchall()
    return {"items": [[{elem }for elem in data] for data in rows]}

@app.get("/scan/last")
def get_last_added_item():
    row = conn.execute("""
        SELECT * FROM food_items ORDER BY rowid DESC LIMIT 1
    """).fetchone()

    if not row:
        return {"error": "No items found"}

    return {"items": [{data} for data in row]}


@app.get("/scan/search/{searchQuery}")
def search_food_items(searchQuery: str):
    print(searchQuery)
    results = api.product.text_search(searchQuery)
    
    # Return the top 10 results with basic info
    products = results.get("products", [])[:10]
    simplified = [
        {
            "code": p.get("code"),
            "product_name": p.get("product_name", "Unknown")
        }
        for p in products if p.get("code") and p.get("product_name")
    ]

    return {"results": simplified}

@app.get("/scan/add/{barcode}")
def fetch_and_store(barcode):

    url = f"https://world.openfoodfacts.net/api/v3/product/{barcode}?fields=product_name,nutriments"
    res = requests.get(url)

    if res.status_code != 200:
        print(f"Failed to fetch product {barcode}")
        return

    product = res.json().get("product")
    if not product:
        print(f"No product data for {barcode}")
        return

    # Check if already in DB
    if conn.execute("SELECT 1 FROM food_items WHERE code = ?", [barcode]).fetchone():
        print("Already in database:", product.get("product_name"))
        return {"status": "Already in database", "name": product.get("product_name", "")}

    nutr = product.get("nutriments", {})

    values = [barcode, product.get("product_name", "Unknown")]
    for field in fields:
        if nutr.get(field) is None or nutr.get(field) == "null":
            values.append(0)
        else:
            values.append(nutr.get(field))

    placeholders = ', '.join(['?'] * len(values))
    field_list = ', '.join(['code', 'product_name']+ [f'"{f}"' for f in fields])

    conn.execute(
        f"INSERT INTO food_items ({field_list}) VALUES ({placeholders})",
        values
    )


    print("Saved:", product.get("product_name"))
    print(conn.execute("SELECT * FROM food_items").fetchall())
    return {"status": "stored", "name": product.get("product_name", "")}

#fetch_and_store("3017624010701")

@app.post("/scan/modify/{barcode}")
async def modify_item(barcode, request: Request):
    data = await request.json()
    values = [entry[0] for entry in data]
    params = values[1:] + [values[0]]  # all new values + code at last for the sql 
    set_clause = '"product_name" = ?, '+", ".join([f'"{field}" = ?' for field in fields])

    conn.execute(f"""
        UPDATE food_items SET {set_clause} WHERE code = ?
    """, params)

    return {"status": "modified "+barcode}


@app.get("/scan/delete/{barcode}")
async def delete_item(barcode):
    code = barcode

    if not code:
        return {"error": "Missing code"}
    

    if not conn.execute("SELECT 1 FROM saved_items WHERE code = ?", [barcode]).fetchone():
        conn.execute("DELETE FROM food_items WHERE code = ?", [code])
        return {"status": "deleted", "code": code}
    else:
        return {"status": "cant delete from db", "code": code} 

print(conn.execute("SELECT * FROM food_items").fetchall())
