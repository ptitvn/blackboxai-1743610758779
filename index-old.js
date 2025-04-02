// Data storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

// DOM Elements
const logoutBtn = document.querySelector('.logout-button');
const monthSelect = document.getElementById('monthSelect');
const budgetInput = document.getElementById('budgetInput');
const saveBudgetBtn = document.getElementById('saveBudgetBtn');
const remainingAmount = document.getElementById('remainingAmount');
const categoryName = document.getElementById('categoryName');
const categoryLimit = document.getElementById('categoryLimit');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoriesList = document.getElementById('categoriesList');
const expenseAmount = document.getElementById('expenseAmount');
const expenseNote = document.getElementById('expenseNote');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const expensesHistory = document.getElementById('expensesHistory');
const budgetWarning = document.getElementById('budgetWarning');
const monthlyStats = document.getElementById('monthlyStats');

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xác thực
    if (!currentUser && window.location.pathname.includes('index.html')) {
        window.location.href = 'login.html';
    }

    // Set current month as default with proper formatting
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    monthSelect.value = `${year}-${month}`;
    
    // Ensure consistent month format
    monthSelect.addEventListener('change', function() {
        const [year, month] = this.value.split('-');
        this.value = `${year}-${month.padStart(2, '0')}`;
        loadMonthData();
    });

    // Tải dữ liệu cho tháng hiện tại
    loadMonthData();
});

// Chức năng đăng xuất
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        // Tạo phương thức xác nhận tùy chỉnh
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = '1000';
        
        modal.innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 8px; width: 300px;">
                <h3>Xác nhận đăng xuất</h3>
                <p>Bạn có chắc chắn muốn đăng xuất?</p>
                <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                    <button id="confirmLogout" style="padding: 8px 16px; background: #4F46E5; color: white; border: none; border-radius: 4px;">Đăng xuất</button>
                    <button id="cancelLogout" style="padding: 8px 16px; background: #f0f0f0; border: none; border-radius: 4px;">Hủy</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('confirmLogout').addEventListener('click', () => {
            currentUser = null;
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
        
        document.getElementById('cancelLogout').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    });
}

// Thay đổi lựa chọn tháng
if (monthSelect) {
    monthSelect.addEventListener('change', loadMonthData);
}

// Tiết kiệm ngân sách
if (saveBudgetBtn) {
    saveBudgetBtn.addEventListener('click', () => {
        const month = monthSelect.value.substring(0, 7);
        const budget = parseFloat(budgetInput.value);

        if (!budget || isNaN(budget)) {
            alert('Vui lòng nhập số tiền ngân sách');
            return;
        }

        // Khởi tạo dữ liệu người dùng nếu không tồn tại
        if (!budgets[currentUser.email]) {
            budgets[currentUser.email] = {};
        }

        // Khởi tạo dữ liệu tháng nếu không tồn tại
        if (!budgets[currentUser.email][month]) {
            budgets[currentUser.email][month] = {
                budget: 0,
                categories: [],
                expenses: [],
                spent: 0
            };
        }

        // Cập nhật ngân sách
        budgets[currentUser.email][month].budget = budget;
        localStorage.setItem('budgets', JSON.stringify(budgets));

        // Cập nhật màn hình
        loadMonthData();
        budgetInput.value = '';
    });
}

// Category Management Functions
function renderCategories(monthData) {
    categoriesList.innerHTML = monthData.categories.map((category, index) => `
        <div class="category-item" data-index="${index}">
            <div>
                <strong>${category.name}</strong>
                <div>Giới hạn: ${category.limit.toLocaleString()} VND</div>
                <div>Đã chi: ${category.spent.toLocaleString()} VND</div>
            </div>
            <div class="category-actions">
                <button class="edit-category-btn">Sửa</button>
                <button class="delete-category-btn">Xóa</button>
            </div>
        </div>
    `).join('');

    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.category-item');
            const index = parseInt(item.dataset.index);
            openEditCategoryModal(index);
        });
    });

    document.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const item = e.target.closest('.category-item');
            const index = parseInt(item.dataset.index);
            deleteCategory(index);
        });
    });
}

function openEditCategoryModal(index) {
    const month = monthSelect.value.substring(0, 7);
    const category = budgets[currentUser.email][month].categories[index];
    document.getElementById('editCategoryName').value = category.name;
    document.getElementById('editCategoryLimit').value = category.limit;
    currentEditCategoryIndex = index;
    editCategoryModal.style.display = 'block';
}

function closeEditCategoryModal() {
    editCategoryModal.style.display = 'none';
    currentEditCategoryIndex = -1;
}

function deleteCategory(index) {
    const month = monthSelect.value.substring(0, 7);
    budgets[currentUser.email][month].categories.splice(index, 1);
    localStorage.setItem('budgets', JSON.stringify(budgets));
    loadMonthData();
}

// Get modal elements
const editCategoryModal = document.getElementById('editCategoryModal');
const closeModalBtn = document.querySelector('.close-modal');
const saveEditCategoryBtn = document.getElementById('saveEditCategoryBtn');
let currentEditCategoryIndex = -1;

// Modal event listeners
if (closeModalBtn && editCategoryModal && saveEditCategoryBtn) {
    closeModalBtn.addEventListener('click', closeEditCategoryModal);
saveEditCategoryBtn.addEventListener('click', () => {
    const month = monthSelect.value.substring(0, 7);
    const name = document.getElementById('editCategoryName').value.trim();
    const limit = parseFloat(document.getElementById('editCategoryLimit').value);

    if (!name || isNaN(limit)) {
        alert('Vui lòng điền đầy đủ thông tin hợp lệ');
        return;
    }

    budgets[currentUser.email][month].categories[currentEditCategoryIndex] = {
        name,
        limit,
        spent: budgets[currentUser.email][month].categories[currentEditCategoryIndex].spent
    };
    
    localStorage.setItem('budgets', JSON.stringify(budgets));
    closeEditCategoryModal();
    loadMonthData();
});
    
    window.addEventListener('click', (e) => {
        if (e.target === editCategoryModal) {
            closeEditCategoryModal();
        }
    });
}

saveEditCategoryBtn.addEventListener('click', () => {
    const month = monthSelect.value.substring(0, 7);
    const name = document.getElementById('editCategoryName').value.trim();
    const limit = parseFloat(document.getElementById('editCategoryLimit').value);

    if (!name || !limit) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }

    budgets[currentUser.email][month].categories[currentEditCategoryIndex] = {
        name,
        limit,
        spent: budgets[currentUser.email][month].categories[currentEditCategoryIndex].spent
    };
    localStorage.setItem('budgets', JSON.stringify(budgets));
    closeEditCategoryModal();
    loadMonthData();
});

// Thêm danh mục
if (addCategoryBtn) {
    addCategoryBtn.addEventListener('click', () => {
        const month = monthSelect.value.substring(0, 7);
        const name = categoryName.value.trim();
        const limit = parseFloat(categoryLimit.value);

        if (!name) {
            alert('Vui lòng nhập tên danh mục');
            return;
        }

        if (!limit || isNaN(limit)) {
            alert('Vui lòng nhập giới hạn chi tiêu hợp lệ');
            return;
        }

        // Initialize user data if not exists
        if (!budgets[currentUser.email]) {
            budgets[currentUser.email] = {};
        }
        if (!budgets[currentUser.email][month]) {
            budgets[currentUser.email][month] = {
                budget: 0,
                categories: [],
                expenses: [],
                spent: 0
            };
        }

        // Add category
        budgets[currentUser.email][month].categories.push({
            name,
            limit,
            spent: 0
        });
        localStorage.setItem('budgets', JSON.stringify(budgets));

        // Update UI
        loadMonthData();
        categoryName.value = '';
        categoryLimit.value = '';
    });
}

// Expense Management System
let currentPage = 1;
const itemsPerPage = 5;

// Thêm chi phí
if (addExpenseBtn) {
    addExpenseBtn.addEventListener('click', () => {
        const month = monthSelect.value.substring(0, 7);
        const amount = parseFloat(expenseAmount.value);
        const category = document.getElementById('expenseCategory').value;
        const date = document.getElementById('expenseDate').value || new Date().toISOString().substring(0, 10);
        const note = expenseNote.value;

        if (!amount || isNaN(amount)) {
            showWarning('Vui lòng nhập số tiền hợp lệ', 'expenseWarning');
            return;
        }

        if (!category) {
            showWarning('Vui lòng chọn danh mục', 'expenseWarning');
            return;
        }

        // Initialize month data if not exists
        if (!budgets[currentUser.email]) {
            budgets[currentUser.email] = {};
        }
        if (!budgets[currentUser.email][month]) {
            budgets[currentUser.email][month] = {
                budget: 0,
                categories: [],
                expenses: [],
                spent: 0
            };
        }

        // Add expense
        const expense = {
            id: Date.now(),
            amount,
            category,
            date,
            note,
            createdAt: new Date().toISOString()
        };

        budgets[currentUser.email][month].expenses.push(expense);
        
        // Update category spent amount
        const categoryIndex = budgets[currentUser.email][month].categories.findIndex(c => c.name === category);
        if (categoryIndex !== -1) {
            budgets[currentUser.email][month].categories[categoryIndex].spent += amount;
        }

        // Update total spent
        budgets[currentUser.email][month].spent += amount;
        localStorage.setItem('budgets', JSON.stringify(budgets));

        // Update UI
        loadMonthData();
        expenseAmount.value = '';
        expenseNote.value = '';
        document.getElementById('expenseWarning').textContent = '';
    });
}

// Show warning message
function showWarning(message, elementId) {
    const warningElement = document.getElementById(elementId);
    warningElement.textContent = message;
    warningElement.style.color = 'red';
    setTimeout(() => {
        warningElement.textContent = '';
    }, 3000);
}

// Render expenses with pagination
function renderExpenses(expenses) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedExpenses = expenses.slice(startIndex, startIndex + itemsPerPage);
    
    expensesHistory.innerHTML = paginatedExpenses.map(expense => `
        <div class="transaction-item" data-id="${expense.id}">
            <div>
                <strong>${expense.category}</strong>
                <div>${new Date(expense.date).toLocaleDateString()}</div>
                <div>${expense.note || 'Không có ghi chú'}</div>
            </div>
            <div>
                <div class="expense-amount">${expense.amount.toLocaleString()} VND</div>
                <div class="transaction-actions">
                    <button class="delete-expense-btn" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-expense-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const expenseId = parseInt(e.target.closest('.transaction-item').dataset.id);
            deleteExpense(expenseId);
        });
    });

    // Update pagination controls
    updatePaginationControls(expenses.length);
}

// Delete expense
function deleteExpense(expenseId) {
    const month = monthSelect.value.substring(0, 7);
    const expenseIndex = budgets[currentUser.email][month].expenses.findIndex(e => e.id === expenseId);
    
    if (expenseIndex !== -1) {
        const expense = budgets[currentUser.email][month].expenses[expenseIndex];
        
        // Update category spent amount
        const categoryIndex = budgets[currentUser.email][month].categories.findIndex(c => c.name === expense.category);
        if (categoryIndex !== -1) {
            budgets[currentUser.email][month].categories[categoryIndex].spent -= expense.amount;
        }

        // Update total spent
        budgets[currentUser.email][month].spent -= expense.amount;
        
        // Remove expense
        budgets[currentUser.email][month].expenses.splice(expenseIndex, 1);
        localStorage.setItem('budgets', JSON.stringify(budgets));
        
        loadMonthData();
    }
}

// Update pagination controls
function updatePaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;

    // Add event listeners
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadMonthData();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadMonthData();
        }
    });
}

// Search expenses
if (document.getElementById('searchInput')) {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        currentPage = 1;
        loadMonthData();
    });
}

// Sort expenses
if (document.getElementById('sortSelect')) {
    document.getElementById('sortSelect').addEventListener('change', () => {
        loadMonthData();
    });
}

// Tải dữ liệu cho tháng đã chọn
function loadMonthData() {
    const month = monthSelect.value.substring(0, 7);
    
    if (!currentUser || !budgets[currentUser.email] || !budgets[currentUser.email][month]) {
        // Khởi tạo dữ liệu tháng trống
        remainingAmount.textContent = '0 VND';
        categoriesList.innerHTML = '';
        expensesHistory.innerHTML = '';
        document.getElementById('budgetWarning').className = 'budget-alert hidden';
        monthlyStats.innerHTML = '';
        
        // Clear category dropdown
        const categorySelect = document.getElementById('expenseCategory');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">-- Chọn danh mục --</option>';
        }
        return;
    }

    const monthData = budgets[currentUser.email][month];

    // Cập nhật hiển thị ngân sách
    const remaining = monthData.budget - monthData.spent;
    remainingAmount.textContent = remaining.toLocaleString() + ' VND';

    // Cập nhật dropdown danh mục
    updateCategoryDropdown(monthData.categories);

    // Cập nhật danh sách danh mục
    renderCategories(monthData);

    // Xử lý tìm kiếm và sắp xếp chi phí
    let filteredExpenses = [...monthData.expenses];
    
    // Tìm kiếm
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase();
    if (searchTerm) {
        filteredExpenses = filteredExpenses.filter(expense => 
            (expense.note && expense.note.toLowerCase().includes(searchTerm)) ||
            (expense.category && expense.category.toLowerCase().includes(searchTerm))
        );
    }

    // Sắp xếp
    const sortValue = document.getElementById('sortSelect')?.value;
    switch(sortValue) {
        case 'date-desc':
            filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            filteredExpenses.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'amount-desc':
            filteredExpenses.sort((a, b) => b.amount - a.amount);
            break;
        case 'amount-asc':
            filteredExpenses.sort((a, b) => a.amount - b.amount);
            break;
        default:
            filteredExpenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Hiển thị chi phí đã lọc và sắp xếp
    renderExpenses(filteredExpenses);

    // Kiểm tra cảnh báo ngân sách
    const warningElement = document.getElementById('budgetWarning');
    if (monthData.spent > monthData.budget) {
        warningElement.className = 'budget-alert danger';
        warningElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>Cảnh báo: Bạn đã vượt quá ngân sách! Đã chi ${monthData.spent.toLocaleString()} / ${monthData.budget.toLocaleString()} VND</span>
        `;
    } else if (remaining < (monthData.budget * 0.2)) {
        warningElement.className = 'budget-alert warning';
        warningElement.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>Cảnh báo: Bạn sắp hết ngân sách! Còn lại ${remaining.toLocaleString()} VND</span>
        `;
    } else {
        warningElement.className = 'budget-alert hidden';
    }

    // Cập nhật số liệu thống kê hàng tháng
    updateMonthlyStats();
}

// Update category dropdown
function updateCategoryDropdown(categories) {
    const categorySelect = document.getElementById('expenseCategory');
    if (categorySelect) {
        // Clear existing options except the first one
        categorySelect.innerHTML = '<option value="">-- Chọn danh mục --</option>';
        
        // Add current categories
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }
}

// Cập nhật số liệu thống kê hàng tháng
function updateMonthlyStats() {
    if (!currentUser || !budgets[currentUser.email]) {
        monthlyStats.innerHTML = '';
        return;
    }

    const userData = budgets[currentUser.email];
    const months = Object.keys(userData).sort().reverse().slice(0, 3); // Hiển thị 3 tháng qua

    monthlyStats.innerHTML = months.map(month => {
        const data = userData[month];
        const status = data.spent > data.budget ? '❌ Vượt' : '✅ Đạt';
        return `
            <div class="item">
                <span>${month}</span>
                <span>${data.spent.toLocaleString()} VND</span>
                <span>${data.budget.toLocaleString()}</span>
                <span>${status}</span>
            </div>
        `;
    }).join('');
}