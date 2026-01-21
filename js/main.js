/**
 * Stay SF - San Francisco Airbnb Listings
 * CS5610 Web Development - Abhimanyu Tripathi
 */

// Data
let listings = [];
let filtered = [];
let saved = JSON.parse(localStorage.getItem('savedStays')) || [];

// DOM Elements
const searchInput = document.getElementById('searchInput');
const listingsGrid = document.getElementById('listingsGrid');
const loader = document.getElementById('loader');
const emptyState = document.getElementById('emptyState');
const resultsInfo = document.getElementById('resultsInfo');
const savedBtn = document.getElementById('savedBtn');
const savedCount = document.getElementById('savedCount');
const savedModal = document.getElementById('savedModal');
const savedList = document.getElementById('savedList');
const closeModal = document.getElementById('closeModal');
const detailModal = document.getElementById('detailModal');
const detailBody = document.getElementById('detailBody');
const closeDetail = document.getElementById('closeDetail');
const filterChips = document.querySelectorAll('.filter-chip');

// Stats elements
const listingCountEl = document.getElementById('listingCount');
const avgPriceEl = document.getElementById('avgPrice');
const superhostNumEl = document.getElementById('superhostNum');
const hoodCountEl = document.getElementById('hoodCount');

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  setDate();
  updateSavedCount();
  await loadListings();
  setupEvents();
}

// Set current date in header
function setDate() {
  const dateEl = document.querySelector('.date-display');
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  dateEl.textContent = new Date().toLocaleDateString('en-US', options);
}

// Fetch listings using AJAX (fetch + await)
async function loadListings() {
  try {
    const response = await fetch('airbnb_sf_listings_500.json');
    
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    
    const data = await response.json();
    
    // Get first 50 listings as required
    listings = data.slice(0, 50);
    filtered = [...listings];
    
    // Update stats
    updateStats();
    
    // Hide loader and show listings
    loader.style.display = 'none';
    renderListings();
    
  } catch (error) {
    console.error('Error:', error);
    loader.innerHTML = '<p>Could not load listings. Please refresh.</p>';
  }
}

// Calculate and display stats
function updateStats() {
  listingCountEl.textContent = listings.length;
  
  // Average price
  const prices = listings.map(l => getPrice(l.price)).filter(p => p > 0);
  const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b) / prices.length) : 0;
  avgPriceEl.textContent = '$' + avg;
  
  // Superhosts
  const superhosts = listings.filter(l => l.host_is_superhost === 't').length;
  superhostNumEl.textContent = superhosts;
  
  // Neighborhoods
  const hoods = new Set(listings.map(l => l.neighbourhood_cleansed).filter(Boolean));
  hoodCountEl.textContent = hoods.size;
}

// Render listing cards
function renderListings() {
  if (filtered.length === 0) {
    listingsGrid.innerHTML = '';
    emptyState.style.display = 'block';
    resultsInfo.textContent = 'No matches found';
    return;
  }
  
  emptyState.style.display = 'none';
  resultsInfo.textContent = `Showing ${filtered.length} of ${listings.length} stays`;
  
  listingsGrid.innerHTML = filtered.map(listing => createCard(listing)).join('');
  
  // Add click events
  document.querySelectorAll('.listing-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('save-btn')) {
        openDetail(parseInt(card.dataset.id));
      }
    });
  });
  
  document.querySelectorAll('.save-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSave(parseInt(btn.dataset.id));
    });
  });
}

// Create a listing card
function createCard(listing) {
  const price = getPrice(listing.price);
  const isSaved = saved.includes(listing.id);
  const isSuperhost = listing.host_is_superhost === 't';
  const name = cleanName(listing.name);
  const desc = cleanDesc(listing.description);
  const hood = listing.neighbourhood_cleansed || 'San Francisco';
  
  return `
    <article class="listing-card" data-id="${listing.id}">
      <div class="card-img">
        <img 
          src="${listing.picture_url || 'https://placehold.co/400x300?text=No+Image'}" 
          alt="${name}"
          loading="lazy"
          onerror="this.src='https://placehold.co/400x300?text=No+Image'"
        >
        <button class="save-btn ${isSaved ? 'saved' : ''}" data-id="${listing.id}">
          ${isSaved ? '♥' : '♡'}
        </button>
        ${isSuperhost ? '<span class="superhost-tag">Superhost</span>' : ''}
      </div>
      <div class="card-body">
        <p class="card-hood">${hood}</p>
        <h3 class="card-title">${name}</h3>
        <p class="card-desc">${desc}</p>
        <div class="card-footer">
          <div class="host-info">
            <img 
              class="host-img" 
              src="${listing.host_thumbnail_url || 'https://placehold.co/36?text=H'}" 
              alt="${listing.host_name}"
              onerror="this.src='https://placehold.co/36?text=H'"
            >
            <div>
              <p class="host-name">${listing.host_name || 'Host'}</p>
              <p class="host-label">${isSuperhost ? 'Superhost' : 'Host'}</p>
            </div>
          </div>
          <div class="card-price">
            <p class="price-amount">$${price}</p>
            <p class="price-label">per night</p>
          </div>
        </div>
      </div>
    </article>
  `;
}

// Setup event listeners
function setupEvents() {
  // Search
  searchInput.addEventListener('input', debounce(applyFilters, 300));
  
  // Filter chips
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyFilters();
    });
  });
  
  // Saved modal
  savedBtn.addEventListener('click', openSavedModal);
  closeModal.addEventListener('click', () => savedModal.classList.remove('open'));
  
  // Detail modal
  closeDetail.addEventListener('click', () => detailModal.classList.remove('open'));
  
  // Close modals on background click
  savedModal.addEventListener('click', (e) => {
    if (e.target === savedModal) savedModal.classList.remove('open');
  });
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) detailModal.classList.remove('open');
  });
  
  // Escape key closes modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      savedModal.classList.remove('open');
      detailModal.classList.remove('open');
    }
  });
}

// Apply search and filters
function applyFilters() {
  const query = searchInput.value.toLowerCase().trim();
  const activeFilter = document.querySelector('.filter-chip.active').dataset.filter;
  
  filtered = listings.filter(listing => {
    // Text search
    if (query) {
      const searchable = [
        listing.name,
        listing.description,
        listing.neighbourhood_cleansed,
        listing.host_name,
        listing.amenities
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchable.includes(query)) return false;
    }
    
    // Category filters
    const price = getPrice(listing.price);
    
    switch (activeFilter) {
      case 'superhost':
        if (listing.host_is_superhost !== 't') return false;
        break;
      case 'budget':
        if (price > 150) return false;
        break;
      case 'luxury':
        if (price < 300) return false;
        break;
    }
    
    return true;
  });
  
  renderListings();
}

// Reset all filters
function resetFilters() {
  searchInput.value = '';
  filterChips.forEach(c => c.classList.remove('active'));
  document.querySelector('[data-filter="all"]').classList.add('active');
  filtered = [...listings];
  renderListings();
}

// Toggle save/unsave listing
function toggleSave(id) {
  const idx = saved.indexOf(id);
  
  if (idx > -1) {
    saved.splice(idx, 1);
  } else {
    saved.push(id);
  }
  
  localStorage.setItem('savedStays', JSON.stringify(saved));
  updateSavedCount();
  renderListings();
}

function updateSavedCount() {
  savedCount.textContent = saved.length;
}

// Open saved modal
function openSavedModal() {
  const savedListings = listings.filter(l => saved.includes(l.id));
  
  if (savedListings.length === 0) {
    savedList.innerHTML = '<p class="empty-saved">You haven\'t saved any stays yet.</p>';
  } else {
    savedList.innerHTML = savedListings.map(listing => {
      const name = cleanName(listing.name);
      const price = getPrice(listing.price);
      
      return `
        <div class="saved-item" data-id="${listing.id}">
          <img src="${listing.picture_url}" alt="${name}">
          <div class="saved-item-info">
            <h4>${name}</h4>
            <p>$${price}/night</p>
          </div>
        </div>
      `;
    }).join('');
    
    // Click to view detail
    document.querySelectorAll('.saved-item').forEach(item => {
      item.addEventListener('click', () => {
        savedModal.classList.remove('open');
        openDetail(parseInt(item.dataset.id));
      });
    });
  }
  
  savedModal.classList.add('open');
}

// Open detail modal
function openDetail(id) {
  const listing = listings.find(l => l.id === id);
  if (!listing) return;
  
  const name = cleanName(listing.name);
  const desc = cleanDesc(listing.description);
  const price = getPrice(listing.price);
  const hood = listing.neighbourhood_cleansed || 'San Francisco';
  const isSuperhost = listing.host_is_superhost === 't';
  const amenities = parseAmenities(listing.amenities);
  
  detailBody.innerHTML = `
    <img class="detail-img" src="${listing.picture_url}" alt="${name}">
    <div class="detail-content">
      <p class="detail-hood">${hood}</p>
      <h2 class="detail-title">${name}</h2>
      <p class="detail-price">$${price} <span>per night</span></p>
      
      <div class="detail-host">
        <img src="${listing.host_picture_url || listing.host_thumbnail_url}" alt="${listing.host_name}">
        <div class="detail-host-info">
          <h4>Hosted by ${listing.host_name}</h4>
          <p>${isSuperhost ? '★ Superhost · ' : ''}${listing.host_response_time || 'Quick responses'}</p>
        </div>
      </div>
      
      <div class="detail-section">
        <h4>About this place</h4>
        <p>${desc || 'No description available.'}</p>
      </div>
      
      <div class="detail-section">
        <h4>Details</h4>
        <p>
          ${listing.bedrooms || 1} bedroom · 
          ${listing.beds || 1} bed · 
          ${listing.bathrooms_text || '1 bath'} · 
          Up to ${listing.accommodates || 2} guests
        </p>
      </div>
      
      <div class="detail-section">
        <h4>Amenities</h4>
        <div class="amenities-list">
          ${amenities.slice(0, 12).map(a => `<span class="amenity-item">${a}</span>`).join('')}
          ${amenities.length > 12 ? `<span class="amenity-item">+${amenities.length - 12} more</span>` : ''}
        </div>
      </div>
      
      <a href="${listing.listing_url}" target="_blank" class="detail-link">View on Airbnb →</a>
    </div>
  `;
  
  detailModal.classList.add('open');
}

// Utility functions
function getPrice(str) {
  if (!str) return 0;
  const match = str.match(/[\d,]+/);
  return match ? parseInt(match[0].replace(',', '')) : 0;
}

function cleanName(name) {
  if (!name) return 'Untitled Stay';
  const parts = name.split(' · ');
  return parts[0].trim();
}

function cleanDesc(desc) {
  if (!desc) return '';
  return desc.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
}

function parseAmenities(str) {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Make resetFilters available globally for empty state button
window.resetFilters = resetFilters;
