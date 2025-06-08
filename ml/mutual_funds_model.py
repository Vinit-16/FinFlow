# mutual_funds_model.py

import json
import csv

def convert_json_to_csv(json_file, csv_file):
    """
    Converts a JSON file to a CSV file.
    """
    # Load data from JSON file
    with open(json_file, 'r') as file:
        data = json.load(file)
    
    # Extract mutual fund data from the correct key
    mutual_funds = data.get("schemedata", [])  # Adjust the key based on your JSON structure
    
    if not mutual_funds:
        print("No valid mutual fund data found in JSON.")
        return
    
    # Extract field names from the first entry
    fieldnames = mutual_funds[0].keys()
    
    # Write data to CSV file
    with open(csv_file, 'w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(mutual_funds)
    
    print(f"CSV file saved as {csv_file}")

def safe_float(value, default=0):
    """
    Safely converts a value to float. Returns a default value if conversion fails.
    """
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

def get_best_mutual_funds(market_cap, file_path, output_csv="top_mutual_funds.csv"):
    """
    Recommends the top mutual funds based on the market cap classification.
    """
    mutual_funds = []

    # Read the CSV file
    with open(file_path, 'r', newline='', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            mutual_funds.append({
                "s_name": row.get("s_name", "").strip(),
                "classification": row.get("classification", "").strip().lower(),
                "returns_10year": safe_float(row.get("returns_10year", 0)),
                "returns_5year": safe_float(row.get("returns_5year", 0)),
                "returns_3year": safe_float(row.get("returns_3year", 0)),
                "returns_1year": safe_float(row.get("returns_1year", 0)),
                "returns_3month": safe_float(row.get("returns_3month", 0)),
                "expenceratio": safe_float(row.get("expenceratio", float('inf'))),
                "turnover_ratio": safe_float(row.get("turnover_ratio", 0)),
                "sharpex_returns": safe_float(row.get("sharpex_returns", 0)),
                "alphax_returns": safe_float(row.get("alphax_returns", 0)),
                "betax_returns": safe_float(row.get("betax_returns", 0)),
                "aumtotal": safe_float(row.get("aumtotal", 0)),
                "rupeevest_rating": safe_float(row.get("rupeevest_rating", 0)),  # Handles "Unrated"
                "consistency_of_return": safe_float(row.get("consistency_of_return", 0)),
                "risk": safe_float(row.get("risk", 0))
            })

    # Filter funds based on classification input
    filtered_funds = [fund for fund in mutual_funds if fund["classification"] == market_cap.lower()]
    
    if not filtered_funds:
        print("No mutual funds found for the given classification.")
        return []

    # Sort funds based on multiple performance factors
    sorted_funds = sorted(
        filtered_funds,
        key=lambda x: (
            x["returns_10year"],
            x["returns_5year"],
            x["returns_3year"],
            x["returns_1year"],
            x["returns_3month"],
            x["rupeevest_rating"],  
            x["consistency_of_return"],
            -x["risk"],  
            -x["expenceratio"],  
            -x["turnover_ratio"],  
            x["sharpex_returns"],  
            x["alphax_returns"],   
            -abs(x["betax_returns"]),  
            x["aumtotal"]  
        ),
        reverse=True
    )

    # Get top 10 funds
    top_funds = sorted_funds[:10]

    # Save top 10 mutual funds to a CSV file
    with open(output_csv, 'w', newline='', encoding='utf-8') as file:
        fieldnames = top_funds[0].keys()  # Get column names
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(top_funds)

    print(f"Top 10 mutual funds saved to {output_csv}")
    return top_funds