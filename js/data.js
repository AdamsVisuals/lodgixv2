// Data Storage
class DataStore {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('lodgix_users')) || [
            { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'System Admin' }
        ];
        
        this.rooms = JSON.parse(localStorage.getItem('lodgix_rooms')) || [
            { id: 101, type: 'Deluxe', capacity: 2, price: 150, status: 'available', amenities: ['TV', 'AC', 'WiFi'] },
            { id: 102, type: 'Standard', capacity: 2, price: 100, status: 'available', amenities: ['TV', 'WiFi'] },
            { id: 201, type: 'Suite', capacity: 4, price: 250, status: 'available', amenities: ['TV', 'AC', 'WiFi', 'Minibar'] }
        ];
        
        this.guests = JSON.parse(localStorage.getItem('lodgix_guests')) || [
            { id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890', address: '123 Main St' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '9876543210', address: '456 Oak Ave' }
        ];
        
        this.bookings = JSON.parse(localStorage.getItem('lodgix_bookings')) || [
            { id: 1, guestId: 1, roomId: 101, checkIn: '2023-06-15', checkOut: '2023-06-20', status: 'confirmed', total: 750 }
        ];
        
        this.staff = JSON.parse(localStorage.getItem('lodgix_staff')) || [
            { id: 1, name: 'Robert Johnson', position: 'Manager', email: 'manager@lodgix.com', phone: '5551234567', salary: 5000 },
            { id: 2, name: 'Sarah Williams', position: 'Receptionist', email: 'reception@lodgix.com', phone: '5557654321', salary: 3000 }
        ];
        
        this.settings = JSON.parse(localStorage.getItem('lodgix_settings')) || {
            darkMode: false,
            currency: '$',
            taxRate: 10
        };
    }

    // Save data to localStorage
    save() {
        localStorage.setItem('lodgix_users', JSON.stringify(this.users));
        localStorage.setItem('lodgix_rooms', JSON.stringify(this.rooms));
        localStorage.setItem('lodgix_guests', JSON.stringify(this.guests));
        localStorage.setItem('lodgix_bookings', JSON.stringify(this.bookings));
        localStorage.setItem('lodgix_staff', JSON.stringify(this.staff));
        localStorage.setItem('lodgix_settings', JSON.stringify(this.settings));
    }

    // CRUD operations for rooms
    addRoom(room) {
        room.id = this.rooms.length > 0 ? Math.max(...this.rooms.map(r => r.id)) + 1 : 1;
        this.rooms.push(room);
        this.save();
        return room;
    }

    updateRoom(id, updatedRoom) {
        const index = this.rooms.findIndex(r => r.id === id);
        if (index !== -1) {
            this.rooms[index] = { ...this.rooms[index], ...updatedRoom };
            this.save();
            return this.rooms[index];
        }
        return null;
    }

    deleteRoom(id) {
        this.rooms = this.rooms.filter(room => room.id !== id);
        this.save();
    }

    // Similar CRUD operations for other entities (guests, bookings, staff)
    // ... (implement similar methods for guests, bookings, staff)
}

// Initialize data store
const dataStore = new DataStore();