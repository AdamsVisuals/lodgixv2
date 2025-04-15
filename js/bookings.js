document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const bookingTableBody = document.getElementById('booking-table-body');
    const bookingForm = document.getElementById('booking-form');
    const bookingModal = document.getElementById('booking-modal');
    const addBookingBtn = document.getElementById('add-booking-btn');
    const closeModal = document.querySelector('.close-modal');
    const cancelBookingBtn = document.getElementById('cancel-booking-btn');
    const bookingSearch = document.getElementById('booking-search');
    const bookingStatusFilter = document.getElementById('booking-status-filter');
    const roomTypeFilter = document.getElementById('room-type-filter');
    const bookingIdInput = document.getElementById('booking-id');

    // Booking state
    let bookings = JSON.parse(localStorage.getItem('lodgix-bookings')) || [];
    let guests = JSON.parse(localStorage.getItem('lodgix-guests')) || [];
    let rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];

    // Initialize the page
    initializeData();
    displayBookings();
    updateStats();

    // Event Listeners
    addBookingBtn.addEventListener('click', () => {
        bookingForm.reset();
        bookingIdInput.value = '';
        document.getElementById('booking-modal-title').textContent = 'New Booking';
        loadGuestDropdown();
        loadAvailableRooms();
        openBookingModal();
    });

    closeModal.addEventListener('click', closeBookingModal);
    cancelBookingBtn.addEventListener('click', closeBookingModal);

    window.addEventListener('click', e => {
        if (e.target === bookingModal) closeBookingModal();
    });

    bookingSearch.addEventListener('input', displayBookings);
    bookingStatusFilter.addEventListener('change', displayBookings);
    roomTypeFilter.addEventListener('change', displayBookings);

    bookingForm.addEventListener('submit', handleBookingSubmit);

    // Functions
    function initializeData() {
        if (!localStorage.getItem('lodgix-bookings')) {
            localStorage.setItem('lodgix-bookings', JSON.stringify([]));
        }
        if (!localStorage.getItem('lodgix-guests')) {
            localStorage.setItem('lodgix-guests', JSON.stringify([]));
        }
        if (!localStorage.getItem('hotelRooms')) {
            localStorage.setItem('hotelRooms', JSON.stringify([]));
        }
    }

    function displayBookings() {
        const searchTerm = bookingSearch.value.toLowerCase();
        const statusFilter = bookingStatusFilter.value;
        const typeFilter = roomTypeFilter.value;

        const filteredBookings = bookings.filter(booking => {
            // Find guest details
            const guest = guests.find(g => g.id === booking.guestId) || {};
            
            // Find room details
            const room = rooms.find(r => r.number === booking.roomNumber) || {};
            
            // Check search term
            const matchesSearch = 
                booking.id.toLowerCase().includes(searchTerm) ||
                guest.firstName?.toLowerCase().includes(searchTerm) ||
                guest.lastName?.toLowerCase().includes(searchTerm) ||
                booking.roomNumber?.toLowerCase().includes(searchTerm);
            
            // Check status filter
            const matchesStatus = 
                statusFilter === 'all' || 
                booking.status === statusFilter;
            
            // Check room type filter
            const matchesRoomType = 
                typeFilter === 'all' || 
                room.type === typeFilter;
            
            return matchesSearch && matchesStatus && matchesRoomType;
        });

        bookingTableBody.innerHTML = filteredBookings.length
            ? ''
            : '<tr><td colspan="7" class="no-bookings">No bookings found matching your criteria</td></tr>';

        filteredBookings.forEach(booking => {
            const guest = guests.find(g => g.id === booking.guestId) || {};
            const room = rooms.find(r => r.number === booking.roomNumber) || {};
            
            const checkInDate = booking.checkInDate ? new Date(booking.checkInDate) : null;
            const checkOutDate = booking.checkOutDate ? new Date(booking.checkOutDate) : null;
            
            const formattedDates = `
                ${checkInDate ? checkInDate.toLocaleDateString() : 'N/A'} - 
                ${checkOutDate ? checkOutDate.toLocaleDateString() : 'N/A'}
            `;
            
            const statusClass = `status-${booking.status}`;
            const statusText = booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('-', ' ');

            const bookingRow = document.createElement('tr');
            bookingRow.innerHTML = `
                <td>${booking.id}</td>
                <td>${guest.firstName || ''} ${guest.lastName || ''}</td>
                <td>${room.number || 'N/A'} (${room.type || 'N/A'})</td>
                <td>${formattedDates}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>$${booking.amount?.toFixed(2) || '0.00'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-edit" data-id="${booking.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${booking.status === 'confirmed' ? `
                        <button class="btn-action btn-checkin" data-id="${booking.id}">
                            <i class="fas fa-sign-in-alt"></i>
                        </button>` : ''}
                        ${booking.status === 'checked-in' ? `
                        <button class="btn-action btn-checkout" data-id="${booking.id}">
                            <i class="fas fa-sign-out-alt"></i>
                        </button>` : ''}
                        <button class="btn-action btn-delete" data-id="${booking.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            bookingTableBody.appendChild(bookingRow);
        });

        attachBookingActionListeners();
    }

    function attachBookingActionListeners() {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', handleEditBooking);
        });

        document.querySelectorAll('.btn-checkin').forEach(btn => {
            btn.addEventListener('click', () => updateBookingStatus(btn.dataset.id, 'checked-in'));
        });

        document.querySelectorAll('.btn-checkout').forEach(btn => {
            btn.addEventListener('click', () => updateBookingStatus(btn.dataset.id, 'checked-out'));
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', handleDeleteBooking);
        });
    }

    function loadGuestDropdown() {
        const guestSelect = document.getElementById('booking-guest');
        guestSelect.innerHTML = '<option value="">Select Guest</option>';
        
        guests.forEach(guest => {
            const option = document.createElement('option');
            option.value = guest.id;
            option.textContent = `${guest.firstName} ${guest.lastName}`;
            guestSelect.appendChild(option);
        });
    }

    function loadAvailableRooms() {
        const roomSelect = document.getElementById('booking-room');
        roomSelect.innerHTML = '<option value="">Select Room</option>';
        
        // Get currently booked rooms (checked-in or confirmed)
        const bookedRooms = bookings
            .filter(booking => ['checked-in', 'confirmed'].includes(booking.status))
            .map(booking => booking.roomNumber);
        
        rooms.forEach(room => {
            if (!bookedRooms.includes(room.number)) {
                const option = document.createElement('option');
                option.value = room.number;
                option.textContent = `${room.number} (${room.type}) - $${room.price}/night`;
                option.dataset.price = room.price;
                roomSelect.appendChild(option);
            }
        });
        
        // Add event listeners for amount calculation
        roomSelect.addEventListener('change', calculateBookingAmount);
        document.getElementById('check-in-date').addEventListener('change', calculateBookingAmount);
        document.getElementById('check-out-date').addEventListener('change', calculateBookingAmount);
    }

    function calculateBookingAmount() {
        const roomSelect = document.getElementById('booking-room');
        const selectedOption = roomSelect.options[roomSelect.selectedIndex];
        const checkInDate = document.getElementById('check-in-date').value;
        const checkOutDate = document.getElementById('check-out-date').value;
        
        if (selectedOption?.dataset.price && checkInDate && checkOutDate) {
            const pricePerNight = parseFloat(selectedOption.dataset.price);
            const oneDay = 24 * 60 * 60 * 1000;
            const startDate = new Date(checkInDate);
            const endDate = new Date(checkOutDate);
            
            const diffDays = Math.round(Math.abs((startDate - endDate) / oneDay));
            const totalAmount = diffDays * pricePerNight;
            
            document.getElementById('booking-amount').value = totalAmount.toFixed(2);
        }
    }

    function handleBookingSubmit(e) {
        e.preventDefault();

        const bookingId = bookingIdInput.value;
        const bookingData = {
            id: bookingId || generateBookingId(),
            guestId: document.getElementById('booking-guest').value,
            roomNumber: document.getElementById('booking-room').value,
            checkInDate: document.getElementById('check-in-date').value,
            checkOutDate: document.getElementById('check-out-date').value,
            status: document.getElementById('booking-status').value,
            amount: parseFloat(document.getElementById('booking-amount').value),
            notes: document.getElementById('booking-notes').value,
            createdAt: new Date().toISOString()
        };

        // Validate required fields
        if (!bookingData.guestId || !bookingData.roomNumber || !bookingData.checkInDate || 
            !bookingData.checkOutDate || isNaN(bookingData.amount)) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        if (bookingId) {
            // Update existing booking
            const index = bookings.findIndex(b => b.id === bookingId);
            if (index !== -1) {
                bookings[index] = bookingData;
            }
        } else {
            // Add new booking
            bookings.push(bookingData);
        }

        // Update room status if needed
        updateRoomStatus(bookingData.roomNumber, bookingData.status);

        // Save and refresh
        saveBookings();
        closeBookingModal();
    }

    function handleEditBooking(e) {
        const bookingId = e.target.closest('button').dataset.id;
        const booking = bookings.find(b => b.id === bookingId);

        if (booking) {
            document.getElementById('booking-modal-title').textContent = 'Edit Booking';
            bookingIdInput.value = booking.id;
            document.getElementById('booking-guest').value = booking.guestId;
            document.getElementById('check-in-date').value = booking.checkInDate;
            document.getElementById('check-out-date').value = booking.checkOutDate;
            document.getElementById('booking-status').value = booking.status;
            document.getElementById('booking-amount').value = booking.amount;
            document.getElementById('booking-notes').value = booking.notes || '';
            
            // Load guests and rooms
            loadGuestDropdown();
            loadAvailableRooms();
            
            // Set the room (might need to add it if it's already booked)
            const roomSelect = document.getElementById('booking-room');
            const room = rooms.find(r => r.number === booking.roomNumber);
            
            if (room) {
                const optionExists = Array.from(roomSelect.options).some(opt => opt.value === room.number);
                
                if (!optionExists) {
                    const option = document.createElement('option');
                    option.value = room.number;
                    option.textContent = `${room.number} (${room.type}) - $${room.price}/night`;
                    option.dataset.price = room.price;
                    option.selected = true;
                    roomSelect.appendChild(option);
                } else {
                    roomSelect.value = room.number;
                }
            }
            
            openBookingModal();
        }
    }

    function updateBookingStatus(bookingId, newStatus) {
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex !== -1) {
            const oldStatus = bookings[bookingIndex].status;
            bookings[bookingIndex].status = newStatus;
            
            // Update room status if needed
            if (oldStatus !== newStatus) {
                updateRoomStatus(bookings[bookingIndex].roomNumber, newStatus);
            }
            
            saveBookings();
        }
    }

    function handleDeleteBooking(e) {
        const bookingId = e.target.closest('button').dataset.id;
        const booking = bookings.find(b => b.id === bookingId);

        if (booking && confirm('Are you sure you want to delete this booking?')) {
            // Update room status if booking was active
            if (['confirmed', 'checked-in'].includes(booking.status)) {
                updateRoomStatus(booking.roomNumber, 'cancelled');
            }
            
            // Remove booking
            bookings = bookings.filter(b => b.id !== bookingId);
            saveBookings();
        }
    }

    function updateRoomStatus(roomNumber, bookingStatus) {
        const roomIndex = rooms.findIndex(r => r.number === roomNumber);
        
        if (roomIndex !== -1) {
            if (bookingStatus === 'checked-in') {
                rooms[roomIndex].status = 'occupied';
            } else if (bookingStatus === 'checked-out' || bookingStatus === 'cancelled') {
                rooms[roomIndex].status = 'available';
            }
            
            localStorage.setItem('hotelRooms', JSON.stringify(rooms));
        }
    }

    function saveBookings() {
        localStorage.setItem('lodgix-bookings', JSON.stringify(bookings));
        displayBookings();
        updateStats();
    }

    function updateStats() {
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate stats
        const checkInsToday = bookings.filter(b => 
            b.checkInDate?.split('T')[0] === today && b.status === 'checked-in'
        ).length;
        
        const checkOutsToday = bookings.filter(b => 
            b.checkOutDate?.split('T')[0] === today && b.status === 'checked-out'
        ).length;
        
        const totalRooms = rooms.length;
        const occupiedRooms = bookings.filter(b => b.status === 'checked-in').length;
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
        
        const revenueToday = bookings
            .filter(b => {
                const checkInDate = b.checkInDate?.split('T')[0];
                const checkOutDate = b.checkOutDate?.split('T')[0];
                return (checkInDate === today || checkOutDate === today) && 
                       ['checked-in', 'checked-out'].includes(b.status);
            })
            .reduce((sum, b) => sum + (b.amount || 0), 0);
        
        // Update UI
        document.getElementById('checkins-today').textContent = checkInsToday;
        document.getElementById('checkouts-today').textContent = checkOutsToday;
        document.getElementById('occupancy-rate').textContent = `${occupancyRate}%`;
        document.getElementById('total-revenue').textContent = `$${revenueToday.toFixed(2)}`;
    }

    function openBookingModal() {
        bookingModal.classList.add('active');
    }

    function closeBookingModal() {
        bookingModal.classList.remove('active');
    }

    function generateBookingId() {
        return 'book-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
});