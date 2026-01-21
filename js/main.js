/**
 * SF Stays - San Francisco Airbnb Listings
 * JavaScript for fetching and displaying listings
 * CS5610 Web Development - Abhimanyu Tripathi
 */

// ============================================
// Global State
// ============================================
let allListings = [];
let filteredListings = [];
let favorites = JSON.parse(localStorage.getItem('sfStaysFavorites')) || [];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const priceFilter = document.getElementById('priceFilter');
const priceValue = document.getElementById('priceValue');
const superhostFilter = document.getElementById('superhostFilter');
const resetFilters = document.getElementById('resetFilters');
const listingsContainer = document.getElementById('listingsContainer');
const loadingSkeleton = document.getElementById('loadingSkeleton');
const noResults = document.getElementById('noResults');
const resultsCount = document.getElementById('resultsCount');
const favoritesBtn = document.getElementById('favoritesBtn');
const favoritesCount = document.getElementById('favoritesCount');
const favoritesModal = document.getElementById('favoritesModal');
const favoritesList = document.getElementById('favoritesList');
const closeFavorites = document.getElementById('closeFavorites');
const detailModal = document.getElementById('detailModal');
const detailContent = document.getElementById('detailContent');
const closeDetail = document.getElementById('closeDetail');
const themeToggle = document.getElementById('themeToggle');

// Stats Elements
const totalListingsEl = document.getElementById('totalListings');
const avgPriceEl = document.getElementById('avgPrice');
const superhostCountEl = document.getElementById('superhostCount');
const neighborhoodCountEl = document.getElementById('neighborhoodCount');

// ============================================
// Initialize Application
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderSkeletons();
  fetchListings();
  setupEventListeners();
  updateFavoritesCount();
});

// ============================================
// Theme Management
// ============================================
function initTheme() {
  const savedTheme = localStorage.getItem('sfStaysTheme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('sfStaysTheme', newTheme);
}

// ============================================
// Data Fetching with AJAX (fetch + await)
// ============================================
async function fetchListings() {
  try {
    // Use fetch API with await to get the JSON data
    const response = await fetch('airbnb_sf_listings_500.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Get only the first 50 listings as per assignment requirement
    allListings = data.slice(0, 50);
    filteredListings = [...allListings];
    
    // Calculate and display stats
    calculateStats();
    
    // Hide skeleton and show listings
    setTimeout(() => {
      loadingSkeleton.style.display = 'none';
      listingsContainer.style.display = 'grid';
      renderListings();
    }, 800); // Small delay for smooth transition
    
  } catch (error) {
    console.error('Error fetching listings:', error);
    loadingSkeleton.innerHTML = `
      <div class="no-results">
        <span class="no-results-icon">⚠️</span>
        <h3>Error Loading Data</h3>
        <p>Could not fetch listings. Please refresh the page.</p>
      </div>
    `;
  }
}

// ============================================
// Statistics Calculation
// ============================================
function calculateStats() {
  // Total listings
  totalListingsEl.textContent = allListings.length;
  
  // Average price
  const prices = allListings.map(l => parsePrice(l.price)).filter(p => p > 0);
  const avgPrice = prices.length > 0 
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) 
    : 0;
  avgPriceEl.textContent = `$${avgPrice}`;
  
  // Superhost count
  const superhosts = allListings.filter(l => l.host_is_superhost === 't').length;
  superhostCountEl.textContent = superhosts;
  
  // Unique neighborhoods
  const neighborhoods = new Set(allListings.map(l => l.neighbourhood_cleansed).filter(Boolean));
  neighborhoodCountEl.textContent = neighborhoods.size;
}

// ============================================
// Rendering Functions
// ============================================
function renderSkeletons() {
  const skeletons = Array(6).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-body">
        <div class="skeleton-line"></div>
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `).join('');
  
  loadingSkeleton.innerHTML = skeletons;
}

function renderListings() {
  if (filteredListings.length === 0) {
    listingsContainer.style.display = 'none';
    noResults.style.display = 'block';
    resultsCount.textContent = 'No listings found';
    return;
  }
  
  noResults.style.display = 'none';
  listingsContainer.style.display = 'grid';
  resultsCount.textContent = `Showing ${filteredListings.length} listing${filteredListings.length !== 1 ? 's' : ''}`;
  
  const html = filteredListings.map((listing, index) => createListingCard(listing, index)).join('');
  listingsContainer.innerHTML = html;
  
  // Add event listeners to cards
  setupCardListeners();
}

function createListingCard(listing, index) {
  const price = parsePrice(listing.price);
  const isFavorite = favorites.includes(listing.id);
  const isSuperhost = listing.host_is_superhost === 't';
  const amenities = parseAmenities(listing.amenities);
  const displayAmenities = amenities.slice(0, 3);
  const moreCount = amenities.length - 3;
  
  // Clean up description - remove HTML tags
  const cleanDescription = listing.description 
    ? listing.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : 'No description available';
  
  // Extract listing name (clean up the format)
  const name = cleanListingName(listing.name);
  
  return `
    <article class="listing-card" data-id="${listing.id}" style="animation-delay: ${index * 0.05}s">
      <div class="card-image">
        <img 
          src="${listing.picture_url || 'https://via.placeholder.com/400x300?text=No+Image'}" 
          alt="${name}"
          loading="lazy"
          onerror="this.src='https://via.placeholder.com/400x300?text=Image+Not+Available'"
        >
        <button 
          class="favorite-btn ${isFavorite ? 'active' : ''}" 
          data-id="${listing.id}"
          aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
        >
          ${isFavorite ? '♥' : '♡'}
        </button>
        ${isSuperhost ? '<span class="superhost-badge">Superhost</span>' : ''}
        <span class="price-tag">$${price} <span>/night</span></span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(name)}</h3>
        <p class="card-location">📍 ${escapeHtml(listing.neighbourhood_cleansed || listing.neighbourhood || 'San Francisco')}</p>
        <p class="card-description">${escapeHtml(truncateText(cleanDescription, 100))}</p>
        
        <div class="host-info">
          <img 
            class="host-avatar" 
            src="${listing.host_thumbnail_url || 'https://via.placeholder.com/40?text=Host'}" 
            alt="${listing.host_name}"
            onerror="this.src='https://via.placeholder.com/40?text=Host'"
          >
          <div class="host-details">
            <span class="host-name">${escapeHtml(listing.host_name || 'Host')}</span>
            <span class="host-status">${isSuperhost ? '⭐ Superhost' : 'Host'}</span>
          </div>
        </div>
        
        <div class="amenities-preview">
          ${displayAmenities.map(a => `<span class="amenity-tag">${escapeHtml(a)}</span>`).join('')}
          ${moreCount > 0 ? `<span class="amenity-more">+${moreCount} more</span>` : ''}
        </div>
      </div>
    </article>
  `;
}

function renderFavorites() {
  const favoriteListings = allListings.filter(l => favorites.includes(l.id));
  
  if (favoriteListings.length === 0) {
    favoritesList.innerHTML = '<p class="empty-favorites">No favorites yet. Click the heart on any listing to save it!</p>';
    return;
  }
  
  const html = favoriteListings.map(listing => {
    const price = parsePrice(listing.price);
    const name = cleanListingName(listing.name);
    
    return `
      <div class="favorite-item" data-id="${listing.id}">
        <img src="${listing.picture_url}" alt="${name}">
        <div class="favorite-item-info">
          <p class="favorite-item-name">${escapeHtml(truncateText(name, 40))}</p>
          <p class="favorite-item-price">$${price}/night</p>
        </div>
      </div>
    `;
  }).join('');
  
  favoritesList.innerHTML = html;
}

function renderDetailModal(listing) {
  const price = parsePrice(listing.price);
  const isSuperhost = listing.host_is_superhost === 't';
  const amenities = parseAmenities(listing.amenities);
  const name = cleanListingName(listing.name);
  const cleanDescription = listing.description 
    ? listing.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : 'No description available';
  
  detailContent.innerHTML = `
    <div class="detail-header">
      <img 
        class="detail-image" 
        src="${listing.picture_url || 'https://via.placeholder.com/800x450?text=No+Image'}" 
        alt="${name}"
      >
    </div>
    <div class="detail-body">
      <h2 class="detail-title">${escapeHtml(name)}</h2>
      <p class="detail-location">📍 ${escapeHtml(listing.neighbourhood_cleansed || listing.neighbourhood || 'San Francisco')}</p>
      <p class="detail-price">$${price} <span>/night</span></p>
      
      <div class="detail-section">
        <h3>About this place</h3>
        <p>${escapeHtml(cleanDescription)}</p>
      </div>
      
      <div class="detail-section">
        <h3>Your Host</h3>
        <div class="detail-host">
          <img 
            src="${listing.host_picture_url || listing.host_thumbnail_url || 'https://via.placeholder.com/64?text=Host'}" 
            alt="${listing.host_name}"
          >
          <div class="detail-host-info">
            <h4>${escapeHtml(listing.host_name || 'Host')}</h4>
            <p>${isSuperhost ? '⭐ Superhost • ' : ''}${listing.host_response_time || 'Responds quickly'}</p>
          </div>
        </div>
      </div>
      
      <div class="detail-section">
        <h3>Amenities</h3>
        <div class="detail-amenities">
          ${amenities.map(a => `<span class="detail-amenity">${escapeHtml(a)}</span>`).join('')}
        </div>
      </div>
      
      <div class="detail-section">
        <h3>Property Details</h3>
        <p>
          🛏️ ${listing.bedrooms || 1} bedroom${listing.bedrooms !== 1 ? 's' : ''} • 
          🛋️ ${listing.beds || 1} bed${listing.beds !== 1 ? 's' : ''} • 
          🚿 ${listing.bathrooms_text || '1 bath'}<br>
          👥 Accommodates ${listing.accommodates || 2} guest${listing.accommodates !== 1 ? 's' : ''}<br>
          📅 Minimum stay: ${listing.minimum_nights || 1} night${listing.minimum_nights !== 1 ? 's' : ''}
        </p>
      </div>
      
      <a href="${listing.listing_url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 1rem; padding: 1rem 2rem; background: var(--primary); color: white; border-radius: var(--radius-md); text-decoration: none; font-weight: 600; transition: background 0.2s;">
        View on Airbnb →
      </a>
    </div>
  `;
}

// ============================================
// Event Handlers
// ============================================
function setupEventListeners() {
  // Search input
  searchInput.addEventListener('input', debounce(filterListings, 300));
  
  // Price filter
  priceFilter.addEventListener('input', () => {
    const value = priceFilter.value;
    priceValue.textContent = value >= 1000 ? '$1000+' : `$${value}`;
    filterListings();
  });
  
  // Superhost filter
  superhostFilter.addEventListener('change', filterListings);
  
  // Reset filters
  resetFilters.addEventListener('click', () => {
    searchInput.value = '';
    priceFilter.value = 1000;
    priceValue.textContent = '$1000+';
    superhostFilter.checked = false;
    filterListings();
  });
  
  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);
  
  // Favorites modal
  favoritesBtn.addEventListener('click', () => {
    renderFavorites();
    favoritesModal.classList.add('active');
  });
  
  closeFavorites.addEventListener('click', () => {
    favoritesModal.classList.remove('active');
  });
  
  // Detail modal
  closeDetail.addEventListener('click', () => {
    detailModal.classList.remove('active');
  });
  
  // Close modals on outside click
  [favoritesModal, detailModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
  
  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      favoritesModal.classList.remove('active');
      detailModal.classList.remove('active');
    }
  });
}

function setupCardListeners() {
  // Favorite buttons
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id);
      toggleFavorite(id, btn);
    });
  });
  
  // Card clicks for detail modal
  document.querySelectorAll('.listing-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      const listing = allListings.find(l => l.id === id);
      if (listing) {
        renderDetailModal(listing);
        detailModal.classList.add('active');
      }
    });
  });
}

// ============================================
// Filtering Logic
// ============================================
function filterListings() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  const maxPrice = parseInt(priceFilter.value);
  const superhostOnly = superhostFilter.checked;
  
  filteredListings = allListings.filter(listing => {
    // Price filter
    const price = parsePrice(listing.price);
    if (maxPrice < 1000 && price > maxPrice) return false;
    
    // Superhost filter
    if (superhostOnly && listing.host_is_superhost !== 't') return false;
    
    // Search filter
    if (searchTerm) {
      const searchFields = [
        listing.name,
        listing.description,
        listing.neighbourhood_cleansed,
        listing.neighbourhood,
        listing.host_name,
        listing.amenities,
        listing.property_type,
        listing.room_type
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchFields.includes(searchTerm)) return false;
    }
    
    return true;
  });
  
  renderListings();
}

// ============================================
// Favorites Management
// ============================================
function toggleFavorite(id, btn) {
  const index = favorites.indexOf(id);
  
  if (index > -1) {
    favorites.splice(index, 1);
    btn.classList.remove('active');
    btn.innerHTML = '♡';
  } else {
    favorites.push(id);
    btn.classList.add('active');
    btn.innerHTML = '♥';
    
    // Add a little animation
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
    }, 200);
  }
  
  localStorage.setItem('sfStaysFavorites', JSON.stringify(favorites));
  updateFavoritesCount();
}

function updateFavoritesCount() {
  favoritesCount.textContent = favorites.length;
}

// ============================================
// Utility Functions
// ============================================
function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const match = priceStr.match(/[\d,]+\.?\d*/);
  return match ? parseFloat(match[0].replace(',', '')) : 0;
}

function parseAmenities(amenitiesStr) {
  if (!amenitiesStr) return [];
  try {
    // The amenities field is a JSON string array
    const parsed = JSON.parse(amenitiesStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function cleanListingName(name) {
  if (!name) return 'Unnamed Listing';
  // Remove the format "Type in Location · Rating · Details"
  // Keep just the meaningful part
  const parts = name.split(' · ');
  if (parts.length > 1) {
    // Return first part which usually contains the property type
    return parts[0].trim();
  }
  return name.trim();
}

function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength).trim() + '...';
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
