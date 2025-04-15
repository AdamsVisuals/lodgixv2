document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
    
    // Set up event listeners
    setupEventListeners();
});

// Global variables
let currentPage = 1;
const guestsPerPage = 10;

function initializeApp() {
    // Create empty arrays in localStorage if they don't exist
    if (!localStorage.getItem('hotelRooms')) {
        localStorage.setItem('hotelRooms', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('lodgix-guests')) {
        localStorage.setItem('lodgix-guests', JSON.stringify([]));
    }
    
    // Load initial data
    loadGuests();
    updatePagination();
}

function setupEventListeners() {
    // Modal controls
    document.getElementById('add-guest-btn').addEventListener('click', openGuestModal);
    document.querySelector('.close-modal').addEventListener('click', closeGuestModal);
    document.getElementById('cancel-guest-btn').addEventListener('click', closeGuestModal);
    
    // Form submission
    document.getElementById('guest-form').addEventListener('submit', handleFormSubmit);
    
    // Search and filter
    document.getElementById('guest-search').addEventListener('input', loadGuests);
    document.getElementById('guest-status-filter').addEventListener('change', loadGuests);
    
    // Pagination
    document.getElementById('prev-page').addEventListener('click', goToPrevPage);
    document.getElementById('next-page').addEventListener('click', goToNextPage);
    
    // Export
    document.getElementById('export-guest-btn').addEventListener('click', exportGuests);
}

function loadGuests() {
    const searchTerm = document.getElementById('guest-search').value.toLowerCase();
    const statusFilter = document.getElementById('guest-status-filter').value;
    
    // Get all guests from localStorage
    const guests = JSON.parse(localStorage.getItem('lodgix-guests')) || [];
    
    // Filter guests based on search and status
    const filteredGuests = guests.filter(guest => {
        const matchesSearch = 
            guest.id.toLowerCase().includes(searchTerm) ||
            guest.firstName.toLowerCase().includes(searchTerm) ||
            guest.lastName.toLowerCase().includes(searchTerm) ||
            guest.email.toLowerCase().includes(searchTerm) ||
            guest.phone.includes(searchTerm) ||
            (guest.roomNumber && guest.roomNumber.includes(searchTerm));
        
        const matchesStatus = 
            statusFilter === 'all' || 
            (statusFilter === 'checked-in' && guest.status === 'checked-in') ||
            (statusFilter === 'checked-out' && guest.status === 'checked-out') ||
            (statusFilter === 'vip' && guest.guestStatus === 'vip') ||
            (statusFilter === 'loyalty' && guest.loyaltyPoints > 0);
        
        return matchesSearch && matchesStatus;
    });
    
    // Display guests for current page
    displayGuests(filteredGuests);
    updatePagination(filteredGuests.length);
}

function displayGuests(guests) {
    const tableBody = document.getElementById('guest-table-body');
    tableBody.innerHTML = '';
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * guestsPerPage;
    const endIndex = startIndex + guestsPerPage;
    const paginatedGuests = guests.slice(startIndex, endIndex);
    
    if (paginatedGuests.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" class="no-guests">No guests found</td></tr>`;
        return;
    }
    
    paginatedGuests.forEach(guest => {
        const row = document.createElement('tr');
        
        // Format dates
        const checkInDate = guest.checkInDate ? new Date(guest.checkInDate) : null;
        const checkOutDate = guest.checkOutDate ? new Date(guest.checkOutDate) : null;
        
        const formattedCheckIn = checkInDate ? checkInDate.toLocaleDateString() + ' ' + checkInDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A';
        const formattedCheckOut = checkOutDate ? checkOutDate.toLocaleDateString() + ' ' + checkOutDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A';
        
        // Determine status
        let statusClass = '';
        let statusText = '';
        
        if (guest.status === 'checked-in') {
            statusClass = 'status-checked-in';
            statusText = 'Checked In';
        } else if (guest.status === 'checked-out') {
            statusClass = 'status-checked-out';
            statusText = 'Checked Out';
        } else if (guest.guestStatus === 'vip') {
            statusClass = 'status-vip';
            statusText = 'VIP';
        } else if (guest.guestStatus === 'blacklisted') {
            statusClass = 'status-blacklisted';
            statusText = 'Blacklisted';
        } else {
            statusClass = 'status-active';
            statusText = 'Active';
        }
        
        row.innerHTML = `
            <td>${guest.id || 'N/A'}</td>
            <td>${guest.firstName} ${guest.lastName}</td>
            <td>${guest.roomNumber || 'N/A'}</td>
            <td>${formattedCheckIn}</td>
            <td>${formattedCheckOut}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${guest.id}"><i class="fas fa-edit"></i></button>
                    ${guest.status === 'checked-in' ? 
                        `<button class="action-btn checkout-btn" data-id="${guest.id}"><i class="fas fa-sign-out-alt"></i></button>` : 
                        `<button class="action-btn checkin-btn" data-id="${guest.id}"><i class="fas fa-sign-in-alt"></i></button>`}
                    <button class="action-btn delete-btn" data-id="${guest.id}"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    addActionButtonListeners();
}

function addActionButtonListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editGuest(btn.dataset.id));
    });
    
    document.querySelectorAll('.checkin-btn').forEach(btn => {
        btn.addEventListener('click', () => updateGuestStatus(btn.dataset.id, 'checked-in'));
    });
    
    document.querySelectorAll('.checkout-btn').forEach(btn => {
        btn.addEventListener('click', () => updateGuestStatus(btn.dataset.id, 'checked-out'));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteGuest(btn.dataset.id));
    });
}

function openGuestModal() {
    document.getElementById('guest-modal-title').textContent = 'Add New Guest';
    document.getElementById('guest-form').reset();
    document.getElementById('guest-id').value = '';
    loadAvailableRooms();
    document.getElementById('guest-modal').style.display = 'flex';
}

function closeGuestModal() {
    document.getElementById('guest-modal').style.display = 'none';
}

function loadAvailableRooms() {
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    const guests = JSON.parse(localStorage.getItem('lodgix-guests')) || [];
    
    // Get currently occupied rooms
    const occupiedRooms = guests
        .filter(guest => guest.status === 'checked-in' && guest.roomNumber)
        .map(guest => guest.roomNumber);
    
    const roomSelect = document.getElementById('assigned-room');
    
    // Clear existing options except the default
    while (roomSelect.options.length > 1) {
        roomSelect.remove(1);
    }
    
    // Add available rooms
    rooms.forEach(room => {
        if (!occupiedRooms.includes(room.number)) {
            const option = document.createElement('option');
            option.value = room.number;
            option.textContent = `${room.number} (${room.type || 'Room'})`;
            roomSelect.appendChild(option);
        }
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const guestId = document.getElementById('guest-id').value;
    const formData = {
        id: guestId || generateGuestId(),
        firstName: document.getElementById('guest-first-name').value,
        lastName: document.getElementById('guest-last-name').value,
        email: document.getElementById('guest-email').value,
        phone: document.getElementById('guest-phone').value,
        checkInDate: document.getElementById('check-in-date').value,
        checkOutDate: document.getElementById('check-out-date').value,
        roomNumber: document.getElementById('assigned-room').value,
        address: document.getElementById('guest-address').value,
        country: document.getElementById('guest-country').value,
        idType: document.getElementById('guest-id-type').value,
        idNumber: document.getElementById('guest-id-number').value,
        guestStatus: document.getElementById('guest-status').value,
        loyaltyPoints: parseInt(document.getElementById('guest-loyalty').value) || 0,
        notes: document.getElementById('guest-notes').value,
        status: 'checked-in' // Default status when adding new guest
    };
    
    const guests = JSON.parse(localStorage.getItem('lodgix-guests')) || [];
    
    if (guestId) {
        // Update existing guest
        const index = guests.findIndex(g => g.id === guestId);
        if (index !== -1) {
            guests[index] = formData;
        }
    } else {
        // Add new guest
        guests.push(formData);
    }
    
    localStorage.setItem('lodgix-guests', JSON.stringify(guests));
    closeGuestModal();
    loadGuests();
}

function editGuest(id) {
    const guests = JSON.parse(localStorage.getItem('lodgix-guests')) || [];
    const guest = guests.find(g => g.id === id);
    
    if (guest) {
        document.getElementById('guest-modal-title').textContent = 'Edit Guest';
        document.getElementById('guest-id').value = guest.id;
        document.getElementById('guest-first-name').value = guest.firstName || '';
        document.getElementById('guest-last-name').value = guest.lastName || '';
        document.getElementById('guest-email').value = guest.email || '';
        document.getElementById('guest-phone').value = guest.phone || '';
        document.getElementById('check-in-date').value = guest.checkInDate || '';
        document.getElementById('check-out-date').value = guest.checkOutDate || '';
        document.getElementById('guest-address').value = guest.address || '';
        document.getElementById('guest-country').value = guest.country || '';
        document.getElementById('guest-id-type').value = guest.idType || 'passport';
        document.getElementById('guest-id-number').value = guest.idNumber || '';
        document.getElementById('guest-status').value = guest.guestStatus || 'active';
        document.getElementById('guest-loyalty').value = guest.loyaltyPoints || 0;
        document.getElementById('guest-notes').value = guest.notes || '';
        
        // Load rooms and set the current room
        loadAvailableRooms();
        if (guest.roomNumber) {
            const roomSelect = document.getElementById('assigned-room');
            const optionExists = Array.from(roomSelect.options).some(opt => opt.value === guest.roomNumber);
            
            if (!optionExists && guest.roomNumber) {
                const option = document.createElement('option');
                option.value = guest.roomNumber;
                option.textContent = guest.roomNumber;
                option.selected = true;
                roomSelect.appendChild(option);
            } else {
                roomSelect.value = guest.roomNumber;
            }
        }
        
        document.getElementById('guest-modal').style.display = 'flex';
    }
}

function updateGuestStatus(id, status) {
    const guests = JSON.parse(localStorage.getItem('lodgix-guests')) || [];
    const guestIndex = guests.findIndex(g => g.id === id);
    
    if (guestIndex !== -1) {
        guests[guestIndex].status = status;
        
        // If checking out, clear the room assignment
        if (status === 'checked-out') {
            guests[guestIndex].roomNumber = '';
        }
        
        localStorage.setItem('lodgix-guests', JSON.stringify(guests));
        loadGuests();
    }
}

function deleteGuest(id) {
    if (confirm('Are you sure you want to delete this guest?')) {
        const guests = JSON.parse(localStorage.getItem('lodgix-guests')) || [];
        const updatedGuests = guests.filter(g => g.id !== id);
        localStorage.setItem('lodgix-guests', JSON.stringify(updatedGuests));
        loadGuests();
    }
}

function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadGuests();
    }
}

function goToNextPage() {
    const guests = JSON.parse(localStorage.getItem('lodgix-guests')) || [];
    const totalPages = Math.ceil(guests.length / guestsPerPage);
    
    if (currentPage < totalPages) {
        currentPage++;
        loadGuests();
    }
}

function updatePagination(totalGuests = 0) {
    const guests = JSON.parse(localStorage.getItem('lodgix-guests')) || [];
    const actualTotal = totalGuests || guests.length;
    const totalPages = Math.ceil(actualTotal / guestsPerPage);
    
    document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Disable/enable pagination buttons
    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages || totalPages === 0;
}

function generateGuestId() {
    return 'guest-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function exportGuests() {
    const guests = JSON.parse(localStorage.getItem('lodgix-guests')) || [];
    
    if (guests.length === 0) {
        alert('No guests to export');
        return;
    }
    
    // Convert to CSV
    const headers = Object.keys(guests[0]);
    let csv = headers.join(',') + '\n';
    
    guests.forEach(guest => {
        const row = headers.map(header => {
            let value = guest[header];
            // Handle nested objects or arrays if needed
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            // Escape commas in values
            if (typeof value === 'string' && value.includes(',')) {
                value = `"${value}"`;
            }
            return value || '';
        });
        csv += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `lodgix-guests-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}