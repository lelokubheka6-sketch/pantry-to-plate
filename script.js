document.getElementById('addItemBtn').addEventListener('click', function() {
    
});
// Get existing pantry items from localStorage or start fresh
let pantryItems = JSON.parse(localStorage.getItem('pantryItems')) || [];

// Display items when page loads
function displayPantry() {
    const list = document.getElementById('pantryList');
    list.innerHTML = ""; // Clear list before adding items

    pantryItems.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
    });

    console.log("Current Pantry Items:", pantryItems); // Debugging – check in console
}

displayPantry(); // ✔ must be called!!!

// Add item when clicking the button
document.getElementById('addItemBtn').addEventListener('click', function() {
    const input = document.getElementById('pantryInput');
    const item = input.value.trim(); // removes spaces

    if (item === "") return; // ignore empty

    pantryItems.push(item); // add to array
    localStorage.setItem('pantryItems', JSON.stringify(pantryItems)); // store it
    displayPantry(); // refresh list
    input.value = ""; // clear input after adding
});
