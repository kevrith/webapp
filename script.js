/**
 * Kastra Mini Multistore WebApp - Fixed Version
 * Complete JavaScript Application
 * Author: Kelvin Murithi JOhnson
 * Version: 2.1.0
 */

// Application State
let products = [];
let expenses = [];
let orders = [];
let tray = [];
let expenseChart = null;
let profitChart = null;

// Configuration
const API_BASE = 'https://webapp-backend.onrender.com"';
const CURRENCY_API = 'https://api.exchangerate-api.com/v4/latest/';
const LOW_STOCK_THRESHOLD = 5;
const STOCK_COST_PERCENTAGE = 0.7; // 70% of sales for auto stock cost

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log(' Modern Mini Multistore App Starting...');
    
    initializeApp();
    setupEventListeners();
    loadInitialData();
    
    console.log(' App Initialized Successfully');
});

// Initialize the application
 
function initializeApp() {
    // Set today's date in expense form
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('expense-date');
    if (dateInput) {
        dateInput.value = today;
    }
    
    // Initialize mobile responsiveness
    handleResize();
    
    console.log('📱 Mobile responsiveness initialized');
}

// Set up event listeners
 
function setupEventListeners() {
    // Expense form submission
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);
    }
    
    // Currency change listener
    const currencySelect = document.getElementById('expense-currency');
    if (currencySelect) {
        currencySelect.addEventListener('change', handleCurrencyChange);
    }
    
    // Window resize handler
    window.addEventListener('resize', handleResize);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Global error handlers
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    console.log(' Event listeners configured');
}

// Load initial data
 
async function loadInitialData() {
    try {
        await Promise.all([
            loadProducts(),
            loadExpenses(),
            loadOrders()
        ]);
        console.log(' All data loaded successfully');
    } catch (error) {
        console.error(' Error loading initial data:', error);
        showNotification('Error loading data. Please check your connection.', 'warning');
    }
}

// ================================
// API FUNCTIONS
// ================================

// Generic API request handler
 
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const config = {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        if (data && method !== 'GET') {
            config.body = JSON.stringify(data);
        }
        
        console.log(` API ${method} request to: ${API_BASE}${endpoint}`);
        
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = method === 'DELETE' ? null : await response.json();
        console.log(` API ${method} success`);
        
        return result;
        
    } catch (error) {
        console.error(' API Error:', error);
        showNotification(`API Error: ${error.message}`, 'error');
        return null;
    }
}

// Currency conversion API

async function convertCurrency(from, to, amount) {
    if (from === to) return amount;
    
    try {
        const response = await fetch(`${CURRENCY_API}${from}`);
        if (!response.ok) throw new Error('Currency API error');
        
        const data = await response.json();
        const rate = data.rates[to];
        
        if (!rate) throw new Error(`Rate not found for ${to}`);
        
        return amount * rate;
        
    } catch (error) {
        console.error(' Currency conversion error:', error);
        showNotification('Currency conversion failed, using original amount', 'warning');
        return amount;
    }
}

// ================================
// DATA LOADING FUNCTIONS
// ================================

// Load products from API

async function loadProducts() {
    showLoading('products-grid');
    console.log(' Loading products...');
    
    const apiProducts = await apiRequest('/products');
    
    if (apiProducts && Array.isArray(apiProducts)) {
        products = apiProducts;
        renderProducts();
        console.log(` Loaded ${products.length} products`);
    } else {
        const grid = document.getElementById('products-grid');
        if (grid) {
            grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 50px 0; color: var(--danger-color);">Failed to load products. Please check API connection.</p>';
        }
        console.error(' Failed to load products from API');
    }
}

// Load expenses from API
 
async function loadExpenses() {
    console.log(' Loading expenses...');
    
    const apiExpenses = await apiRequest('/expenses');
    
    if (apiExpenses && Array.isArray(apiExpenses)) {
        expenses = apiExpenses;
    } else {
        expenses = [];
        console.log(' No expenses found, starting fresh');
    }
    
    renderExpenses();
    updateExpenseChart();
    console.log(` Loaded ${expenses.length} expenses`);
}

// Load orders from API
 
async function loadOrders() {
    console.log(' Loading orders...');
    
    const apiOrders = await apiRequest('/orders');
    
    if (apiOrders && Array.isArray(apiOrders)) {
        orders = apiOrders;
    } else {
        orders = [];
        console.log(' No orders found, starting fresh');
    }
    
    updateReports();
    console.log(` Loaded ${orders.length} orders`);
}

// ================================
// RENDER FUNCTIONS
// ================================

// Render products grid
 
function renderProducts() {
    const grid = document.getElementById('products-grid');
    
    if (!grid) {
        console.error(' Products grid element not found');
        return;
    }
    
    grid.innerHTML = '';
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; padding: 50px 0; color: var(--gray-color);">No products available</p>';
        return;
    }
    
    products.forEach(product => {
        const stockLevel = getStockLevel(product);
        const card = createProductCard(product, stockLevel);
        grid.appendChild(card);
    });
    
    console.log(` Rendered ${products.length} product cards`);
}

// Create a product card element
 
function createProductCard(product, stockLevel) {
    const card = document.createElement('div');
    card.className = `product-card ${stockLevel.class}`;
    
    card.innerHTML = `
        <img src="${product.image}" 
             alt="${product.name}" 
             class="product-image" 
             onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'"
             loading="lazy">
        <div class="product-name">${escapeHtml(product.name)}</div>
        <div class="product-price">${formatCurrency(product.price)}</div>
        <div class="stock-info">
            <span>Available: ${product.available}/${product.capacity}</span>
            <span class="stock-level ${stockLevel.class}">${stockLevel.text}</span>
        </div>
        <button class="buy-btn ${product.available > 0 ? 'available' : 'sold-out'}" 
                ${product.available > 0 ? `onclick="addToTray('${product.id}')"` : 'disabled'}>
            <i class="fas ${product.available > 0 ? 'fa-cart-plus' : 'fa-ban'}"></i>
            ${product.available > 0 ? 'Add to Cart' : 'Sold Out'}
        </button>
    `;
    
    return card;
}

//Render expenses list
function renderExpenses() {
    const list = document.getElementById('expense-list');
    
    if (!list) {
        console.error(' Expense list element not found');
        return;
    }
    
    list.innerHTML = '<h3 style="margin-bottom: 20px;">Recent Expenses</h3>';
    
    if (expenses.length === 0) {
        list.innerHTML += '<p style="text-align: center; color: var(--gray-color);">No expenses recorded yet.</p>';
        return;
    }
    
    // Show last 10 expenses, most recent first
    const recentExpenses = expenses.slice(-10).reverse();
    
    recentExpenses.forEach(expense => {
        const item = document.createElement('div');
        item.className = 'expense-item';
        item.innerHTML = `
            <div>
                <strong>${escapeHtml(expense.name)}</strong>
                <br>
                <small style="color: var(--gray-color);">
                    ${formatDate(expense.date)} • ${escapeHtml(expense.category)}
                    ${expense.type === 'auto' ? ' (Auto-generated)' : ''}
                    ${expense.originalCurrency && expense.originalCurrency !== 'KES' ? ` (${expense.originalAmount} ${expense.originalCurrency})` : ''}
                </small>
            </div>
            <div style="font-weight: bold; color: var(--danger-color);">
                ${formatCurrency(expense.amount)}
            </div>
        `;
        list.appendChild(item);
    });
    
    console.log(` Rendered ${recentExpenses.length} recent expenses`);
}

// Render shopping tray - FIXED VERSION
 
function renderTray() {
    const content = document.getElementById('tray-content');
    const totalEl = document.getElementById('tray-total');
    
    if (!content || !totalEl) {
        console.error(' Tray elements not found');
        return;
    }
    
    // Clear existing content
    content.innerHTML = '';
    
    if (tray.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: var(--gray-color); padding: 50px 0;">Your tray is empty</p>';
        totalEl.textContent = '0';
        return;
    }
    
    let total = 0;
    
    tray.forEach((item, index) => {
        total += item.price;
        const trayItem = document.createElement('div');
        trayItem.className = 'tray-item';
        trayItem.innerHTML = `
            <div>
                <strong>${escapeHtml(item.name)}</strong>
                <br>
                <small style="color: var(--gray-color);">${formatCurrency(item.price)}</small>
            </div>
            <button class="remove-item-btn" onclick="removeFromTray(${index})" title="Remove item">
                <i class="fas fa-trash"></i>
            </button>
        `;
        content.appendChild(trayItem);
    });
    
    totalEl.textContent = formatNumber(total);
    console.log(` Rendered ${tray.length} items in tray, Total: ${formatCurrency(total)}`);
}

// ================================
// UTILITY FUNCTIONS
// ================================

// Get stock level information for a product
 
function getStockLevel(product) {
    if (product.available === 0) {
        return { class: 'out', text: 'Out of Stock' };
    }
    if (product.available <= LOW_STOCK_THRESHOLD) {
        return { class: 'low', text: 'Low Stock' };
    }
    return { class: 'high', text: 'In Stock' };
}

// Format currency for display
 
function formatCurrency(amount) {
    return `${formatNumber(amount)} KES`;
}

// Format number with thousand separators
 
function formatNumber(number) {
    return number.toLocaleString();
}

// Format date for display
 
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    } catch (error) {
        console.warn('Invalid date format:', dateString);
        return dateString;
    }
}

// Escape HTML to prevent XSS
 
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, (m) => map[m]);
}

// Show loading spinner
 
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div style="text-align: center; padding: 50px;"><div class="loading"></div><p style="margin-top: 10px; color: var(--gray-color);">Loading...</p></div>';
    }
}

// Show notification to user
 
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-exclamation';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        ${escapeHtml(message)}
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
    
    console.log(` Notification (${type}): ${message}`);
}

// ================================
// NAVIGATION FUNCTIONS - FIXED
// ================================

// Show specific section and update navigation

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log(` Navigated to section: ${sectionId}`);
    }
    
    // Update active nav button - find the button that calls this section
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`'${sectionId}'`)) {
            btn.classList.add('active');
        }
    });
    
    // If navigating to reports, update the charts
    if (sectionId === 'reports') {
        setTimeout(() => {
            updateReports();
        }, 100);
    }
    
    // If navigating to expenses, update the chart
    if (sectionId === 'expenses') {
        setTimeout(() => {
            updateExpenseChart();
        }, 100);
    }
}

// ================================
// TRAY FUNCTIONS - FIXED
// ================================

// Add product to tray - FIXED
 
function addToTray(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Product not found!', 'error');
        console.warn(' Product not found:', productId);
        return;
    }
    
    if (product.available <= 0) {
        showNotification('Product not available!', 'error');
        console.warn(' Product not available:', product.name);
        return;
    }
    
    // Check if we already have this item in tray
    const existingItemIndex = tray.findIndex(item => item.id === productId);
    if (existingItemIndex !== -1) {
        showNotification(`${product.name} is already in your tray!`, 'warning');
        openTray();
        return;
    }
    
    // Add to tray
    const trayItem = {
        id: product.id,
        name: product.name,
        price: product.price
    };
    
    tray.push(trayItem);
    
    console.log(` Added to tray: ${product.name}`, trayItem);
    console.log('Current tray:', tray);
    
    renderTray();
    openTray();
    showNotification(`${product.name} added to tray!`, 'success');
}

// Remove item from tray - FIXED
 
function removeFromTray(index) {
    console.log(` Attempting to remove item at index: ${index}`);
    console.log('Current tray before removal:', tray);
    
    if (index < 0 || index >= tray.length) {
        console.warn(' Invalid tray index:', index);
        return;
    }
    
    const item = tray[index];
    tray.splice(index, 1);
    
    console.log('Current tray after removal:', tray);
    
    renderTray();
    showNotification(`${item.name} removed from tray!`, 'warning');
    
    console.log(` Removed from tray: ${item.name}`);
}

// Open tray overlay - FIXED
 
function openTray() {
    const trayOverlay = document.getElementById('tray-overlay');
    if (trayOverlay) {
        trayOverlay.classList.add('show');
        console.log(' Tray opened');
        
        // Force re-render of tray content
        setTimeout(() => {
            renderTray();
        }, 100);
    } else {
        console.error(' Tray overlay element not found');
    }
}

// Close tray overlay
 
function closeTray() {
    const trayOverlay = document.getElementById('tray-overlay');
    if (trayOverlay) {
        trayOverlay.classList.remove('show');
        console.log(' Tray closed');
    }
}

// Finalize purchase - FIXED

async function finalizePurchase() {
    if (tray.length === 0) {
        showNotification('Your tray is empty!', 'warning');
        return;
    }
    
    console.log(' Processing purchase...');
    console.log('Items in tray:', tray);
    
    try {
        // Validate stock availability for all items
        for (const item of tray) {
            const product = products.find(p => p.id === item.id);
            if (!product || product.available <= 0) {
                showNotification(`${item.name} is no longer available!`, 'error');
                return;
            }
        }
        
        const orderTotal = tray.reduce((sum, item) => sum + item.price, 0);
        const orderDate = new Date().toISOString().split('T')[0];
        
        // Create order record
        const newOrder = {
            id: `order_${Date.now()}`,
            date: orderDate,
            items: [...tray],
            totalAmount: orderTotal,
            status: 'completed'
        };
        
        console.log('Creating order:', newOrder);
        
        // Update inventory for each item
        const updatePromises = [];
        for (const item of tray) {
            const product = products.find(p => p.id === item.id);
            if (product) {
                product.available -= 1;
                product.sold += 1;
                
                // Update via API
                const updatePromise = apiRequest(`/products/${product.id}`, 'PUT', product);
                updatePromises.push(updatePromise);
            }
        }
        
        // Wait for all inventory updates
        await Promise.all(updatePromises);
        
        // Save order to API
        const savedOrder = await apiRequest('/orders', 'POST', newOrder);
        if (savedOrder) {
            orders.push(savedOrder);
        }
        
        // Auto-generate stock expense
        const stockCost = Math.round(orderTotal * STOCK_COST_PERCENTAGE);
        const stockExpense = {
            id: `expense_${Date.now()}`,
            name: 'Auto Stock Cost',
            amount: stockCost,
            date: orderDate,
            category: 'Stock',
            type: 'auto'
        };
        
        const savedExpense = await apiRequest('/expenses', 'POST', stockExpense);
        if (savedExpense) {
            expenses.push(savedExpense);
        }
        
        // Show success message
        showNotification(
            `Purchase completed! Total: ${formatCurrency(orderTotal)}. Stock updated.`,
            'success'
        );
        
        // Clear tray and update displays
        tray = [];
        renderTray();
        renderProducts();
        renderExpenses();
        updateExpenseChart();
        updateReports();
        closeTray();
        
        console.log(` Purchase completed: ${formatCurrency(orderTotal)}`);
        
    } catch (error) {
        console.error(' Purchase error:', error);
        showNotification('Purchase failed. Please try again.', 'error');
    }
}

// ================================
// EXPENSE FUNCTIONS - FIXED WITH CURRENCY CONVERSION
// ================================

// Handle currency change
 
async function handleCurrencyChange() {
    const currency = document.getElementById('expense-currency').value;
    const conversionInfo = document.getElementById('conversion-info');
    
    if (currency !== 'KES') {
        conversionInfo.style.display = 'block';
        conversionInfo.innerHTML = '<small>Amount will be converted to KES when saved.</small>';
    } else {
        conversionInfo.style.display = 'none';
    }
}

// Handle expense form submission - FIXED WITH CURRENCY CONVERSION
 
async function handleExpenseSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    try {
        // Disable submit button
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="loading"></div> Adding...';
        
        const name = document.getElementById('expense-name').value.trim();
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const date = document.getElementById('expense-date').value;
        const category = document.getElementById('expense-category').value;
        const currency = document.getElementById('expense-currency').value;
        
        // Validate expense data
        if (!name || !amount || !date || !category) {
            showNotification('Please fill in all expense fields!', 'error');
            return;
        }
        
        if (amount <= 0) {
            showNotification('Expense amount must be greater than zero!', 'error');
            return;
        }
        
        console.log(' Adding expense:', name, amount, currency);
        
        // Convert currency if needed
        let convertedAmount = amount;
        const conversionInfo = document.getElementById('conversion-info');
        
        if (currency !== 'KES') {
            conversionInfo.style.display = 'block';
            conversionInfo.innerHTML = '<small><i class="fas fa-spinner fa-spin"></i> Converting currency...</small>';
            
            convertedAmount = await convertCurrency(currency, 'KES', amount);
            console.log(` Converted ${amount} ${currency} to ${convertedAmount} KES`);
        }
        
        const expense = {
            id: `expense_${Date.now()}`,
            name: name,
            amount: convertedAmount,
            originalAmount: currency !== 'KES' ? amount : null,
            originalCurrency: currency !== 'KES' ? currency : null,
            date: date,
            category: category,
            type: 'manual'
        };
        
        // Save to API
        const savedExpense = await apiRequest('/expenses', 'POST', expense);
        if (savedExpense) {
            expenses.push(savedExpense);
            
            // Update displays
            renderExpenses();
            updateExpenseChart();
            updateReports();
            
            // Reset form
            e.target.reset();
            document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];
            document.getElementById('expense-currency').value = 'KES';
            conversionInfo.style.display = 'none';
            
            const message = currency !== 'KES' 
                ? `Expense added! ${amount} ${currency} converted to ${formatCurrency(convertedAmount)}`
                : 'Expense added successfully!';
            
            showNotification(message, 'success');
            console.log(`Expense added: ${expense.name} - ${formatCurrency(expense.amount)}`);
        } else {
            throw new Error('Failed to save expense');
        }
        
    } catch (error) {
        console.error(' Expense error:', error);
        showNotification('Failed to add expense. Please try again.', 'error');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ================================
// CHART FUNCTIONS - FIXED
// ================================

//Update expense chart - FIXED
 
function updateExpenseChart() {
    const canvas = document.getElementById('expense-chart');
    if (!canvas) {
        console.warn('Expense chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (expenseChart) {
        expenseChart.destroy();
        expenseChart = null;
    }
    
    if (expenses.length === 0) {
        // Show empty state
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#6b7280';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No expenses to display', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Calculate category totals
    const categories = [...new Set(expenses.map(e => e.category))];
    const categoryTotals = categories.map(cat => 
        expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
    );
    
    // Chart colors
    const colors = [
        '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
        '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    
    try {
        expenseChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: categoryTotals,
                    backgroundColor: colors.slice(0, categories.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = formatCurrency(context.raw);
                                return `${label}: ${value}`;
                            }
                        }
                    }
                }
            }
        });
        
        console.log(' Expense chart updated');
        
    } catch (error) {
        console.error(' Error creating expense chart:', error);
        showNotification('Error updating expense chart', 'warning');
    }
}

// Update profit chart - FIXED

function updateProfitChart() {
    const canvas = document.getElementById('profit-chart');
    if (!canvas) {
        console.warn(' Profit chart canvas not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (profitChart) {
        profitChart.destroy();
        profitChart = null;
    }
    
    // Calculate totals
    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = revenue - totalExpenses;
    
    try {
        profitChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Revenue', 'Expenses', 'Net Profit/Loss'],
                datasets: [{
                    label: 'Amount (KES)',
                    data: [revenue, totalExpenses, netProfit],
                    backgroundColor: [
                        '#10b981',
                        '#ef4444',
                        netProfit >= 0 ? '#10b981' : '#ef4444'
                    ],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                }
            }
        });
        
        console.log(' Profit chart updated');
        
    } catch (error) {
        console.error('Error creating profit chart:', error);
        showNotification('Error updating profit chart', 'warning');
    }
}

// ================================
// REPORT FUNCTIONS - FIXED
// ================================

//Update business reports - FIXED
 
function updateReports() {
    try {
        const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        const netProfit = revenue - totalExpenses;
        
        // Get today's orders
        const today = new Date().toISOString().split('T')[0];
        const ordersToday = orders.filter(order => order.date === today).length;
        
        // Update report cards
        const revenueEl = document.getElementById('total-revenue');
        const expensesEl = document.getElementById('total-expenses');
        const netProfitEl = document.getElementById('net-profit');
        const ordersTodayEl = document.getElementById('orders-today');
        
        if (revenueEl) revenueEl.textContent = formatNumber(revenue);
        if (expensesEl) expensesEl.textContent = formatNumber(totalExpenses);
        if (netProfitEl) {
            netProfitEl.textContent = formatNumber(netProfit);
            netProfitEl.className = `report-value ${netProfit >= 0 ? 'positive' : 'negative'}`;
        }
        if (ordersTodayEl) ordersTodayEl.textContent = ordersToday;
        
        // Update profit chart
        updateProfitChart();
        
        console.log(`Reports updated - Revenue: ${formatCurrency(revenue)}, Net: ${formatCurrency(netProfit)}`);
        
    } catch (error) {
        console.error('Error updating reports:', error);
        showNotification('Error updating reports', 'warning');
    }
}

// ================================
// EVENT HANDLERS
// ================================

// Handle keyboard shortcuts
 
function handleKeyboardShortcuts(e) {
    // Close tray with Escape
    if (e.key === 'Escape') {
        closeTray();
        return;
    }
    
    // Navigation shortcuts with Ctrl/Cmd
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                showSection('store');
                break;
            case '2':
                e.preventDefault();
                showSection('expenses');
                break;
            case '3':
                e.preventDefault();
                showSection('reports');
                break;
        }
    }
}

//Handle window resize

function handleResize() {
    const trayOverlay = document.getElementById('tray-overlay');
    if (trayOverlay) {
        if (window.innerWidth <= 768) {
            trayOverlay.style.width = '100vw';
        } else {
            trayOverlay.style.width = '400px';
        }
    }
}

// Handle global JavaScript errors
function handleGlobalError(e) {
    console.error(' Global error:', e.error);
    showNotification('An unexpected error occurred. Please refresh the page.', 'error');
}

//Handle unhandled promise rejections
function handleUnhandledRejection(e) {
    console.error(' Unhandled promise rejection:', e.reason);
    showNotification('Network error occurred. Please check your connection.', 'warning');
}

//Performance monitoring
window.addEventListener('load', () => {
    if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`App loaded in ${loadTime}ms`);
        
        if (loadTime > 3000) {
            console.warn('Slow loading detected. Consider optimizing images and scripts.');
        }
    }
});

// ================================
// GLOBAL FUNCTION DECLARATIONS
// ================================

// Make functions globally available for onclick handlers
window.showSection = showSection;
window.addToTray = addToTray;
window.removeFromTray = removeFromTray;
window.openTray = openTray;
window.closeTray = closeTray;
window.finalizePurchase = finalizePurchase;

// ================================
// FINAL INITIALIZATION LOG
// ================================

// console.log(' Modern Mini Multistore App Ready!');
// console.log(' Keyboard shortcuts: Ctrl+1 (Store), Ctrl+2 (Expenses), Ctrl+3 (Reports)');
// console.log(' Auto-refresh enabled every 30 seconds');
// console.log(' Error handling and fallbacks active');
// console.log(' Currency conversion support enabled');

// Auto-refresh data every 30 seconds
// setInterval(async () => {
//     if (navigator.onLine && document.visibilityState === 'visible') {
//         console.log(' Auto-refreshing data...');
//         try {
//             await Promise.all([
//                 loadProducts(),
//                 loadExpenses(),
//                 loadOrders()
//             ]);
//         } catch (error) {
//             console.warn('Auto-refresh failed:', error);
//         }
//     }
// }, 30000);

//Register service worker for PWA capabilities
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         // Service worker registration can be added here
//         console.log('PWA support ready for implementation');
//     });
// }