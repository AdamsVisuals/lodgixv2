document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    initDashboard();
    loadRooms();
    loadGuests();
    loadBookings();
    loadStaff();
    
    // Setup event listeners
    setupEventListeners();
});

function initDashboard() {
    // Update dashboard stats
    updateDashboardStats();
    
    // Set active nav item
    const path = window.location.hash.substr(1) || 'dashboard';
    setActiveNavItem(path);
    
    // Load appropriate section
    loadSection(path);
}

function updateDashboardStats() {
    const stats = {
        totalRooms: dataStore.rooms.length,
        availableRooms: dataStore.rooms.filter(r => r.status === 'available').length,
        totalGuests: dataStore.guests.length,
        activeBookings: dataStore.bookings.filter(b => 
            new Date(b.checkOut) >= new Date() && b.status === 'confirmed').length
    };
    
    document.getElementById('total-rooms').textContent = stats.totalRooms;
    document.getElementById('available-rooms').textContent = stats.availableRooms;
    document.getElementById('total-guests').textContent = stats.totalGuests;
    document.getElementById('active-bookings').textContent = stats.activeBookings;
}

function loadRooms() {
    const roomTable = document.getElementById('room-table-body');
    roomTable.innerHTML = '';
    
    dataStore.rooms.forEach(room => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.id}</td>
            <td>${room.type}</td>
            <td>${room.capacity}</td>
            <td>${dataStore.settings.currency}${room.price}</td>
            <td><span class="status-badge ${room.status}">${room.status}</span></td>
            <td>${room.amenities.join(', ')}</td>
            <td>
                <button class="btn-edit" data-id="${room.id}">Edit</button>
                <button class="btn-delete" data-id="${room.id}">Delete</button>
            </td>
        `;
        roomTable.appendChild(row);
    });
}

// Similar functions for loadGuests(), loadBookings(), loadStaff()

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('href').substr(1);
            setActiveNavItem(section);
            loadSection(section);
            window.location.hash = section;
        });
    });
    
    // Room management
    document.getElementById('add-room-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newRoom = {
            type: formData.get('type'),
            capacity: parseInt(formData.get('capacity')),
            price: parseFloat(formData.get('price')),
            status: formData.get('status'),
            amenities: formData.get('amenities').split(',').map(a => a.trim())
        };
        
        dataStore.addRoom(newRoom);
        loadRooms();
        updateDashboardStats();
        e.target.reset();
        document.getElementById('room-modal').style.display = 'none';
    });
    
    // Similar event listeners for other forms and actions
}

function setActiveNavItem(section) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${section}`);
    });
}

function loadSection(section) {
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    document.getElementById(`${section}-section`).style.display = 'block';
    
    // Refresh section data
    switch(section) {
        case 'rooms':
            loadRooms();
            break;
        case 'guests':
            loadGuests();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'staff':
            loadStaff();
            break;
        case 'dashboard':
            updateDashboardStats();
            break;
    }
}