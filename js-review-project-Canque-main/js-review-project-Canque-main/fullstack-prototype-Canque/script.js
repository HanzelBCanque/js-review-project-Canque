const STORAGE_KEY = 'ipt_demo_v1';
window.db = {
    accounts: [],
    departments: [],
    employees: []
};

let currentUser = null; 

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db)); 
}

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY); 
    if (data) {
        window.db = JSON.parse(data);
    } else {
      
        window.db.accounts.push({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            password: 'Password123!',
            role: 'Admin',
            verified: true
        });
        window.db.departments = ['Engineering', 'HR']; 
        window.db.employees = [];
        window.db.requests = [];
        saveToStorage();
    }
}
loadFromStorage();

// Restore currentUser from localStorage if auth_token exists
const authToken = localStorage.getItem('auth_token');
if (authToken) {
    currentUser = window.db.accounts.find(acc => acc.email === authToken);
}

function handleRouting() {
    const hash = window.location.hash || '#/';
    const isAuth = localStorage.getItem('auth_token');
    
    // 1. Define Route Protection Lists 
    const protectedRoutes = ['#/profile', '#/employees', '#/accounts', '#/departments', '#/requests'];
    const adminRoutes = ['#/employees', '#/accounts', '#/departments'];

    // 2. THE BOUNCER: Security Checks [cite: 381-387]
    if (protectedRoutes.includes(hash) && !isAuth) {
        window.location.hash = '#/login'; // Redirect unauthenticated [cite: 384]
        return;
    }

    if (adminRoutes.includes(hash) && (!currentUser || currentUser.role !== 'Admin')) {
        window.location.hash = '#/'; // Block non-admins [cite: 387]
        return;
    }

    // 3. Page Switching Logic [cite: 378, 379]
    // First, hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));

    // 4. Specific View Logic 
    if (hash === '#/profile') {
        renderProfile(); // Populate user data before showing [cite: 243, 246]
    }else if(hash === '#/departments') {
    renderDepartmentsList();
    } else if (hash === '#/accounts') {
        renderAccountsList();
    } else if (hash === '#/employees') {
        renderEmployeesTable();
    } else if (hash === '#/requests') {
        renderMyRequests();
    }
    

    // 5. Show the active page 
    const pageId = hash === '#/' ? 'home-page' : `${hash.substring(2)}-page`;
    const target = document.getElementById(pageId);
    
    if (target) {
        target.classList.add('active');
    } else {
        // Fallback to Home if page doesn't exist
        document.getElementById('home-page').classList.add('active');
    }
}

function simulateVerification() {
    const email = localStorage.getItem('unverified_email');
    const userData = JSON.parse(localStorage.getItem(`user_${email}`));

    if (userData) {
        userData.verified = true; 
        localStorage.setItem(`user_${email}`, JSON.stringify(userData)); 
        
        alert("Email verified! You may now log in."); 
        window.location.hash = '#/login'; 
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const email = document.getElementById('reg-email').value;
    
  
    if (window.db.accounts.some(acc => acc.email === email)) {
        return alert("Email already exists!");
    }

    const newUser = {
        firstName: document.getElementById('reg-firstname').value,
        lastName: document.getElementById('reg-lastname').value,
        email: email,
        password: document.getElementById('reg-password').value,
        verified: false,
        role: 'User'
    };

    window.db.accounts.push(newUser); 
    localStorage.setItem('unverified_email', email); 
    saveToStorage(); 
    window.location.hash = '#/verify-email'; 
}

function simulateVerification() {
    const email = localStorage.getItem('unverified_email');
    const targetAccount = window.db.accounts.find(acc => acc.email === email);

    if (targetAccount) {
        targetAccount.verified = true; 
        saveToStorage(); 
        alert("Email verified! You may now log in."); 
        window.location.hash = '#/login'; 
    }
}

function handleLogin(event) {
    event.preventDefault();
    localStorage.removeItem('auth_token');
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    
    const userData = window.db.accounts.find(acc => acc.email === email && acc.password === pass);
const emailField = document.getElementById('login-email');
    const passwordField = document.getElementById('login-password');
    
    if (emailField) emailField.value = ""; // Himoong empty ang email field
    if (passwordField) passwordField.value = "";
    if (userData && userData.verified === true) {

        localStorage.setItem('auth_token', email);
        currentUser = userData;
        setAuthState(true, userData);  
        alert("Login Successful!");
        window.location.hash = '#/profile';
    } else if (userData && userData.verified === false) {
        alert("Please verify your email first!");
    } else {
        alert("Invalid email or password."); 
    }
    
}


document.addEventListener('DOMContentLoaded', () => {
   
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
   
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    window.addEventListener('hashchange', handleRouting);
    handleRouting();
    document.getElementById('add-employee-btn')?.addEventListener('click', () => {
    document.getElementById('employee-form-container').classList.toggle('d-none');
    });

    document.getElementById('cancel-emp-btn')?.addEventListener('click', () => {
        document.getElementById('employee-form-container').classList.add('d-none');
    });

    // Form Submission
    document.getElementById('employee-form')?.addEventListener('submit', handleEmployeeSubmit);
    document.getElementById('add-account-btn')?.addEventListener('click', () => {
    document.getElementById('account-form-title').innerText = "Add Account";
    document.getElementById('account-form-container').classList.remove('d-none');
    document.getElementById('add-item-btn').onclick = addItemRow;
    const itemsContainer = document.getElementById('dynamic-items-list');
    if (itemsContainer) addItemRow();
});
document.getElementById('cancel-acc-btn')?.addEventListener('click', closeAccountForm);
document.getElementById('account-form')?.addEventListener('submit', handleAccountSubmit);
document.getElementById('add-item-btn')?.addEventListener('click', addItemRow);
document.getElementById('request-form')?.addEventListener('submit', handleRequestSubmit);

// Initial item row
createItemRow();
const requestModal = document.getElementById('requestModal');
    if (requestModal) {
        requestModal.addEventListener('shown.bs.modal', () => {
            const container = document.getElementById('dynamic-items-list');
            // Only add an initial row if the list is empty
            if (container && container.innerHTML === '') {
                addItemRow(); 
            }
        });
        
        // ACCESSIBILITY FIX: Remove aria-hidden to prevent focus errors
        requestModal.addEventListener('hide.bs.modal', function () {
            this.removeAttribute('aria-hidden');
        });
        
        requestModal.addEventListener('hidden.bs.modal', function () {
            this.removeAttribute('aria-hidden');
        });
    }

    
// Update Router to call render
window.addEventListener('hashchange', handleRouting);
    handleRouting();
});

function renderProfile() {
    if (!currentUser) return; // Safety check

    // Fill the HTML elements with the current user's data
    document.getElementById('prof-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('prof-email').textContent = currentUser.email;
    document.getElementById('prof-role').textContent = currentUser.role;
}
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('auth_token'); // Clear the session [cite: 227]
    setAuthState(false); // Update UI [cite: 228]
    window.location.hash = '#/'; // Navigate home [cite: 229]
});
function handleLogout(event) {
    if (event) event.preventDefault();
    
    // 1. Clear the session [cite: 227]
    localStorage.removeItem('auth_token');
    
    // 2. Reset the global user [cite: 223]
    currentUser = null;
    
    // 3. Reset UI state (removes authenticated/is-admin classes) [cite: 228, 421]
    setAuthState(false);
    
    // 4. Navigate back to Home [cite: 229]
    window.location.hash = '#/';
    alert("You have been logged out.");
}

function setAuthState(isAuth, user) {
    const body = document.body;


    if (isAuth) {
        
        document.body.classList.remove('not-authenticated');
        document.body.classList.add('authenticated');
        
        
        if (user.role === 'Admin') {
            body.classList.add('is-admin');
        }
    } else {
        
        body.classList.remove('authenticated', 'is-admin');
        body.classList.add('not-authenticated');
    }
}

function renderEmployeesTable() {
    const tbody = document.getElementById('employees-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (window.db.employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No employees.</td></tr>';
        return;
    }

    window.db.employees.forEach(emp => {
        const user = window.db.accounts.find(a => a.email === emp.userEmail);
        const name = user ? `${user.firstName} ${user.lastName}` : "Unknown";

        const row = document.createElement('tr');
        // FIXED ORDER: ID | Name | Position | Dept | Actions
        row.innerHTML = `
            <td>${emp.id}</td>
            <td>${name}</td>
            <td>${emp.position}</td>
            <td>${emp.dept}</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee('${emp.id}')">
                    Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function handleEmployeeSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('emp-email').value;
    
    // Validation: User must exist in accounts [cite: 263]
    if (!window.db.accounts.find(a => a.email === email)) {
        return alert("Error: User email does not exist in Accounts list.");
    }

    const newEmp = {
        id: document.getElementById('emp-id').value,
        userEmail: email,
        position: document.getElementById('emp-pos').value,
        dept: document.getElementById('emp-dept').value,
        hireDate: document.getElementById('emp-date').value
    };

    window.db.employees.push(newEmp);
    saveToStorage(); // Phase 4 Persistence [cite: 240, 437]
    renderEmployeesTable();
    
    document.getElementById('employee-form').reset();
    document.getElementById('employee-form-container').classList.add('d-none');
}
function deleteEmployee(empId) {
    // 1. Confirm with the user before deleting [cite: 254]
    if (confirm(`Are you sure you want to delete Employee ID: ${empId}?`)) {
        
        // 2. Filter the array to remove the specific employee
        window.db.employees = window.db.employees.filter(emp => emp.id !== empId);
        
        // 3. Save the updated database to localStorage [cite: 240, 439]
        saveToStorage();
        
        // 4. Re-render the table to show the change immediately [cite: 268]
        renderEmployeesTable();
        
        alert("Employee deleted successfully.");
    }
}
function renderDepartmentsList() {
    const tbody = document.getElementById('departments-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    window.db.departments.forEach(dept => {
        const row = document.createElement('tr');
        // FIXED ORDER: Name | Description | Actions
        row.innerHTML = `
            <td>${dept}</td>
            <td>Team description here</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1">Edit</button>
                <button class="btn btn-sm btn-outline-danger">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderAccountsList() {
    const tbody = document.getElementById('accounts-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    window.db.accounts.forEach(acc => {
        const row = document.createElement('tr');
        // FIXED ORDER: Name | Email | Role | Verified | Actions
        row.innerHTML = `
            <td>${acc.firstName} ${acc.lastName}</td>
            <td>${acc.email}</td>
            <td><span class="badge ${acc.role === 'Admin' ? 'bg-primary' : 'bg-secondary'}">${acc.role}</span></td>
            <td>${acc.verified ? '✅' : '❌'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editAccount('${acc.email}')">Edit</button>
                <button class="btn btn-sm btn-outline-warning" onclick="resetPassword('${acc.email}')">Reset PW</button>
                <button class="btn btn-sm btn-outline-danger" 
                    onclick="deleteAccount('${acc.email}')" 
                    ${currentUser && acc.email === currentUser.email ? 'disabled' : ''}>Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}
function handleAccountSubmit(event) {
    event.preventDefault();
    const originalEmail = document.getElementById('edit-original-email').value;
    const email = document.getElementById('acc-email').value;

    const accountData = {
        firstName: document.getElementById('acc-firstname').value,
        lastName: document.getElementById('acc-lastname').value,
        email: email,
        role: document.getElementById('acc-role').value,
        verified: document.getElementById('acc-verified').checked
    };

    if (originalEmail) {
        // EDIT MODE: Update existing
        const index = window.db.accounts.findIndex(a => a.email === originalEmail);
        accountData.password = window.db.accounts[index].password; // Keep old PW
        window.db.accounts[index] = accountData;
    } else {
        // ADD MODE: Create new
        accountData.password = document.getElementById('acc-password').value || 'Password123!';
        window.db.accounts.push(accountData);
    }

    saveToStorage();
    renderAccountsList();
    closeAccountForm();
}
function resetPassword(email) {
    const newPass = prompt(`Enter new password for ${email} (Min. 6 characters):`);
    if (newPass && newPass.length >= 6) {
        const user = window.db.accounts.find(a => a.email === email);
        user.password = newPass;
        saveToStorage();
        alert("Password updated successfully.");
    } else if (newPass) {
        alert("Error: Password must be at least 6 characters.");
    }
}
function deleteAccount(email) {
    if (email === currentUser.email) return alert("You cannot delete your own account.");
    
    if (confirm(`Delete account ${email}? This cannot be undone.`)) {
        window.db.accounts = window.db.accounts.filter(a => a.email !== email);
        saveToStorage();
        renderAccountsList();
    }
}
function editAccount(email) {
    const acc = window.db.accounts.find(a => a.email === email);
    document.getElementById('account-form-title').innerText = "Edit Account";
    document.getElementById('edit-original-email').value = acc.email;
    document.getElementById('acc-firstname').value = acc.firstName;
    document.getElementById('acc-lastname').value = acc.lastName;
    document.getElementById('acc-email').value = acc.email;
    document.getElementById('acc-role').value = acc.role;
    document.getElementById('acc-verified').checked = acc.verified;
    document.getElementById('password-field-group').classList.add('d-none'); // Hide PW field during edit
    document.getElementById('account-form-container').classList.remove('d-none');
}

function closeAccountForm() {
    document.getElementById('account-form').reset();
    document.getElementById('edit-original-email').value = "";
    document.getElementById('password-field-group').classList.remove('d-none');
    document.getElementById('account-form-container').classList.add('d-none');
}

function createItemRow() {
    const container = document.getElementById('dynamic-items-container');    if (!container) return; // Guard: only run if container exists
        const row = document.createElement('div');
    row.className = 'd-flex gap-2 mb-2 item-row';
    row.innerHTML = `
        <input type="text" class="form-control item-name" placeholder="Item name" required>
        <input type="number" class="form-control item-qty" value="1" min="1" style="width: 80px;" required>
        <button type="button" class="btn btn-outline-danger btn-remove">×</button>
    `;
    
    row.querySelector('.btn-remove').onclick = () => {
        if (container.querySelectorAll('.item-row').length > 1) row.remove();
    };
    container.appendChild(row);
}
function addItemRow() {
    const container = document.getElementById('dynamic-items-list');
    
    // Safety check: stop if the container isn't in the DOM
    if (!container) return; 

    const row = document.createElement('div');
    row.className = 'd-flex gap-2 mb-2 item-row';
    row.innerHTML = `
        <input type="text" class="form-control item-name" placeholder="Item name" required>
        <input type="number" class="form-control item-qty" value="1" min="1" style="width: 80px;" required>
        <button type="button" class="btn btn-outline-danger remove-item-btn">×</button>
    `;
    
    // Remove Logic: "x" buttons delete specific rows
    row.querySelector('.remove-item-btn').onclick = () => {
        if (container.querySelectorAll('.item-row').length > 1) {
            row.remove();
        }
    };
    container.appendChild(row);
}
function renderMyRequests() {
    const tbody = document.getElementById('requests-table-body');
    const emptyState = document.getElementById('requests-empty');
    const tableContainer = document.getElementById('requests-table-container');

    if (!tbody || !currentUser) return;
    
    // Safety check for the requests array
    const myData = (window.db.requests || []).filter(r => r.employeeEmail === currentUser.email);

    // Toggle Empty State vs Table
    if (myData.length === 0) {
        emptyState?.classList.remove('d-none');
        tableContainer?.classList.add('d-none');
        return;
    }

    emptyState?.classList.add('d-none');
    tableContainer?.classList.remove('d-none');
    tbody.innerHTML = '';

    myData.forEach(req => {
        const statusColors = { "Pending": "warning", "Approved": "success", "Rejected": "danger" };
        const itemsText = req.items.map(i => `${i.name} (${i.qty})`).join(', ');

        const tr = document.createElement('tr');
        // FIXED COLUMN ORDER: Date, Type, Items, Status
        tr.innerHTML = `
            <td>${req.date}</td>
            <td>${req.type}</td>
            <td>${itemsText}</td>
            <td><span class="badge bg-${statusColors[req.status]}">${req.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}
document.getElementById('request-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Check if user is logged in
    if (!currentUser) {
        alert("Please log in first!");
        return;
    }
    
    // Capture all dynamic items
    const rows = document.querySelectorAll('.item-row');
    const items = Array.from(rows).map(row => ({
        name: row.querySelector('.item-name').value,
        qty: row.querySelector('.item-qty').value
    }));

    // Validation: Ensure items exist
    if (items.length === 0) return alert("Please add at least one item.");

    const newRequest = {
        type: document.getElementById('req-type').value,
        items: items,
        status: "Pending", // Default badge: .bg-warning
        date: new Date().toLocaleDateString(),
        employeeEmail: currentUser.email // Filter key: the "User Perspective"
    };

    // Save and Persist
    window.db.requests.push(newRequest);
    saveToStorage();
    renderMyRequests();
    
    // Cleanup Modal - Use custom close to avoid aria-hidden error
    closeModalSafely("requestModal");
    document.getElementById("request-form").reset();
    const itemsList = document.getElementById('dynamic-items-list');
    if (itemsList) {
        itemsList.innerHTML = '';
        addItemRow();
    } 
});
function handleRequestSubmit(event) {
    event.preventDefault();
    
    // Check if user is logged in
    if (!currentUser) {
        alert("Please log in first!");
        return;
    }
    
    const rows = document.querySelectorAll('.item-row');
    const items = [];
    rows.forEach(row => {
        const name = row.querySelector('.item-name').value;
        const qty = row.querySelector('.item-qty').value;
        if (name.trim() !== "") items.push({ name: name.trim(), qty });
    });

    if (items.length === 0) return alert("Please add at least one item.");

    const newRequest = {
        type: document.getElementById('req-type').value,
        items: items,
        status: "Pending", // bg-warning
        date: new Date().toLocaleDateString(),
        employeeEmail: currentUser.email
    };

    // FIXED: Ensure array exists before pushing
    if (!window.db.requests) window.db.requests = [];
    
    window.db.requests.push(newRequest);
    saveToStorage();
    renderMyRequests();
    // Close Modal - Use custom close to avoid aria-hidden error
    closeModalSafely("requestModal");
    document.getElementById("request-form").reset();
    document.getElementById("dynamic-items-list").innerHTML = "";
}

function closeModalSafely(modalId) {
    const modalElement = document.getElementById(modalId);
    
    // 1. Move focus to trigger button FIRST
    const triggerButton = document.querySelector(`[data-bs-target="#${modalId}"]`);
    if (triggerButton) {
        triggerButton.focus();
    }
    
    // 2. Use inert instead of letting Bootstrap use aria-hidden
    modalElement.inert = true;
    
    // 3. Manually close without Bootstrap's hide() method
    modalElement.classList.remove('show');
    setTimeout(() => {
        modalElement.style.display = 'none';
        modalElement.classList.remove('fade');
    }, 150);
    
    // 4. Clean up Bootstrap artifacts
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
        backdrop.classList.remove('show');
        setTimeout(() => backdrop.remove(), 150);
    }
    
    // 5. Re-enable after transition
    setTimeout(() => {
        modalElement.inert = false;
        modalElement.classList.add('fade');
    }, 300);
}










loadFromStorage();

// 2. AUTO-LOGIN: Stay in the account after refresh
const savedEmail = localStorage.getItem('auth_token');
if (savedEmail) {
    // Look for the user in your loaded database
    const user = window.db.accounts.find(acc => acc.email === savedEmail);
    if (user) {
        currentUser = user; // Restore the global variable
        setAuthState(true, user); // Restore the UI classes (Admin dropdown, etc.)
    }
}

// 3. Start the Router
handleRouting();