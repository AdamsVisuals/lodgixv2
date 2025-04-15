document.addEventListener('DOMContentLoaded', function() {
    // Initialize analytics when page loads
    initAnalytics();

    // Time period change handler
    document.getElementById('time-period').addEventListener('change', function() {
        initAnalytics();
    });

    function initAnalytics() {
        // Get data from localStorage or your data.js
        const rooms = JSON.parse(localStorage.getItem('hotelRooms')) || [];
        const bookings = JSON.parse(localStorage.getItem('hotelBookings')) || [];
        
        // Calculate metrics
        calculateMetrics(rooms, bookings);
        
        // Render charts
        renderRevenueChart(bookings);
        renderRoomTypeChart(rooms, bookings);
        renderOccupancyCalendar(bookings);
    }

    function calculateMetrics(rooms, bookings) {
        // Sample calculations - replace with your actual logic
        const totalRooms = rooms.length;
        const occupiedRooms = bookings.reduce((acc, booking) => acc + (booking.room_ids?.length || 1), 0);
        const totalRevenue = bookings.reduce((acc, booking) => acc + (booking.total_amount || 0), 0);
        
        // Update UI
        document.getElementById('occupancy-rate').textContent = 
            totalRooms > 0 ? `${Math.round((occupiedRooms / totalRooms) * 100)}%` : '0%';
        document.getElementById('total-revenue').textContent = 
            `$${totalRevenue.toLocaleString()}`;
        document.getElementById('avg-daily-rate').textContent = 
            occupiedRooms > 0 ? `$${Math.round(totalRevenue / occupiedRooms)}` : '$0';
    }

    function renderRevenueChart(bookings) {
        const ctx = document.getElementById('revenueChart').getContext('2d');
        
        // Group bookings by date (simplified example)
        const revenueData = {};
        bookings.forEach(booking => {
            const date = new Date(booking.booking_date).toLocaleDateString();
            revenueData[date] = (revenueData[date] || 0) + (booking.total_amount || 0);
        });
        
        // Destroy previous chart if exists
        if (window.revenueChart) {
            window.revenueChart.destroy();
        }
        
        window.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(revenueData),
                datasets: [{
                    label: 'Daily Revenue',
                    data: Object.values(revenueData),
                    borderColor: '#FFD700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '$' + context.raw.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false } },
                    y: {
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    function renderRoomTypeChart(rooms, bookings) {
        const ctx = document.getElementById('roomTypeChart').getContext('2d');
        
        // Calculate revenue by room type
        const revenueByType = {};
        rooms.forEach(room => {
            revenueByType[room.type] = 0;
        });
        
        bookings.forEach(booking => {
            booking.room_ids?.forEach(roomId => {
                const room = rooms.find(r => r.id === roomId);
                if (room) {
                    revenueByType[room.type] += booking.total_amount / (booking.room_ids.length || 1);
                }
            });
        });
        
        // Destroy previous chart if exists
        if (window.roomTypeChart) {
            window.roomTypeChart.destroy();
        }
        
        window.roomTypeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(revenueByType),
                datasets: [{
                    label: 'Revenue by Room Type',
                    data: Object.values(revenueByType),
                    backgroundColor: 'rgba(255, 215, 0, 0.7)',
                    borderColor: 'rgba(255, 215, 0, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '$' + context.raw.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    function renderOccupancyCalendar(bookings) {
        const calendarEl = document.getElementById('occupancy-calendar');
        calendarEl.innerHTML = '';
        
        // Create calendar header
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day-header';
            dayEl.textContent = day;
            calendarEl.appendChild(dayEl);
        });
        
        // Create calendar days
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        // Add empty days for the first week
        for (let i = 0; i < firstDay.getDay(); i++) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'calendar-day empty';
            calendarEl.appendChild(emptyEl);
        }
        
        // Add days of the month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(today.getFullYear(), today.getMonth(), day);
            const isOccupied = bookings.some(booking => {
                const checkIn = new Date(booking.check_in_date);
                const checkOut = new Date(booking.check_out_date);
                return date >= checkIn && date < checkOut;
            });
            
            const dayEl = document.createElement('div');
            dayEl.className = `calendar-day ${isOccupied ? 'occupied' : 'available'}`;
            dayEl.textContent = day;
            calendarEl.appendChild(dayEl);
        }
    }
});