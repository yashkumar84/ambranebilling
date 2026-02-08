#!/bin/bash

# Production Tenant Setup Script
# This script creates a tenant with email hello@ambrane.com and adds menu items

echo "🚀 Starting Production Tenant Setup..."

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
EMAIL="hello@ambrane.com"
PASSWORD="1@AmbraneLabs"
BUSINESS_NAME="Ambrane Labs Restaurant"

echo "📧 Email: $EMAIL"
echo "🏢 Business: $BUSINESS_NAME"
echo "🌐 Backend URL: $BACKEND_URL"
echo ""

# Step 1: Register the user
echo "📝 Step 1: Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"name\": \"Admin\",
    \"phone\": \"+919876543210\",
    \"otpCode\": \"123456\"
  }")

echo "Response: $REGISTER_RESPONSE"

# Step 2: Login to get auth token
echo ""
echo "🔐 Step 2: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

# Extract token from response (handle nested data object)
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | head -1 | sed 's/"accessToken":"//')

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to login. Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful!"

# Step 2.5: Create Tenant
echo ""
echo "🏢 Step 2.5: Creating tenant..."
TENANT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/tenants" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"businessName\": \"$BUSINESS_NAME\",
    \"businessType\": \"Restaurant\",
    \"email\": \"$EMAIL\",
    \"phone\": \"+919876543210\",
    \"address\": \"123 Main Street, Mumbai, India\",
    \"subdomain\": \"ambranelabs\"
  }")

echo "Response: $TENANT_RESPONSE"

# Extract NEW token from tenant response (as tenant creation refreshes token with tenantId)
NEW_TOKEN=$(echo $TENANT_RESPONSE | grep -o '"accessToken":"[^"]*' | head -1 | sed 's/"accessToken":"//')

if [ ! -z "$NEW_TOKEN" ]; then
    TOKEN=$NEW_TOKEN
    echo "✅ Tenant created and token updated!"
else
    echo "⚠️ Warning: Could not extract new token after tenant creation. Using old token."
fi

# Step 3: Add menu items
echo ""
echo "🍽️  Step 3: Adding menu items..."

# Array of menu items
declare -a MENU_ITEMS=(
    '{"name":"Paneer Tikka","category":"Main Course","sellingPrice":230,"description":"Delicious Paneer Tikka from our Main Course selection.","isAvailable":true}'
    '{"name":"Chicken Biryani","category":"Main Course","sellingPrice":280,"description":"Delicious Chicken Biryani from our Main Course selection.","isAvailable":true}'
    '{"name":"Dal Makhani","category":"Main Course","sellingPrice":180,"description":"Delicious Dal Makhani from our Main Course selection.","isAvailable":true}'
    '{"name":"Butter Chicken","category":"Main Course","sellingPrice":260,"description":"Delicious Butter Chicken from our Main Course selection.","isAvailable":true}'
    '{"name":"Mixed Veg Curry","category":"Main Course","sellingPrice":260,"description":"Delicious Mixed Veg Curry from our Main Course selection.","isAvailable":true}'
    '{"name":"Spring Rolls","category":"Starters","sellingPrice":180,"description":"Delicious Spring Rolls from our Starters selection.","isAvailable":true}'
    '{"name":"Dal Makhani","category":"Starters","sellingPrice":180,"description":"Delicious Dal Makhani from our Starters selection.","isAvailable":true}'
    '{"name":"Gulab Jamun (2pcs)","category":"Desserts","sellingPrice":90,"description":"Delicious Gulab Jamun (2pcs) from our Desserts selection.","isAvailable":true}'
    '{"name":"Vanilla Ice Cream","category":"Desserts","sellingPrice":120,"description":"Delicious Vanilla Ice Cream from our Desserts selection.","isAvailable":true}'
    '{"name":"French Fries","category":"Snacks","sellingPrice":110,"description":"Delicious French Fries from our Snacks selection.","isAvailable":true}'
    '{"name":"Veg Grilled Sandwich","category":"Snacks","sellingPrice":140,"description":"Delicious Veg Grilled Sandwich from our Snacks selection.","isAvailable":true}'
    '{"name":"Paneer Tikka","category":"Snacks","sellingPrice":230,"description":"Delicious Paneer Tikka from our Snacks selection.","isAvailable":true}'
    '{"name":"Ambrane Special Platter","category":"Snacks","sellingPrice":499,"description":"Delicious Ambrane Special Platter from our Snacks selection.","isAvailable":true}'
    '{"name":"Cold Coffee","category":"Beverages","sellingPrice":120,"description":"Delicious Cold Coffee from our Beverages selection.","isAvailable":true}'
    '{"name":"Masala Chai","category":"Beverages","sellingPrice":40,"description":"Delicious Masala Chai from our Beverages selection.","isAvailable":true}'
    '{"name":"Fresh Lime Soda","category":"Beverages","sellingPrice":60,"description":"Delicious Fresh Lime Soda from our Beverages selection.","isAvailable":true}'
)

ADDED_COUNT=0
FAILED_COUNT=0

for item in "${MENU_ITEMS[@]}"; do
    ITEM_NAME=$(echo $item | grep -o '"name":"[^"]*' | sed 's/"name":"//')
    
    RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/menu" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "$item")
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo "  ✅ Added: $ITEM_NAME"
        ((ADDED_COUNT++))
    else
        echo "  ❌ Failed: $ITEM_NAME"
        ((FAILED_COUNT++))
    fi
done

echo ""
echo "📊 Summary:"
echo "  ✅ Successfully added: $ADDED_COUNT items"
echo "  ❌ Failed: $FAILED_COUNT items"
echo ""
echo "🎉 Production tenant setup complete!"
echo ""
echo "📋 Login Credentials:"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo "  Backend URL: $BACKEND_URL"
