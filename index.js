// Enhanced initialization with error handling
function initializeApplication() {
    // Verify all required elements exist
    const elements = {
        monthSelect: document.getElementById('monthSelect'),
        budgetInput: document.getElementById('budgetInput'),
        saveBudgetBtn: document.getElementById('saveBudgetBtn'),
        remainingAmount: document.getElementById('remainingAmount'),
        addExpenseBtn: document.getElementById('addExpenseBtn'),
        categoriesList: document.getElementById('categoriesList')
    };

    // Check for missing elements and create fallbacks
    for (const [name, element] of Object.entries(elements)) {
        if (!element) {
            console.error(`Critical Error: ${name} element not found`);
            // Create safe fallback
            elements[name] = document.createElement('div');
            elements[name].style.display = 'none';
            document.body.appendChild(elements[name]);
        }
    }

    // Initialize data storage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

    // Rest of your existing JavaScript code
    // [Previous content of index.js would go here]
    // ...

    // Initialize the application
    document.addEventListener('DOMContentLoaded', () => {
        if (!currentUser && window.location.pathname.includes('index.html')) {
            window.location.href = 'login.html';
            return;
        }

        // Set current month
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        elements.monthSelect.value = `${year}-${month}`;

        // Load initial data
        loadMonthData();
    });

    // All your existing functions (loadMonthData, renderExpenses, etc.)
    // ...
}

// Start the application
initializeApplication();