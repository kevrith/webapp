# Date, 2025/09/25
# By: Kelvin Murithi Johnson

## Kastra Mini Multistore WebApp

A comprehensive inventory management system with real-time stock tracking, expense management, and business reporting. Built with modern web technologies and designed for small business owners who need a powerful yet simple solution.

## Features

# Product Management
**Modern Product Catalog -** Grid-based cards with high-quality images
**Real-time Stock Levels -** Live inventory tracking with visual indicators
**Smart Stock Alerts -** Low stock warnings (below 5 units) and out-of-stock handling
**Dynamic Buy Buttons -** Automatic disable when products are unavailable
**Stock Validation -** Prevents purchasing more than available quantity

# Shopping Experience
**Smart Tray System -** Semi-transparent overlay that appears when items are added
**Real-time Updates -** Instant total calculations and item management
**Purchase Confirmations -** Clear feedback with remaining stock display
**Mobile Optimized -** Touch-friendly interface for all devices

# Business Management
**Expense Tracking -** Categorized expense management with persistence
**Automatic Cost Calculation -** Auto-generates stock costs (70% of sales)
**Profit & Loss Reports -** Real-time business performance tracking
**Interactive Charts -** Visual analytics for expenses and profits
**Order History -** Complete transaction records

# Technical Features
**RESTful API Integration -** Full CRUD operations with json-server
**HTTP Verbs Support -** GET, POST, PUT methods for data management
**Data Persistence -** All data saved to backend with local fallback
**Responsive Design -** Works perfectly on desktop, tablet, and mobile
**Modern UI/UX -** Glassmorphism effects and smooth animations

# Bonus Feactures
**Interactive Movie Selection:** Click any movie in the sidebar to view its details
**Fresh Data Fetching:** Makes GET requests to ensure up-to-date movie information
**Responsive Design:** Works seamlessly on desktop and mobile devices
**Modern UI:** Dark theme with smooth animations and hover effects

## Technologies

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: JSON Server (local API/ hosted on render)
- **HTTP Methods**: GET, PUT, POST

## Setup

### Prerequisites
- Node.js (v14 or higher) and npm installed
- npm or yarn package manager
- Modern Web Browser
- JSON Server: `npm install -g json-server` 
             : Or `sudo npm install -g json-server`

### Installation
1. Clone or download the project files
`git clone git@github.com:kevrith/webapp.git`
or fork and clone with your github account
2. Create `products.json` with the provided character data
3. Install JSON Server: `npm instal -g json-server`
4. Start JSON Server: `json-server --watch products.json`
5. Open `index.html` in your browser
Or Use a local server like Live Server in VS Code
6. Verify server at: `http://localhost:3000/products`

## Project Structure

```
Kastra MIni-MUltistore/
── index.html # Main HTML structure 
── styles.css # CSS styling and resposive design 
── script.js # JavaScript Functionality
── products.json # JSON Server database
── package.json #Sharing Node.js and deploying online server
── README.md # Documentation
```

## API Endpoints
The app connects to json-server at `http://localhost:3000` and at the same time `https://multi-store-json.onrender.com`. It does this by connecting automaticaly to where the server is located by the following code: 
const `API_BASE = location.hostname === "localhost" ? "http://localhost:3000" :"https://multi-store-json.onrender.com";`  

- `GET /products` - Retrieve all products
- `PUT /products/:id` - Update product (Inventory changes)
- `GET /orders` - Fetch all orders
- `POST /orders` - Create new order
- `GET /expenses` - Fetch all expenses
- `POST /expenses` - Create new expenses

## Usage

# Adding Products 
1. Update the products.db file with new products.
2. Restart json-server to reload the data.
3. The app will automatically display new products.

# Managing INventory
**View Stock Levels:** Each product card shows available/total capacity.
**Stock Alerts:** Products with <=5 items shows "Low Stock" waring.
**Out Of Stock:** STock levels update immediately after purchases.

# Making Sales
1. Browse products in the Store section
2. Click "Add to Tray" on available products
3. Review items in the smart tray overlay
4. Click "Complete Purchase" to finalize
5. View confirmation with updated stcok levels

# Tracking Expenses
1. Navigate to the Expenses section
2. Fill out the expense form with detail
3. Select appropriate category
4. Click "Add Expense" to save
5. View expenses in the list and chart.
6. Anything that is purchased will automatically be added to Expenses

# Viewing Reports 
1. Go to the Report section
2. View key metrics: Revenue, Expenses, Net Profit
3. Analyze data using interactive charts
4. MOnitor daily order counts

# Keyboard Shortcuts
**Ctrl + 1** Navigate to Store
**Ctrl + 2** Navigate to Expenses
**Ctrl + 3** Navigate to Reports

# Modifying Stock Thresholds
Change the low stock warining threashold. ignore the ` mark
`function getStockLevel(product) {`
  `if (product.available === 0) return { class: 'out', text: 'Out of Stock' };`
  `if (product.available <= 5) return { class: 'low', text: 'Low Stock' }; // Change 5 to your preferred threshold`
  `return { class: 'high', text: 'In Stock' };}`

## Technical Implementation

The application uses a class-based architecture with:
**Architecture:** Single Page Application (SPA) using vanilla JavaScript with RESTful API communication via JSON Server backend.
**Frontend:** JavaScript with async/await for HTTP requests, DOM manipulation for real-time UI updates, and responsive CSS Grid/Flexbox layout.
**Backend:** JSON Server providing RESTful endpoints (GET, POST, PATCH, DELETE) with JSON file-based data persistence.
**State Management:** Client-side state management using JavaScript variables with optimistic UI updates and comprehensive error handling.
**Performance:** Cached DOM elements, efficient event delegation, and minimal API calls with proper error boundaries for robust user experience.

## Browser Compatibility

Supports all modern browsers with ES6+ capabilities.

## Future Enhancements
Potential feactures for future development 
**User authentication and profiles** - Login system for multu-user access
**Barcode Scanning** - Quick product lookup and inventory updates
**Print Receipts** - Generate printable sales receipts
**Data Export and Import** Excel/CSV export for reports
**Supplier Management** - Track supplier and purchase orders
**Multistore Support** - Manage multiple locations
**Advanced Analytics** - Sales trends and forcasting
**PWA Capabilities** - Offline functionality and app installation

## Acknowledgments

- Built as part of a web development project
- JSON Server for providing easy API simulation
- Modern web standards and best practices implementation

## License

The content of this site is licensed under the MIT license Copyright (c) 2025 Kelvin Murithi.
