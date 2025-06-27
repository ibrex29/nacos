document.addEventListener('DOMContentLoaded', function() {
    // Initialize events functionality
    initializeEvents();
    
    // Setup event filtering
    setupEventFiltering();
});

function initializeEvents() {
    fetchAllEvents();
}

function setupEventFiltering() {
    // Program filtering
    $('.program-filter .btn').click(function() {
        $('.program-filter .btn').removeClass('active');
        $(this).addClass('active');

        var filter = $(this).data('filter');

        if (filter == 'all') {
            $('[data-category]').parent().show();
        } else {
            $('[data-category]').parent().hide();
            $('[data-category="' + filter + '"]').parent().show();
        }
    });
}

// Function to create event card HTML
function createEventCard(event) {
    return `
        <div class="col-lg-6" data-category="${event.category}">
            <div class="event-item">
                <img src="${event.imageUrl || 'img/event-1.jpg'}" alt="${event.title}">
                <div class="event-content">
                    <div class="event-meta">
                        <p><i class="fa fa-calendar-alt"></i>${FirebaseUtils.formatDate(event.date)}</p>
                        <p><i class="far fa-clock"></i>${event.time || 'TBD'}</p>
                        <p><i class="fa fa-map-marker-alt"></i>${event.location || 'TBD'}</p>
                    </div>
                    <div class="event-text">
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                        <a class="btn btn-custom" href="${event.buttonLink || '#'}">${event.buttonText || 'Learn More'}</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to display "No events" message
function displayNoEvents() {
    const eventsContainer = document.getElementById('events-container');
    if (eventsContainer) {
        eventsContainer.innerHTML = `
            <div class="col-12">
                <div class="no-events">
                    <p>No events found. Check back soon!</p>
                </div>
            </div>
        `;
    }
}

// Function to fetch all events
async function fetchAllEvents() {
    const eventsContainer = document.getElementById('events-container');
    
    if (!eventsContainer) {
        console.error('Events container not found');
        return;
    }

    try {
        // Show loading
        eventsContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="loading">
                    <i class="fas fa-spinner fa-spin"></i> Loading events...
                </div>
            </div>
        `;

        const result = await FirebaseUtils.getCollection('events');

        if (result.success) {
            // Clear loading
            eventsContainer.innerHTML = '';

            if (result.data.length === 0) {
                displayNoEvents();
                return;
            }

            // Create HTML for each event
            result.data.forEach(event => {
                eventsContainer.innerHTML += createEventCard(event);
            });

            // Apply active filter if any
            const activeFilter = document.querySelector('.program-filter .btn.active');
            if (activeFilter && activeFilter.dataset.filter !== 'all') {
                $('[data-category]').parent().hide();
                $('[data-category="' + activeFilter.dataset.filter + '"]').parent().show();
            }

        } else {
            throw new Error(result.error);
        }

    } catch (error) {
        console.error("Error fetching events:", error);
        eventsContainer.innerHTML = `
            <div class="col-12">
                <div class="no-events">
                    <p>Error loading events. Please try again later.</p>
                </div>
            </div>
        `;
    }
}

// Function to add a new event (for admin use)
async function addEvent(eventData) {
    try {
        const result = await FirebaseUtils.addDocument('events', eventData);
        
        if (result.success) {
            FirebaseUtils.showSuccess('Event added successfully!');
            fetchAllEvents(); // Refresh the events list
            return result;
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        console.error('Error adding event:', error);
        FirebaseUtils.showError('Failed to add event. Please try again.');
        return { success: false, error: error.message };
    }
}