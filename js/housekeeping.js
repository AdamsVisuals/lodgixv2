document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initializeApp();
    
    // Set up event listeners
    setupEventListeners();
});

// Global variables
let currentRoomPage = 1;
let currentStaffPage = 1;
const itemsPerPage = 10;

function initializeApp() {
    // Create empty arrays in localStorage if they don't exist
    if (!localStorage.getItem('hotelRooms')) {
        localStorage.setItem('hotelRooms', JSON.stringify([]));
    }
    
    if (!localStorage.getItem('housekeepingStaff')) {
        localStorage.setItem('housekeepingStaff', JSON.stringify([]));
    }
    
    // Load initial data
    refreshData();
}

function setupEventListeners() {
    // View toggle
    document.getElementById('room-view-btn').addEventListener('click', () => switchView('room'));
    document.getElementById('staff-view-btn').addEventListener('click', () => switchView('staff'));
    
    // Room view controls
    document.getElementById('add-room-btn').addEventListener('click', openAddRoomModal);
    document.getElementById('room-search').addEventListener('input', filterRooms);
    document.getElementById('status-filter').addEventListener('change', filterRooms);
    document.getElementById('export-btn').addEventListener('click', exportReport);
    
    // Staff view controls
    document.getElementById('add-staff-btn').addEventListener('click', openAddStaffModal);
    
    // Modal controls
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    document.getElementById('cancel-room-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-staff-btn').addEventListener('click', closeModal);
    
    // Form submissions
    document.getElementById('room-form').addEventListener('submit', saveRoom);
    document.getElementById('staff-form').addEventListener('submit', saveStaff);
    
    // Room detail modal actions
    document.getElementById('save-note-btn').addEventListener('click', saveNote);
    document.getElementById('mark-clean-btn').addEventListener('click', () => updateRoomStatus('clean'));
    document.getElementById('mark-dirty-btn').addEventListener('click', () => updateRoomStatus('dirty'));
    document.getElementById('maintenance-btn').addEventListener('click', () => updateRoomStatus('maintenance'));
    document.getElementById('assign-staff').addEventListener('change', assignStaffToRoom);
    
    // Staff detail modal actions
    document.getElementById('assign-room-btn').addEventListener('click', assignRoomToStaff);
    document.getElementById('remove-staff-btn').addEventListener('click', removeStaffMember);
}

function refreshData() {
    renderRoomView();
    renderStaffView();
}

function switchView(view) {
    if (view === 'room') {
        document.getElementById('room-view').style.display = 'block';
        document.getElementById('staff-view').style.display = 'none';
        document.getElementById('room-view-btn').classList.add('active');
        document.getElementById('staff-view-btn').classList.remove('active');
    } else {
        document.getElementById('room-view').style.display = 'none';
        document.getElementById('staff-view').style.display = 'block';
        document.getElementById('room-view-btn').classList.remove('active');
        document.getElementById('staff-view-btn').classList.add('active');
    }
}

// Room Management Functions
function renderRoomView() {
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    const staff = JSON.parse(localStorage.getItem('housekeepingStaff')) || [];
    const roomGrid = document.getElementById('room-grid');
    roomGrid.innerHTML = '';
    
    if (rooms.length === 0) {
        roomGrid.innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-door-open"></i>
                <p>No rooms added yet</p>
                <button class="hk-btn gold-btn" id="add-first-room-btn">
                    <i class="fas fa-plus"></i> Add Your First Room
                </button>
            </div>
        `;
        document.getElementById('add-first-room-btn').addEventListener('click', openAddRoomModal);
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentRoomPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedRooms = rooms.slice(startIndex, endIndex);
    
    paginatedRooms.forEach(room => {
        const assignedStaff = staff.find(s => s.id === room.assignedStaffId);
        const lastCleaned = room.lastCleaned ? new Date(room.lastCleaned) : null;
        const isToday = lastCleaned && new Date().toDateString() === lastCleaned.toDateString();
        
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        roomCard.dataset.roomId = room.id;
        
        roomCard.innerHTML = `
            <div class="room-header">
                <div class="room-number">Room ${room.number}</div>
                <div class="room-type">${room.type.charAt(0).toUpperCase() + room.type.slice(1)}</div>
            </div>
            <div class="room-body">
                <div class="room-status status-${room.status.replace('-', '')}">
                    ${getStatusDisplayName(room.status)}
                </div>
                <div class="room-details">
                    ${lastCleaned ? `
                    <div class="room-detail">
                        <span class="detail-label">Last Cleaned:</span>
                        <span class="detail-value">${isToday ? 'Today' : 'Yesterday'}, ${lastCleaned.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    ` : ''}
                    <div class="room-detail">
                        <span class="detail-label">Assigned To:</span>
                        <span class="detail-value">${assignedStaff ? assignedStaff.name : 'Unassigned'}</span>
                    </div>
                </div>
                ${room.notes ? `<div class="room-notes">${room.notes}</div>` : ''}
                <div class="room-actions">
                    <button class="action-btn view-btn" data-room-id="${room.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        `;
        
        roomGrid.appendChild(roomCard);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const roomId = parseInt(this.dataset.roomId);
            openRoomModal(roomId);
        });
    });
    
    // Update pagination
    updateRoomPagination(rooms.length);
}

function filterRooms() {
    const searchTerm = document.getElementById('room-search').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    
    const filteredRooms = rooms.filter(room => {
        const matchesSearch = room.number.toString().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    displayFilteredRooms(filteredRooms);
}

function displayFilteredRooms(rooms) {
    const roomGrid = document.getElementById('room-grid');
    roomGrid.innerHTML = '';
    
    if (rooms.length === 0) {
        roomGrid.innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-search"></i>
                <p>No rooms match your search criteria</p>
            </div>
        `;
        return;
    }
    
    rooms.forEach(room => {
        const assignedStaff = JSON.parse(localStorage.getItem('housekeepingStaff')).find(s => s.id === room.assignedStaffId);
        const lastCleaned = room.lastCleaned ? new Date(room.lastCleaned) : null;
        const isToday = lastCleaned && new Date().toDateString() === lastCleaned.toDateString();
        
        const roomCard = document.createElement('div');
        roomCard.className = 'room-card';
        roomCard.dataset.roomId = room.id;
        
        roomCard.innerHTML = `
            <div class="room-header">
                <div class="room-number">Room ${room.number}</div>
                <div class="room-type">${room.type.charAt(0).toUpperCase() + room.type.slice(1)}</div>
            </div>
            <div class="room-body">
                <div class="room-status status-${room.status.replace('-', '')}">
                    ${getStatusDisplayName(room.status)}
                </div>
                <div class="room-details">
                    ${lastCleaned ? `
                    <div class="room-detail">
                        <span class="detail-label">Last Cleaned:</span>
                        <span class="detail-value">${isToday ? 'Today' : 'Yesterday'}, ${lastCleaned.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    ` : ''}
                    <div class="room-detail">
                        <span class="detail-label">Assigned To:</span>
                        <span class="detail-value">${assignedStaff ? assignedStaff.name : 'Unassigned'}</span>
                    </div>
                </div>
                ${room.notes ? `<div class="room-notes">${room.notes}</div>` : ''}
                <div class="room-actions">
                    <button class="action-btn view-btn" data-room-id="${room.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        `;
        
        roomGrid.appendChild(roomCard);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const roomId = parseInt(this.dataset.roomId);
            openRoomModal(roomId);
        });
    });
}

function updateRoomPagination(totalRooms) {
    const totalPages = Math.ceil(totalRooms / itemsPerPage);
    document.getElementById('room-page-info').textContent = `Page ${currentRoomPage} of ${totalPages}`;
    
    // Disable/enable pagination buttons if you add them
}

// Staff Management Functions
function renderStaffView() {
    const staff = JSON.parse(localStorage.getItem('housekeepingStaff')) || [];
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    const staffGrid = document.getElementById('staff-grid');
    staffGrid.innerHTML = '';
    
    if (staff.length === 0) {
        staffGrid.innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-users"></i>
                <p>No staff members added yet</p>
                <button class="hk-btn gold-btn" id="add-first-staff-btn">
                    <i class="fas fa-user-plus"></i> Add Your First Staff Member
                </button>
            </div>
        `;
        document.getElementById('add-first-staff-btn').addEventListener('click', openAddStaffModal);
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentStaffPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStaff = staff.slice(startIndex, endIndex);
    
    paginatedStaff.forEach(staffMember => {
        const assignedRooms = rooms.filter(room => room.assignedStaffId === staffMember.id);
        
        const staffCard = document.createElement('div');
        staffCard.className = 'staff-card';
        staffCard.dataset.staffId = staffMember.id;
        
        staffCard.innerHTML = `
            <div class="staff-header">
                <div>
                    <div class="staff-name">${staffMember.name}</div>
                    <div class="staff-email">${staffMember.email}</div>
                </div>
                <div class="assigned-rooms-count">
                    ${assignedRooms.length} ${assignedRooms.length === 1 ? 'room' : 'rooms'}
                </div>
            </div>
            <div class="staff-body">
                <div class="staff-detail">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${staffMember.phone || 'Not provided'}</span>
                </div>
                <div class="staff-actions">
                    <button class="action-btn view-btn" data-staff-id="${staffMember.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        `;
        
        staffGrid.appendChild(staffCard);
    });
    
    // Add event listeners to view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        if (btn.dataset.staffId) {
            btn.addEventListener('click', function() {
                const staffId = parseInt(this.dataset.staffId);
                openStaffModal(staffId);
            });
        }
    });
    
    // Update pagination
    updateStaffPagination(staff.length);
}

function updateStaffPagination(totalStaff) {
    const totalPages = Math.ceil(totalStaff / itemsPerPage);
    document.getElementById('staff-page-info').textContent = `Page ${currentStaffPage} of ${totalPages}`;
    
    // Disable/enable pagination buttons if you add them
}

// Modal Functions
function openAddRoomModal() {
    document.getElementById('add-room-modal').style.display = 'flex';
    document.getElementById('room-number').focus();
}

function openAddStaffModal() {
    document.getElementById('add-staff-modal').style.display = 'flex';
    document.getElementById('staff-name').focus();
}

function openRoomModal(roomId) {
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    const staff = JSON.parse(localStorage.getItem('housekeepingStaff')) || [];
    
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const assignedStaff = staff.find(s => s.id === room.assignedStaffId);
    const lastCleaned = room.lastCleaned ? new Date(room.lastCleaned) : null;
    const isToday = lastCleaned && new Date().toDateString() === lastCleaned.toDateString();
    
    // Populate modal
    document.getElementById('modal-room-number').textContent = `Room ${room.number}`;
    document.getElementById('modal-status').textContent = getStatusDisplayName(room.status);
    document.getElementById('modal-type').textContent = room.type.charAt(0).toUpperCase() + room.type.slice(1);
    document.getElementById('modal-last-cleaned').textContent = lastCleaned ? 
        `${isToday ? 'Today' : 'Yesterday'}, ${lastCleaned.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 
        'Not cleaned yet';
    document.getElementById('modal-notes').textContent = room.notes || 'No special requests';
    document.getElementById('new-note').value = room.notes || '';
    
    // Populate staff assignment dropdown
    const staffSelect = document.getElementById('assign-staff');
    staffSelect.innerHTML = '<option value="">Unassigned</option>';
    
    staff.forEach(staffMember => {
        const option = document.createElement('option');
        option.value = staffMember.id;
        option.textContent = staffMember.name;
        option.selected = staffMember.id === room.assignedStaffId;
        staffSelect.appendChild(option);
    });
    
    // Store current room ID in modal for later reference
    document.getElementById('room-detail-modal').dataset.currentRoom = roomId;
    
    // Show modal
    document.getElementById('room-detail-modal').style.display = 'flex';
}

function openStaffModal(staffId) {
    const staff = JSON.parse(localStorage.getItem('housekeepingStaff')) || [];
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return;
    
    const assignedRooms = rooms.filter(room => room.assignedStaffId === staffId);
    const availableRooms = rooms.filter(room => !room.assignedStaffId || room.assignedStaffId === staffId);
    
    // Populate modal
    document.getElementById('modal-staff-name').textContent = staffMember.name;
    document.getElementById('modal-staff-email').textContent = staffMember.email;
    document.getElementById('modal-staff-phone').textContent = staffMember.phone || 'Not provided';
    
    // Populate assigned rooms
    const assignedRoomsContainer = document.getElementById('assigned-rooms');
    assignedRoomsContainer.innerHTML = '';
    
    if (assignedRooms.length === 0) {
        assignedRoomsContainer.innerHTML = '<div class="no-rooms">No rooms assigned</div>';
    } else {
        assignedRooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = 'assigned-room';
            roomElement.innerHTML = `
                <div class="assigned-room-info">
                    <span class="assigned-room-number">Room ${room.number}</span>
                    <span class="assigned-room-status status-${room.status.replace('-', '')}">
                        ${getStatusDisplayName(room.status)}
                    </span>
                </div>
                <button class="remove-room-btn" data-room-id="${room.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            assignedRoomsContainer.appendChild(roomElement);
        });
    }
    
    // Populate room assignment dropdown
    const roomSelect = document.getElementById('room-to-assign');
    roomSelect.innerHTML = '<option value="">Select room to assign</option>';
    
    availableRooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = `Room ${room.number} (${room.type.charAt(0).toUpperCase() + room.type.slice(1)})`;
        roomSelect.appendChild(option);
    });
    
    // Store current staff ID in modal for later reference
    document.getElementById('staff-detail-modal').dataset.currentStaff = staffId;
    
    // Add event listeners to remove room buttons
    document.querySelectorAll('.remove-room-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const roomId = parseInt(this.dataset.roomId);
            unassignRoomFromStaff(roomId);
        });
    });
    
    // Show modal
    document.getElementById('staff-detail-modal').style.display = 'flex';
}

function closeModal() {
    document.querySelectorAll('.hk-modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Data Management Functions
function saveRoom(e) {
    e.preventDefault();
    
    const roomId = document.getElementById('room-id').value || Date.now();
    const roomNumber = document.getElementById('room-number').value;
    const roomType = document.getElementById('room-type').value;
    const initialStatus = document.getElementById('initial-status').value;
    const roomNotes = document.getElementById('room-notes').value;
    
    if (!roomNumber) {
        alert('Please enter a room number');
        return;
    }
    
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    
    // Check if room number already exists (for new rooms)
    if (!document.getElementById('room-id').value && rooms.some(r => r.number === roomNumber)) {
        alert('Room number already exists');
        return;
    }
    
    const roomData = {
        id: parseInt(roomId),
        number: roomNumber,
        type: roomType,
        status: initialStatus,
        notes: roomNotes,
        assignedStaffId: null,
        lastCleaned: initialStatus === 'clean' ? new Date().toISOString() : null
    };
    
    if (document.getElementById('room-id').value) {
        // Update existing room
        const index = rooms.findIndex(r => r.id === parseInt(roomId));
        if (index !== -1) {
            rooms[index] = {
                ...rooms[index],
                ...roomData
            };
        }
    } else {
        // Add new room
        rooms.push(roomData);
    }
    
    localStorage.setItem('hotelRooms', JSON.stringify(rooms));
    closeModal();
    refreshData();
}

function saveStaff(e) {
    e.preventDefault();
    
    const staffId = document.getElementById('staff-id').value || Date.now();
    const staffName = document.getElementById('staff-name').value;
    const staffEmail = document.getElementById('staff-email').value;
    const staffPhone = document.getElementById('staff-phone').value;
    
    if (!staffName || !staffEmail) {
        alert('Please enter name and email');
        return;
    }
    
    const staff = JSON.parse(localStorage.getItem('housekeepingStaff')) || [];
    
    // Check if email already exists (for new staff)
    if (!document.getElementById('staff-id').value && staff.some(s => s.email === staffEmail)) {
        alert('Staff with this email already exists');
        return;
    }
    
    const staffData = {
        id: parseInt(staffId),
        name: staffName,
        email: staffEmail,
        phone: staffPhone
    };
    
    if (document.getElementById('staff-id').value) {
        // Update existing staff
        const index = staff.findIndex(s => s.id === parseInt(staffId));
        if (index !== -1) {
            staff[index] = {
                ...staff[index],
                ...staffData
            };
        }
    } else {
        // Add new staff
        staff.push(staffData);
    }
    
    localStorage.setItem('housekeepingStaff', JSON.stringify(staff));
    closeModal();
    refreshData();
}

function saveNote() {
    const roomId = parseInt(document.getElementById('room-detail-modal').dataset.currentRoom);
    const note = document.getElementById('new-note').value.trim();
    
    if (!roomId) return;
    
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) return;
    
    // Update room notes
    rooms[roomIndex].notes = note;
    
    // Save back to localStorage
    localStorage.setItem('hotelRooms', JSON.stringify(rooms));
    
    // Refresh display
    refreshData();
    closeModal();
}

function updateRoomStatus(newStatus) {
    const roomId = parseInt(document.getElementById('room-detail-modal').dataset.currentRoom);
    
    if (!roomId) return;
    
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) return;
    
    // Only update if status is changing
    if (rooms[roomIndex].status !== newStatus) {
        rooms[roomIndex].status = newStatus;
        
        // Update last cleaned time if marking as clean
        if (newStatus === 'clean') {
            rooms[roomIndex].lastCleaned = new Date().toISOString();
        }
        
        // Save back to localStorage
        localStorage.setItem('hotelRooms', JSON.stringify(rooms));
        
        // Refresh display
        refreshData();
        closeModal();
    }
}

function assignStaffToRoom() {
    const roomId = parseInt(document.getElementById('room-detail-modal').dataset.currentRoom);
    const staffId = parseInt(document.getElementById('assign-staff').value) || null;
    
    if (!roomId) return;
    
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) return;
    
    // Update room assignment
    rooms[roomIndex].assignedStaffId = staffId;
    
    // Save back to localStorage
    localStorage.setItem('hotelRooms', JSON.stringify(rooms));
    
    // Refresh display
    refreshData();
}

function assignRoomToStaff() {
    const staffId = parseInt(document.getElementById('staff-detail-modal').dataset.currentStaff);
    const roomId = parseInt(document.getElementById('room-to-assign').value);
    
    if (!staffId || !roomId) return;
    
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) return;
    
    // Update room assignment
    rooms[roomIndex].assignedStaffId = staffId;
    
    // Save back to localStorage
    localStorage.setItem('housekeepingRooms', JSON.stringify(rooms));
    
    // Refresh display
    openStaffModal(staffId); // Reopen modal to show updated assignments
}

function unassignRoomFromStaff(roomId) {
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) return;
    
    // Remove assignment
    rooms[roomIndex].assignedStaffId = null;
    
    // Save back to localStorage
    localStorage.setItem('hotelRooms', JSON.stringify(rooms));
    
    // Refresh display
    const staffId = parseInt(document.getElementById('staff-detail-modal').dataset.currentStaff);
    openStaffModal(staffId); // Reopen modal to show updated assignments
}

function removeStaffMember() {
    const staffId = parseInt(document.getElementById('staff-detail-modal').dataset.currentStaff);
    
    if (!staffId) return;
    
    if (!confirm('Are you sure you want to remove this staff member?')) {
        return;
    }
    
    const staff = JSON.parse(localStorage.getItem('housekeepingStaff')) || [];
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    
    // Remove staff member
    const updatedStaff = staff.filter(s => s.id !== staffId);
    
    // Unassign any rooms assigned to this staff
    const updatedRooms = rooms.map(room => {
        if (room.assignedStaffId === staffId) {
            return { ...room, assignedStaffId: null };
        }
        return room;
    });
    
    // Save to localStorage
    localStorage.setItem('housekeepingStaff', JSON.stringify(updatedStaff));
    localStorage.setItem('hotelRooms', JSON.stringify(updatedRooms));
    
    // Refresh display
    renderStaffView();
    closeModal();
}

function exportReport() {
    const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
    const staff = JSON.parse(localStorage.getItem('housekeepingStaff')) || [];
    
    // Create a simple report (in a real app, this would generate a file)
    const report = {
        generatedAt: new Date().toISOString(),
        totalRooms: rooms.length,
        roomsNeedingCleaning: rooms.filter(r => r.status === 'dirty').length,
        roomsInMaintenance: rooms.filter(r => r.status === 'maintenance').length,
        staffMembers: staff.length,
        unassignedRooms: rooms.filter(r => !r.assignedStaffId).length
    };
    
    console.log("Housekeeping Report", report);
    alert(`Housekeeping report generated with:
    - Total rooms: ${report.totalRooms}
    - Rooms needing cleaning: ${report.roomsNeedingCleaning}
    - Rooms in maintenance: ${report.roomsInMaintenance}
    - Staff members: ${report.staffMembers}
    - Unassigned rooms: ${report.unassignedRooms}
    
In a real application, this would generate a downloadable file.`);
}

// Helper Functions
function getStatusDisplayName(status) {
    const statusMap = {
        'clean': 'Clean',
        'dirty': 'Needs Cleaning',
        'in-progress': 'In Progress',
        'maintenance': 'Maintenance'
    };
    return statusMap[status] || status;
}