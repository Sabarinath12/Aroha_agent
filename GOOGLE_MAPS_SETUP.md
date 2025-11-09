# Google Maps API Setup Guide

## Required APIs

For the voice-controlled map application to work fully, your Google Maps API key must have **three** APIs enabled:

### 1. Maps JavaScript API ✅
Already enabled (this is what shows the map)

### 2. Geocoding API ⚠️ **REQUIRED**
This converts location names (like "New York City") into coordinates for searching.

### 3. Directions API ⚠️ **REQUIRED**
This provides routing information between two locations for showing routes on the map.

## How to Enable Required APIs

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### Step 2: Select Your Project
1. Click **"Select a project"** at the top of the page
2. Choose the project that contains your API key
3. Click **"Open"**

### Step 3: Navigate to API Library
1. From the left menu, go to **APIs & Services** → **Library**
   - Alternatively, click **"+ ENABLE APIS AND SERVICES"** at the top of the Dashboard

### Step 4: Enable Geocoding API
1. Search for **"Geocoding API"** in the search bar
2. Click on **"Geocoding API"** from the results
3. Click the **"ENABLE"** button
4. Wait for confirmation

### Step 5: Enable Directions API
1. Search for **"Directions API"** in the search bar
2. Click on **"Directions API"** from the results
3. Click the **"ENABLE"** button
4. Wait for confirmation

### Step 6: Verify Your API Key (Important!)
1. Go to **APIs & Services** → **Credentials**
2. Find your API key (the one stored in `VITE_GOOGLE_MAPS_API_KEY`)
3. Click **"EDIT"** (pencil icon)
4. Under **API restrictions**, make sure it includes:
   - Maps JavaScript API ✅
   - Geocoding API ✅
   - Directions API ✅
5. Save changes
6. Wait 2-3 minutes for the changes to propagate

## Verify Your Setup

After enabling both APIs:
1. Wait 2-3 minutes for the changes to propagate
2. Refresh your application
3. **Test Location Search**: Try asking the AI to find a location: "Show me Paris"
   - The map should successfully search and display the location
4. **Test Directions**: Try asking for directions: "Show me directions from New York to Boston"
   - The map should display a cyan route line between the two cities
   - The AI will tell you the distance and travel time

## Alternative: Using Places API

If you prefer not to enable the Geocoding API, you can use the Places API instead (which may already be enabled):
- The Places API can also convert place names to coordinates
- It's included in many Google Maps setups by default
- However, it requires different code implementation

## Current API Key Location

Your Google Maps API key is stored in the environment variable:
- `VITE_GOOGLE_MAPS_API_KEY`

Make sure this key has the necessary APIs enabled in the Google Cloud Console.

## Testing

Once both APIs are enabled, test with these commands:

**Location Search:**
- "Find the Eiffel Tower"
- "Show me New York City"
- "Where is the Golden Gate Bridge?"

**Directions:**
- "Show me directions from Paris to London"
- "How do I get from the Eiffel Tower to the Louvre?"
- "Route from New York to Boston"

The AI should successfully locate places, draw routes on the map, and provide distance and travel time information.

## Troubleshooting

### Still Getting "REQUEST_DENIED" Error?
1. **Wait 2-3 minutes** after enabling the API - changes take time to propagate
2. **Check API Restrictions** on your API key:
   - Go to **APIs & Services** → **Credentials**
   - Edit your API key
   - Make sure "Geocoding API" is checked under API restrictions
3. **Refresh the application** - Clear browser cache if needed

### Rate Limit Errors (OVER_QUERY_LIMIT)
- **Free tier**: $200 monthly credit (~40,000 geocoding requests)
- **Quota resets**: Daily at midnight Pacific time
- **Solution**: Wait until quota resets or enable billing for higher limits

### "Location Not Found" Errors (ZERO_RESULTS)
- Try more specific search terms
- Include city or country names: "Paris, France" instead of just "Paris"
- Use full addresses when possible

### Alternative: Places API
If you prefer not to use the Geocoding API, you can enable the **Places API** instead:
1. Follow the same steps but enable "Places API"
2. Note: Places API may have different pricing
3. Code changes would be required to use Places API for geocoding
