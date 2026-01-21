# 🌉 SF Stays - San Francisco Airbnb Listings

A modern, responsive web application that displays San Francisco Airbnb listings using JavaScript DOM manipulation and AJAX (fetch API).

## 🔗 Live Demo

**[View Live Demo on GitHub Pages](https://YOUR-USERNAME.github.io/airbnb-sf-listings/)**

> Replace `YOUR-USERNAME` with your actual GitHub username after deployment.

## 📖 Project Overview

This project was created for **CS5610 - Web Development** at Northeastern University. It demonstrates proficiency in:

- JavaScript DOM manipulation
- Asynchronous data fetching with `fetch()` and `async/await`
- Modern CSS techniques including CSS Variables, Grid, and Flexbox
- Responsive web design
- Interactive UI components

## ✨ Features

### Core Requirements
- ✅ Fetches and displays **first 50 listings** from JSON data using AJAX
- ✅ Shows listing **name, description, and amenities**
- ✅ Displays **host information** (name and photo)
- ✅ Shows listing **price** and **thumbnail**

### Creative Additions
- 🔍 **Real-time search** - Filter listings by name, description, amenities, or neighborhood
- 💰 **Price filter** - Interactive slider to filter by maximum price per night
- ⭐ **Superhost filter** - Toggle to show only Superhost listings
- ❤️ **Favorites system** - Save favorite listings (persists in localStorage)
- 🌙 **Dark mode** - Toggle between light and dark themes
- 📊 **Live statistics** - Displays average price, superhost count, and neighborhood count
- 🖼️ **Detail modal** - Click any listing to see full details and amenities
- ⚡ **Loading skeleton** - Smooth loading animation while data fetches
- 📱 **Fully responsive** - Works on desktop, tablet, and mobile devices

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox, animations
- **JavaScript (ES6+)** - Async/await, fetch API, DOM manipulation
- **Google Fonts** - DM Serif Display & Plus Jakarta Sans

## 📁 Project Structure

```
airbnb-sf-listings/
├── index.html                    # Main HTML file
├── css/
│   └── main.css                  # All styles
├── js/
│   └── main.js                   # JavaScript functionality
├── airbnb_sf_listings_500.json   # Listing data
└── README.md                     # This file
```

## 🚀 Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/airbnb-sf-listings.git
   ```

2. Navigate to the project directory:
   ```bash
   cd airbnb-sf-listings
   ```

3. Start a local server (required for fetch to work):
   
   Using Python 3:
   ```bash
   python -m http.server 8000
   ```
   
   Using Node.js (with http-server):
   ```bash
   npx http-server
   ```
   
   Using VS Code Live Server extension (recommended)

4. Open `http://localhost:8000` in your browser

### Deploy to GitHub Pages

1. Create a new repository on GitHub
2. Push your code to the repository
3. Go to Settings → Pages
4. Select "Deploy from a branch" and choose `main` branch
5. Your site will be live at `https://YOUR-USERNAME.github.io/airbnb-sf-listings/`

## 📸 Screenshots

### Light Mode
The default light theme features warm, Golden Gate-inspired colors with terracotta accents.

### Dark Mode
A comfortable dark theme for nighttime browsing with reduced eye strain.

### Responsive Design
The layout adapts seamlessly from desktop to mobile devices.

## 💡 Key Implementation Details

### Fetching Data with AJAX
```javascript
async function fetchListings() {
  const response = await fetch('airbnb_sf_listings_500.json');
  const data = await response.json();
  allListings = data.slice(0, 50);  // First 50 listings
  renderListings();
}
```

### Dynamic Filtering
The application supports real-time filtering without page reloads:
- Text search across multiple fields
- Price range filtering
- Superhost toggle

### Favorites Persistence
User favorites are saved to localStorage and persist across browser sessions:
```javascript
localStorage.setItem('sfStaysFavorites', JSON.stringify(favorites));
```

## 👤 Author

**Abhimanyu Tripathi**
- MS in Computer Science, Northeastern University
- Course: CS5610 - Web Development

## 📝 Assignment Requirements

| Requirement | Status |
|-------------|--------|
| Display first 50 listings | ✅ |
| Load using AJAX (fetch + await) | ✅ |
| Show listing name | ✅ |
| Show description | ✅ |
| Show amenities | ✅ |
| Show host name and photo | ✅ |
| Show price | ✅ |
| Show thumbnail | ✅ |
| Creative additions | ✅ |
| Meaningful README | ✅ |
| GitHub Pages deployment | ✅ |

## 📄 License

This project is created for educational purposes as part of the CS5610 course at Northeastern University.

---

*Data sourced from San Francisco Airbnb listings dataset*
