// ------------------GLOBAL----------------------
// PAGES
const SEARCH = document.querySelector('#search');
const CART = document.querySelector('#cart');
const BOOKINGS = document.querySelector('#bookings');

// DISPLAY PAGES
function displaySearch() {
    document.querySelector('#departure').value = '';
    document.querySelector('#arrival').value = '';
    document.querySelector('#search-results').innerHTML = '';
    SEARCH.style.display = 'flex';
    CART.style.display = 'none';
    BOOKINGS.style.display = 'none';
}

function displayCart() {
    SEARCH.style.display = 'none';
    CART.style.display = 'flex';
    BOOKINGS.style.display = 'none';
}

function displayBookings() {
    SEARCH.style.display = 'none';
    CART.style.display = 'none';
    BOOKINGS.style.display = 'flex';
}

// DISPLAY MESSAGES
function message(text) {
    document.querySelector('#message').innerHTML = text;
    document.addEventListener('keydown', () => document.querySelector('#message').innerHTML = '');
    document.addEventListener('click', () => document.querySelector('#message').innerHTML = '');
    return
}

// FUNCTION GET HH:MM
function getTime(date) {
    let departureDate = new Date(date);
    let hours = departureDate.getHours() < 10 ? '0' + departureDate.getHours() : departureDate.getHours();
    let minutes = departureDate.getMinutes() < 10 ? '0' + departureDate.getMinutes() : departureDate.getMinutes();
    return hours + ':' + minutes;
}

// UPPERCASE FUNCTION
function firstLetterUpperCase(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// GET DELAY FOR BOOKING PAGE
function getDelay(date) {
    // if !same day --> get delay in days
    // else --> get delay in hours
    let dateToCompare = new Date(date)
    const today = new Date();

    let delay = Math.abs(dateToCompare - today)
    let days = Math.floor(delay / (1000 * 60 * 60 * 24));
    let hours = Math.floor((delay % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((delay % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
        return days + " day(s)"
    } else if (hours > 0) {
        return hours + " hour(s)"
    } else {
        return minutes + " minute(s)"
    }
}
// ----------------------------------------------



// ----------------------SEARCH PAGE-----------------------------
// CLICK SEARCH BUTTON
document.querySelector('#search-button').addEventListener('click',
function() {
    let departure = firstLetterUpperCase(document.querySelector('#departure').value);
    let arrival = firstLetterUpperCase(document.querySelector('#arrival').value);
    let date = document.querySelector('#date').value;
    
    // CHECK EMPTY INPUTS
    console.log(date)
    if (!departure || ! arrival || !date) {
        message('Missing field !');
        return
    }
    const dateObj = new Date(date)
    const today = new Date()
    
    // CHECK DATE !< TODAY
    if (dateObj < today) {
        message('Date can\'t be anterior to today')
        return
    }
    
    // FORMAT CITY NAMES
    fetch('http://localhost:3000/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ departure, arrival, date }) 
    })
    .then(response => response.json())
    .then((data) => {
        console.log(data);
        document.querySelector('#search-results').innerHTML = '';
        if (data.result) {
            // EMPTY INPUTS
            document.querySelector('#departure').value = '';
            document.querySelector('#arrival').value = '';

            // POPULATE DIV WITH TRIPS FOUND
            for (let trip of data.trips) {
                let time = getTime(trip.date)
                
                document.querySelector('#search-results').innerHTML += `
                <div class="cart-item-container">
                <div class="departure-arrival">${ trip.departure } > ${ trip.arrival }</div>
                <div class="departure-time">${ time }</div>
                <div class="price">${ trip.price }€</div>
                <button class="book" id="${ trip._id }">BOOK</button>
                </div>
                `
            }

            // BOOK BUTTONS
            for (let i = 0; i < document.querySelectorAll('.book').length; i++) {
                document.querySelectorAll('.book')[i].addEventListener('click', 
                function() {
                    fetch(`http://localhost:3000/book/${ this.id }`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                    })
                    .then(response => response.json())
                    .then(data => {
                        if(data.result) {
                            message('Trip was added to your cart')
                        }
                    })
                })
            }
        } else {
            message(data.message)
        }
    })
})
// --------------------------------------------------------------


// ---------------------BOOKINGS PAGE----------------------------
function bookingsPage() {
    document.querySelector('#bookings-results').innerHTML = ''
    fetch(`http://localhost:3000/bookings`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then((data) => {
        if (data.result) {
            for (let item of data.bookings) {
                let time = getTime(item.trip.date)
                let delay = getDelay(item.trip.date)
                document.querySelector('#bookings-results').innerHTML += `
                    <div class="cart-item-container">
                        <div class="departure-arrival">${ item.trip.departure } > ${ item.trip.arrival }</div>
                        <div class="departure-time">${ time }</div>
                        <div class="price">${ item.trip.price }€</div>
                        <div class="delay">Departure in ${ delay }</div>
                    </div>
                `
            }
        }
    })
}
// --------------------------------------------------------------



// -----------------------CART PAGE------------------------------
function cartPage() {
    fetch('http://localhost:3000/cart', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        document.querySelector('#cart-results').innerHTML = '';
        document.querySelector('#total-container').innerHTML = '';
        console.log(data)
        if (data.result) {

            // DISPLAY CART ITEMS
            for (let item of data.cart) {
                let time = getTime(item.trip.date)
                document.querySelector('#cart-results').innerHTML += `
                <div class="cart-item-container">
                <div class="departure-arrival">${ item.trip.departure } > ${ item.trip.arrival }</div>
                <div class="departure-time">${ time }</div>
                <div class="price">${ item.trip.price }€</div>
                <button class="delete" id="${ item._id }">✖</button>
                </div>
                `
            }

            // DELETE BUTTONS
            for (let i = 0; i < document.querySelectorAll('.delete').length; i++) {
                document.querySelectorAll('.delete')[i].addEventListener('click', 
                function() {
                    console.log(this.id)
                    fetch(`http://localhost:3000/cart/${this.id}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                        if (data.result) {
                            cartPage()
                        }
                    })
                })
            }

            // ADD TOTAL AND PURCHASE BUTTON
            document.querySelector('#total-container').innerHTML = `
                <div id="total">Total: ${ data.total }€</div>
                <button id="purchase-button">Purchase</button>
            `
            document.querySelector('#purchase-button').addEventListener('click', 
            function() {
                fetch(`http://localhost:3000/buy`, {
                        method: 'GET',
                        headers: { 'Content-Type': 'application/json' }
                })
                .then(response => response.json())
                .then(data => {
                    console.log('clicked on purchase')
                    console.log(data)
                    if (data.result) {
                        displayBookings();
                        bookingsPage();
                    }
                })
            })
        }
    })
}
// --------------------------------------------------------------


// NAVLINKS CLICKS
// SEARCH
document.querySelector('#nav-logo').addEventListener('click', 
function() {
    displaySearch()
}) 

// CART
document.querySelector('#nav-cart').addEventListener('click', 
function() {
    displayCart()
    cartPage()
}) 

// BOOKINGS
document.querySelector('#nav-bookings').addEventListener('click', 
function() {
    displayBookings();
    bookingsPage();
})