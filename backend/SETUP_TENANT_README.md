# Production Tenant Setup Script

This script automatically sets up a production tenant with pre-configured menu items for the Ambrane Billing system.

## What it does

1. **Registers a new tenant** with email `hello@ambrane.com`
2. **Logs in** and obtains an authentication token
3. **Adds 16 menu items** across different categories:
   - Main Course (5 items)
   - Starters (2 items)
   - Desserts (2 items)
   - Snacks (4 items)
   - Beverages (3 items)

## Usage

### Local Development

```bash
cd backend
./setup_production_tenant.sh
```

### Production Deployment

Set the `BACKEND_URL` environment variable to your production backend URL:

```bash
cd backend
BACKEND_URL=https://api.yourdomain.com ./setup_production_tenant.sh
```

Or export it first:

```bash
export BACKEND_URL=https://api.yourdomain.com
cd backend
./setup_production_tenant.sh
```

## Login Credentials

After running the script, you can login with:

- **Email**: `hello@ambrane.com`
- **Password**: `1@AmbraneLabs`

## Menu Items Added

The script adds the following items:

### Main Course
- Paneer Tikka - ₹230
- Chicken Biryani - ₹280
- Dal Makhani - ₹180
- Butter Chicken - ₹260
- Mixed Veg Curry - ₹260

### Starters
- Spring Rolls - ₹180
- Dal Makhani - ₹180

### Desserts
- Gulab Jamun (2pcs) - ₹90
- Vanilla Ice Cream - ₹120

### Snacks
- French Fries - ₹110
- Veg Grilled Sandwich - ₹140
- Paneer Tikka - ₹230
- Ambrane Special Platter - ₹499

### Beverages
- Cold Coffee - ₹120
- Masala Chai - ₹40
- Fresh Lime Soda - ₹60

## Customization

You can modify the script to:
- Change the email/password (edit `EMAIL` and `PASSWORD` variables)
- Change the business name (edit `BUSINESS_NAME` variable)
- Add/remove menu items (modify the `MENU_ITEMS` array)
- Change pricing or descriptions

## Troubleshooting

If the script fails:

1. **Check backend is running**: Ensure your backend server is accessible at the configured URL
2. **Check response messages**: The script prints all API responses for debugging
3. **Verify database**: Make sure PostgreSQL is running and the database exists
4. **Check logs**: Look at backend logs for any errors

## Notes

- The script uses `curl` for API calls
- All menu items are marked as available by default
- The tenant is created with a default phone number and address (you can change these in the tenant settings after login)
