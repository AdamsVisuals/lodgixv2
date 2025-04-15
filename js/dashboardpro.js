document.addEventListener('DOMContentLoaded', function() {
    // Initialize sidebar toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    
    mobileMenuBtn.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    // Initialize dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-switch');
    const body = document.body;
    
    // Check for saved user preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
    
    darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    // Initialize charts
    initRevenueChart();
    initRoomTypeChart();
    animateGauge(67); // Initial occupancy percentage

    // Simulate real-time data updates
    setInterval(updateDashboardData, 30000);
});

function initRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    
    // Sample data - replace with real API data
    const labels = [];
    const revenueData = [];
    const now = new Date();
    
    for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        revenueData.push(Math.floor(Math.random() * 5000) + 2000);
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue',
                data: revenueData,
                borderColor: 'rgba(255, 215, 0, 0.8)',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 5
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
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(30, 30, 40, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return ' $' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 7
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)',
                        callback: function(value) {
                            return '$' + (value / 1000) + 'k';
                        }
                    }
                }
            }
        }
    });
}

function initRoomTypeChart() {
    const ctx = document.getElementById('roomTypeChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Deluxe', 'Standard', 'Suite', 'Executive'],
            datasets: [{
                data: [35, 25, 20, 20],
                backgroundColor: [
                    'rgba(255, 215, 0, 0.8)',
                    'rgba(74, 144, 226, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(46, 204, 113, 0.8)'
                ],
                borderColor: 'var(--card-bg)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

function animateGauge(percentage) {
    const gaugeFill = document.querySelector('.gauge-fill');
    const rotation = 0.33 * (percentage / 100);
    gaugeFill.style.transform = `rotate(${rotation}turn)`;
    document.querySelector('.gauge-cover').textContent = `${percentage}%`;
}

function updateDashboardData() {
    // Simulate data updates - replace with real API calls
    const newOccupancy = Math.floor(Math.random() * 30) + 60; // Random between 60-90%
    animateGauge(newOccupancy);
    
    // Update quick stats
    document.getElementById('occupied-rooms').textContent = Math.floor(42 * (newOccupancy / 100));
    document.getElementById('today-revenue').textContent = '$' + (Math.floor(Math.random() * 3000) + 4000).toLocaleString();
    document.getElementById('new-guests').textContent = Math.floor(Math.random() * 10) + 5;
    
    console.log('Dashboard data updated');
}

// Add click handlers for booking items
document.querySelectorAll('.booking-item').forEach(item => {
    item.addEventListener('click', function() {
        const roomNumber = this.querySelector('.booking-room').textContent.split('#')[1];
        console.log(`Viewing details for room ${roomNumber}`);
        // Implement modal or page navigation here
    });
});

// Task completion toggles
document.querySelectorAll('.task-check input').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const taskTitle = this.closest('.task-item').querySelector('.task-title');
        if (this.checked) {
            taskTitle.classList.add('completed');
        } else {
            taskTitle.classList.remove('completed');
        }
    });
});

// Room Management Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Sample room data
    const rooms = [
        {
            id: 1,
            number: '101',
            type: 'standard',
            floor: 1,
            capacity: 2,
            price: 120,
            status: 'available',
            amenities: ['wifi', 'tv'],
            image: 'https://via.placeholder.com/400x200?text=Standard+Room'
        },
        {
            id: 2,
            number: '205',
            type: 'deluxe',
            floor: 2,
            capacity: 2,
            price: 200,
            status: 'occupied',
            amenities: ['wifi', 'tv', 'ac', 'minibar'],
            image: 'https://via.placeholder.com/400x200?text=Deluxe+Room'
        },
        {
            id: 3,
            number: '301',
            type: 'suite',
            floor: 3,
            capacity: 4,
            price: 350,
            status: 'available',
            amenities: ['wifi', 'tv', 'ac', 'minibar', 'safe'],
            image: 'https://via.placeholder.com/400x200?text=Suite+Room'
        },
        {
            id: 4,
            number: '102',
            type: 'standard',
            floor: 1,
            capacity: 2,
            price: 120,
            status: 'cleaning',
            amenities: ['wifi', 'tv'],
            image: 'https://via.placeholder.com/400x200?text=Standard+Room'
        },
        {
            id: 5,
            number: '208',
            type: 'deluxe',
            floor: 2,
            capacity: 2,
            price: 200,
            status: 'maintenance',
            amenities: ['wifi', 'tv', 'ac', 'minibar'],
            image: 'https://via.placeholder.com/400x200?text=Deluxe+Room'
        },
        {
            id: 6,
            number: '401',
            type: 'family',
            floor: 4,
            capacity: 6,
            price: 280,
            status: 'available',
            amenities: ['wifi', 'tv', 'ac'],
            image: 'https://via.placeholder.com/400x200?text=Family+Room'
        }
    ];

    // DOM Elements
    const roomGrid = document.querySelector('.room-management-grid');
    const addRoomBtn = document.getElementById('add-room-btn');
    const roomModal = document.getElementById('room-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelRoomBtn = document.getElementById('cancel-room-btn');
    const roomForm = document.getElementById('room-form');
    const roomSearch = document.getElementById('room-search');
    const roomTypeFilter = document.getElementById('room-type-filter');
    const roomStatusFilter = document.getElementById('room-status-filter');
    const resetFiltersBtn = document.getElementById('reset-filters-btn');

    // Current active room (for editing)
    let currentActiveRoom = null;

    // Render rooms
    function renderRooms(roomsToRender) {
        roomGrid.innerHTML = '';
        
        if (roomsToRender.length === 0) {
            roomGrid.innerHTML = '<div class="no-rooms">No rooms found matching your criteria</div>';
            return;
        }
        
        roomsToRender.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            
            const amenitiesHTML = room.amenities.map(amenity => `
                <span class="amenity-tag">
                    <i class="fas fa-${getAmenityIcon(amenity)}"></i>
                    ${amenity}
                </span>
            `).join('');
            
            roomCard.innerHTML = `
                <div class="room-card-header" style="background-image: url('${room.image}')">
                    <span class="room-status ${room.status}">${capitalizeFirstLetter(room.status)}</span>
                </div>
                <div class="room-card-body">
                    <h3 class="room-card-title">Room ${room.number}</h3>
                    <div class="room-card-meta">
                        <span class="room-card-type">${capitalizeFirstLetter(room.type)}</span>
                        <span class="room-card-price">$${room.price}/night</span>
                    </div>
                    <div class="room-card-details">
                        <div><i class="fas fa-layer-group"></i> Floor: ${room.floor}</div>
                        <div><i class="fas fa-user-friends"></i> Capacity: ${room.capacity}</div>
                    </div>
                    <div class="room-card-amenities">
                        ${amenitiesHTML}
                    </div>
                    <div class="room-card-actions">
                        <button class="btn btn-sm btn-primary edit-room" data-id="${room.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-room" data-id="${room.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            
            roomGrid.appendChild(roomCard);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-room').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roomId = parseInt(e.currentTarget.getAttribute('data-id'));
                editRoom(roomId);
            });
        });
        
        document.querySelectorAll('.delete-room').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roomId = parseInt(e.currentTarget.getAttribute('data-id'));
                deleteRoom(roomId);
            });
        });
    }

    // Helper functions
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getAmenityIcon(amenity) {
        const icons = {
            wifi: 'wifi',
            tv: 'tv',
            ac: 'snowflake',
            minibar: 'wine-bottle',
            safe: 'lock'
        };
        return icons[amenity] || 'check';
    }

    // Filter rooms
    function filterRooms() {
        const searchTerm = roomSearch.value.toLowerCase();
        const typeFilter = roomTypeFilter.value;
        const statusFilter = roomStatusFilter.value;
        
        const filteredRooms = rooms.filter(room => {
            const matchesSearch = room.number.toLowerCase().includes(searchTerm) || 
                                room.type.toLowerCase().includes(searchTerm);
            const matchesType = typeFilter === 'all' || room.type === typeFilter;
            const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
            
            return matchesSearch && matchesType && matchesStatus;
        });
        
        renderRooms(filteredRooms);
    }

    // Open modal for adding new room
    function openAddRoomModal() {
        currentActiveRoom = null;
        document.getElementById('modal-title').textContent = 'Add New Room';
        document.getElementById('room-form').reset();
        document.getElementById('room-id').value = '';
        roomModal.style.display = 'flex';
    }

    // Open modal for editing room
    function editRoom(roomId) {
        currentActiveRoom = rooms.find(room => room.id === roomId);
        if (!currentActiveRoom) return;
        
        document.getElementById('modal-title').textContent = 'Edit Room';
        document.getElementById('room-id').value = currentActiveRoom.id;
        document.getElementById('room-number').value = currentActiveRoom.number;
        document.getElementById('room-type').value = currentActiveRoom.type;
        document.getElementById('room-floor').value = currentActiveRoom.floor;
        document.getElementById('room-capacity').value = currentActiveRoom.capacity;
        document.getElementById('room-price').value = currentActiveRoom.price;
        document.getElementById('room-status').value = currentActiveRoom.status;
        
        // Clear all checkboxes first
        document.querySelectorAll('input[name="amenities"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Check the amenities this room has
        currentActiveRoom.amenities.forEach(amenity => {
            const checkbox = document.querySelector(`input[name="amenities"][value="${amenity}"]`);
            if (checkbox) checkbox.checked = true;
        });
        
        roomModal.style.display = 'flex';
    }

    // Delete room
    function deleteRoom(roomId) {
        if (confirm('Are you sure you want to delete this room?')) {
            const index = rooms.findIndex(room => room.id === roomId);
            if (index !== -1) {
                rooms.splice(index, 1);
                filterRooms();
                alert('Room deleted successfully');
            }
        }
    }

    // Save room (add new or update existing)
    function saveRoom(e) {
        e.preventDefault();
        
        const id = currentActiveRoom ? currentActiveRoom.id : Date.now();
        const number = document.getElementById('room-number').value;
        const type = document.getElementById('room-type').value;
        const floor = parseInt(document.getElementById('room-floor').value);
        const capacity = parseInt(document.getElementById('room-capacity').value);
        const price = parseFloat(document.getElementById('room-price').value);
        const status = document.getElementById('room-status').value;
        
        const amenities = [];
        document.querySelectorAll('input[name="amenities"]:checked').forEach(checkbox => {
            amenities.push(checkbox.value);
        });
        
        const roomData = {
            id,
            number,
            type,
            floor,
            capacity,
            price,
            status,
            amenities,
            image: getDefaultImageForType(type)
        };
        
        if (currentActiveRoom) {
            // Update existing room
            const index = rooms.findIndex(room => room.id === currentActiveRoom.id);
            if (index !== -1) {
                rooms[index] = roomData;
            }
        } else {
            // Add new room
            rooms.push(roomData);
        }
        
        closeModal();
        filterRooms();
    }

    function getDefaultImageForType(type) {
        const images = {
            standard: 'https://via.placeholder.com/400x200?text=Standard+Room',
            deluxe: 'https://via.placeholder.com/400x200?text=Deluxe+Room',
            suite: 'https://via.placeholder.com/400x200?text=Suite+Room',
            family: 'https://via.placeholder.com/400x200?text=Family+Room'
        };
        return images[type] || 'https://via.placeholder.com/400x200?text=Room';
    }

    // Close modal
    function closeModal() {
        roomModal.style.display = 'none';
    }

    // Initialize room management
    function initRoomManagement() {
        renderRooms(rooms);
        
        // Event listeners
        addRoomBtn.addEventListener('click', openAddRoomModal);
        closeModalBtn.addEventListener('click', closeModal);
        cancelRoomBtn.addEventListener('click', closeModal);
        roomForm.addEventListener('submit', saveRoom);
        
        roomSearch.addEventListener('input', filterRooms);
        roomTypeFilter.addEventListener('change', filterRooms);
        roomStatusFilter.addEventListener('change', filterRooms);
        resetFiltersBtn.addEventListener('click', () => {
            roomSearch.value = '';
            roomTypeFilter.value = 'all';
            roomStatusFilter.value = 'all';
            filterRooms();
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === roomModal) {
                closeModal();
            }
        });
    }

    // Tab switching functionality
    function setupTabSwitching() {
        const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(navLink => {
                    navLink.classList.remove('active');
                });
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Hide all content sections
                document.querySelectorAll('.content-section').forEach(section => {
                    section.style.display = 'none';
                });
                
                // Show the selected section
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(`${targetId}-section`);
                if (targetSection) {
                    targetSection.style.display = 'block';
                    
                    // Initialize room management if this is the rooms section
                    if (targetId === 'rooms') {
                        initRoomManagement();
                    }
                }
                
                // Update page title
                const pageTitle = document.getElementById('page-title');
                const linkText = this.querySelector('span').textContent;
                if (pageTitle && linkText) {
                    pageTitle.textContent = linkText;
                }
                
                // Close sidebar on mobile
                if (window.innerWidth <= 992) {
                    document.querySelector('.sidebar').classList.remove('active');
                }
            });
        });
        
        // Initialize the dashboard by default
        const dashboardLink = document.querySelector('.nav-link.active');
        if (dashboardLink) {
            dashboardLink.click();
        }
    }

    // Initialize everything
    setupTabSwitching();
});