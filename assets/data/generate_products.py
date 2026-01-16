
import os
import json
import random

# Configuration
IMAGE_DIR = "../images/Product"
OUTPUT_FILE = "products.json"
CATEGORIES = ["مطبخ", "إلكترونيات", "إكسسوارات", "صحة", "عطور", "حقائب", "عناية", "تجميل"]

def generate_products():
    products = []
    
    # Check if directory exists
    if not os.path.exists(IMAGE_DIR):
        print(f"Error: Directory {IMAGE_DIR} not found.")
        return

    # Get all image files
    files = [f for f in os.listdir(IMAGE_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    files.sort() # Ensure consistent order

    print(f"Found {len(files)} images.")

    for i, filename in enumerate(files):
        product_id = 1000 + i
        category = random.choice(CATEGORIES)
        
        products.append({
            "id": product_id,
            "name": f"Product {product_id}",
            "category": category,
            "image": f"assets/images/Product/{filename}",
            "short_description": "منتج حصري ذو جودة عالية. مناسب لجميع الأذواق الاستثنائية."
        })

    # Write to JSON
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully wrote {len(products)} products to {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_products()
