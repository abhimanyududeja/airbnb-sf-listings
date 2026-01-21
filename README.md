# Stay SF

A clean, editorial-style web app displaying San Francisco Airbnb listings.

**Live Site:** https://abhimanyududeja.github.io/airbnb-sf-listings/

## About

Built for CS5610 Web Development at Northeastern University. The app fetches the first 50 listings from a JSON file using JavaScript's fetch API and displays them in a magazine-inspired layout.

## Features

- Loads 50 listings using AJAX (fetch + async/await)
- Shows listing name, description, price, thumbnail, host info, and amenities
- Search by neighborhood, amenities, or keywords
- Filter by Superhosts, budget ($150 or less), or luxury ($300+)
- Save favorites (stored in localStorage)
- Click any listing for full details
- Responsive design for mobile and desktop

## Tech Stack

- HTML5
- CSS3 (Grid, Flexbox, custom properties)
- Vanilla JavaScript (ES6+)
- Google Fonts (Instrument Serif, Outfit)

## Run Locally

1. Clone this repo
2. Start a local server:
   ```
   python -m http.server 8000
   ```
3. Open http://localhost:8000

## Author

**Abhimanyu Dudeja**  
MS Computer Science, Northeastern University

---

Data from San Francisco Airbnb listings dataset.
