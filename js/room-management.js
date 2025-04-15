document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const roomsList = document.getElementById('rooms-list');
    const roomForm = document.getElementById('room-form');
    const roomModal = document.getElementById('room-modal');
    const addRoomBtn = document.getElementById('add-room-btn');
    const closeModal = document.querySelector('.close-modal');
    const cancelRoomBtn = document.getElementById('cancel-room');
    const roomSearch = document.getElementById('room-search');
    const roomFilter = document.getElementById('room-filter');
    const roomIdInput = document.getElementById('room-id');

    // Rooms state
    let rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];

    // Load rooms on page load
    displayRooms();

    // Event Listeners
    addRoomBtn.addEventListener('click', () => {
        roomForm.reset();
        roomIdInput.value = '';
        document.getElementById('room-modal-title').textContent = 'Add New Room';
        openRoomModal();
    });

    closeModal.addEventListener('click', closeRoomModal);
    cancelRoomBtn.addEventListener('click', closeRoomModal);

    window.addEventListener('click', e => {
        if (e.target === roomModal) closeRoomModal();
    });

    roomSearch.addEventListener('input', displayRooms);
    roomFilter.addEventListener('change', displayRooms);

    roomForm.addEventListener('submit', handleRoomSubmit);

    // Functions
    function displayRooms() {
        const searchTerm = roomSearch.value.toLowerCase();
        const filter = roomFilter.value;

        const filteredRooms = rooms.filter(room => {
            const matchSearch =
                room.number.toLowerCase().includes(searchTerm) ||
                room.type.toLowerCase().includes(searchTerm) ||
                (room.description && room.description.toLowerCase().includes(searchTerm));

            const matchFilter = filter === 'all' || room.status === filter;
            return matchSearch && matchFilter;
        });

        roomsList.innerHTML = filteredRooms.length
            ? ''
            : '<p class="no-rooms">No rooms found matching your criteria</p>';

        filteredRooms.forEach(room => {
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';

            const statusClass = `status-${room.status}`;
            const amenities = room.amenities ? room.amenities.join(', ') : 'None';

            roomCard.innerHTML = `
                <div class="room-card-header">
                    <h3 class="room-card-title">Room ${room.number}</h3>
                    <span class="room-card-status ${statusClass}">${room.status.charAt(0).toUpperCase() + room.status.slice(1)}</span>
                </div>
                <div class="room-card-body">
                    <p class="room-card-details">
                        <strong>Type:</strong> ${room.type}<br>
                        <strong>Floor:</strong> ${room.floor || 'N/A'}<br>
                        <strong>Price:</strong> $${room.price.toFixed(2)}/night<br>
                        <strong>Amenities:</strong> ${amenities}<br>
                        ${room.description ? `<strong>Description:</strong> ${room.description}` : ''}
                    </p>
                    <div class="room-card-actions">
                        <button class="btn-primary btn-edit" data-id="${room.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-primary btn-delete" data-id="${room.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;

            roomsList.appendChild(roomCard);
        });

        attachRoomActionListeners();
    }

    function attachRoomActionListeners() {
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', handleEditRoom);
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', handleDeleteRoom);
        });
    }

    function handleRoomSubmit(e) {
        e.preventDefault();

        const roomId = roomIdInput.value;
        const roomData = {
            number: document.getElementById('room-number').value.trim(),
            floor: document.getElementById('room-floor').value,
            type: document.getElementById('room-type').value,
            price: parseFloat(document.getElementById('room-price').value),
            status: document.getElementById('room-status').value,
            description: document.getElementById('room-description').value.trim(),
            amenities: Array.from(document.querySelectorAll('input[name="amenities"]:checked'))
                         .map(checkbox => checkbox.value)
        };

        // Validate required fields
        if (!roomData.number || !roomData.type || isNaN(roomData.price)) {
            alert('Please fill in all required fields correctly.');
            return;
        }

        if (roomId) {
            // Update existing room
            const index = rooms.findIndex(r => r.id === roomId);
            if (index !== -1) {
                rooms[index] = { ...rooms[index], ...roomData };
            }
        } else {
            // Add new room
            const newRoom = {
                id: Date.now().toString(),
                ...roomData
            };
            rooms.push(newRoom);
        }

        updateStorageAndDisplay();
        closeRoomModal();
    }

    function handleEditRoom(e) {
        const roomId = e.target.closest('button').dataset.id;
        const room = rooms.find(r => r.id === roomId);

        if (room) {
            document.getElementById('room-modal-title').textContent = 'Edit Room';
            roomIdInput.value = room.id;
            document.getElementById('room-number').value = room.number;
            document.getElementById('room-floor').value = room.floor || '1';
            document.getElementById('room-type').value = room.type;
            document.getElementById('room-price').value = room.price;
            document.getElementById('room-status').value = room.status;
            document.getElementById('room-description').value = room.description || '';

            // Set amenities checkboxes
            const checkboxes = document.querySelectorAll('input[name="amenities"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = room.amenities && room.amenities.includes(checkbox.value);
            });

            openRoomModal();
        }
    }

    function handleDeleteRoom(e) {
        const roomId = e.target.closest('button').dataset.id;

        if (confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
            rooms = rooms.filter(room => room.id !== roomId);
            updateStorageAndDisplay();
        }
    }

    function updateStorageAndDisplay() {
        localStorage.setItem('hotelRooms', JSON.stringify(rooms));
        displayRooms();
    }

    function openRoomModal() {
        roomModal.classList.add('active');
    }

    function closeRoomModal() {
        roomModal.classList.remove('active');
    }
});