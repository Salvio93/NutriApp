import datetime
import json
from garminconnect import Garmin
from fastapi import FastAPI,APIRouter, Request


import duckdb
router = APIRouter()

app = FastAPI()
conn = duckdb.connect("local_foods.duckdb")

# Crée la table si elle n'existe pas
conn.execute("""
CREATE TABLE IF NOT EXISTS garmin_data (
    date DATE PRIMARY KEY,
    total_kcal INTEGER,
    rest_kcal INTEGER,
    active_kcal INTEGER,
    updated_at TIMESTAMP
)
""")

# Load credentials
email = ""
password = ""


def fetch_from_garmin_api(date_str: str):
    try:
        api = Garmin(email,password)
        api.login()

        stats = api.get_stats(date_str)
        
        return {
            "date": date_str,
            "total_kcal": stats.get("totalKilocalories", 0),
            "rest_kcal": stats.get("bmrKilocalories", 0),
            "active_kcal": stats.get("activeKilocalories", 0),
        }
    except Exception as e:
        return {"date": date_str, "error": str(e)}

@router.get("/cache_fetch/{date}")
def get_cached_kcal_by_date(date:str):
    
    # Check if we already have this date in the DB
    row = conn.execute("""
        SELECT date, total_kcal, rest_kcal, active_kcal, updated_at
        FROM garmin_data
        WHERE date = ?
    """, [date]).fetchone()

    if row:
        # Return cached value
        return {
            "date": str(row[0]),
            "total_kcal": row[1],
            "rest_kcal": row[2],
            "active_kcal": row[3],
            "source": "cached_fetch"
        }


@router.get("/date/{date}")
def get_kcal_by_date(date: str):
    now = datetime.datetime.now()
    ten_minutes = now - datetime.timedelta(minutes=10)

    # Check if we already have this date in the DB
    row = conn.execute("""
        SELECT date, total_kcal, rest_kcal, active_kcal, updated_at
        FROM garmin_data
        WHERE date = ?
    """, [date]).fetchone()

    if row:
        updated_at = row[4]
        print(updated_at)
        print(ten_minutes)
        if updated_at and updated_at > ten_minutes:
            # Return cached value
            return {
                "date": str(row[0]),
                "total_kcal": row[1],
                "rest_kcal": row[2],
                "active_kcal": row[3],
                "source": "cache"
            }

    # Fetch new data from Garmin API
    data = fetch_from_garmin_api(date)

    if "error" in data:
        return data  # Return error if Garmin API fails

    # Insert or update the DB
    conn.execute("""
        INSERT INTO garmin_data (date, total_kcal, rest_kcal, active_kcal, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT (date) DO UPDATE SET
            total_kcal = EXCLUDED.total_kcal,
            rest_kcal = EXCLUDED.rest_kcal,
            active_kcal = EXCLUDED.active_kcal,
            updated_at = EXCLUDED.updated_at
    """, [data["date"], data["total_kcal"], data["rest_kcal"], data["active_kcal"], now])

    return {**data, "source": "fresh"}

#print(get_kcal_by_date("2025-06-25"))