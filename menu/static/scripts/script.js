//
// Find the CSRF Token cookie value
// Found at http://musings.tinbrain.net/blog/2015/aug/28/vanilla-js-meets-djangos-csrf/
function parse_cookies() {
  var cookies = {};
  if (document.cookie && document.cookie !== '') {
    document.cookie.split(';').forEach(function (c) {
      var m = c.trim().match(/(\w+)=(.*)/);
      if(m !== undefined) {
        cookies[m[1]] = decodeURIComponent(m[2]);
      }
    });
  }
  return cookies;
}
const cookies = parse_cookies();

///////////////
///////
//// App's js
//

// Order Data
orderItems = {};

var pizzaSelected = false; // For pizza topping control
let pizzaToppingLimit = 0;
let pizzaToppingCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  // Grab useful DOM elements
  const cartButton = document.querySelector('.cart_button');
  const cartIcon = document.querySelector('.cart_icon');
  const cart = document.querySelector('.cart_contents');
  const cartOverlay = document.querySelector('.cart_overlay');
  const nightMode = document.querySelector('.switch input');
  const slider = document.querySelector('.slider');

  // Nightmode color toggle
  slider.onclick = () => {
    if (nightMode.checked === false) {
      document.querySelector('body').style.background = "black";
      document.querySelector('body').style.color = "white";
    }
    else {
      document.querySelector('body').style.background = "white";
      document.querySelector('body').style.color = "black";
    }
  }

  // Cart functionality
  let cartOpen = false;
  cartButton.onclick = () => {
    if (cartOpen) {
      cartOverlay.classList.add('hidden');
      cart.classList.remove('active');
      cart.classList.add('hidden');
      cartButton.classList.remove('cart_button_active');
      cartIcon.classList.remove('cart_icon_active');
      cartOpen = false;
    }
    else {
      cartOverlay.classList.remove('hidden');
      cart.classList.remove('hidden');
      cart.classList.add('active');
      cartButton.classList.add('cart_button_active');
      cartIcon.classList.add('cart_icon_active');
      cartOpen = true;
    }
  };

  cartOverlay.onclick = () => {
    cartOverlay.classList.add('hidden');
    cart.classList.remove('active');
    cart.classList.add('hidden');
    cartButton.classList.remove('cart_button_active');
    cartIcon.classList.remove('cart_icon_active');
    cartOpen = false;
  }

  // Add functionality to + button.
  // Increments qty and disables other items if > 0 for either size
  document.querySelectorAll('.plus').forEach(plus => {
    plus.addEventListener('click', function() {
      const qty = this.closest('.quantity_container').children[1];
      let val = qty.value;
      val++;
      qty.value = val;
      // Check if item has it's own exclusive toppings.
      // If yes, don't disable other items and reveal toppings
      const category_toppings = this.closest('.category_box').querySelector('.category_toppings');
      const item_toppings = this.closest('.item_box').querySelector('.item_toppings');
      if (val === 1 && category_toppings !== null) {
        const thisItem = this.closest('.item').querySelector('.item_overlay');
        const otherItems = this.closest('.item_container').querySelectorAll('.item_overlay');
        otherItems.forEach(item => {
          item.classList.remove('hidden');
          item.classList.add('active');
        });
        thisItem.classList.remove('active');
        thisItem.classList.add('hidden');
      }
      // Expand toppings
      else if (item_toppings !== null) {
        const height = item_toppings.querySelector('.toppings_box').offsetHeight;
        item_toppings.style.height = `${height}px`;
      }
      // If pizza, apply topping restrictions
      if (!pizzaSelected) {
        const isPizza = plus.closest('.category_box').querySelectorAll('.pizza');
        if (isPizza.length > 0) {
          pizzaSelected = true;
          const pizzaName = plus.closest('.item').querySelector(".item_name").innerHTML;
          if (pizzaName !== "Cheese") {
            const toppingCheckboxes = category_toppings.querySelectorAll('input[type="checkbox"]');
            toppingCheckboxes.forEach(checkbox => {
              checkbox.disabled = false;
            });
            if (pizzaName.trim() !== "Special") {
              const toppingAmount = pizzaName.split(" ");
                  pizzaToppingLimit = parseInt(toppingAmount[0]);
                  console.log("pizzatoppinglimit" + pizzaToppingLimit);
            }
            else {
              pizzaToppingLimit = 8;
            }
          }
        }
      }
    });
  });
  // Add functionality to - button.
  // Decreases qty and enables other items if 0
  document.querySelectorAll('.minus').forEach(minus => {
    minus.addEventListener('click', function() {
      const qty = this.closest('.quantity_container').children[1];
      const itemQuantities = this.closest('.price_container').querySelectorAll('input');
      let val = qty.value;
      val--;
      if (val >= 0) {
        qty.value = val;
      }
      const category_toppings = this.closest('.category_box').querySelector('.category_toppings');
      const item_toppings = this.closest('.item_box').querySelector('.item_toppings');
      function checkQtys(qtys) {
        for (let i = 0, len = qtys.length; i < len; i++) {
          if (qtys[i].value != 0) {
            return false;
          }
        }
        return true;
      }
      if (checkQtys(itemQuantities)) {
        // If qty of items selected is 0 remove overlays
        const otherItems = this.closest('.item_container').querySelectorAll('.item_overlay');
        otherItems.forEach(item => {
          item.classList.remove('active');
          item.classList.add('hidden');
        });
        // Uncheck and close item toppings
        if (item_toppings !== null) {
          const boxToppings = item_toppings.querySelectorAll('input');
          boxToppings.forEach(topping => {
            topping.checked = false;
          });
          item_toppings.style.height = "0px";
        }
        // Disable category toppings
        if (category_toppings !== null) {
          const toppingCheckboxes = category_toppings.querySelectorAll('input[type="checkbox"]');
          toppingCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.disabled = true;
          });
          // This doesn't account for other categories having category toppings in the future, like the Add functionality
          pizzaSelected = false;
        }
      }
    });
  });

  // Keeping track of category toppings
  const categoryToppingsContainers = document.querySelectorAll('.category_toppings');
  // Seperate category toppings containers
  categoryToppingsContainers.forEach(categoryToppings => {
    const toppings = categoryToppings.querySelectorAll('input[type="checkbox"]');
    const len = toppings.length;
    toppings.forEach(checkbox => {
      checkbox.onclick = () => {
        const val = checkbox.checked;
        let tally = 0;
        for (let i = 0; i < len; i++) {
          if (toppings[i].checked) {
            tally++;
          }
        }
        // Disable non selected checkboxed if pizza topping limit reached
        if (tally === pizzaToppingLimit) {
          for (let i = 0; i < len; i++) {
            if (toppings[i].checked === false) {
              toppings[i].disabled = true;
            }
          }
        }
        // Re-enable pizza toppings if topping is unselected at limit
        else if (tally === pizzaToppingLimit - 1) {
          for (let i = 0; i < len; i++) {
            toppings[i].disabled = false;
          }
        }
      }
    });
  });

  // Order Confirmation
  // Hide order confirmation when overlay clicked
  document.querySelector('.order_confirmation_overlay').onclick = (e) => {
    document.querySelector('.order_confirmation_overlay').classList.add('hidden');
    document.querySelector('.order_confirmation_container').classList.add('hidden');
  }
  // Hide order confirmation box when button clicked
  document.querySelector('.order_confirmation_form').onsubmit = () => {
    // Validate name entry
    name = document.querySelector('#order_name').value.trim();
    const letters = /^[A-Za-z]+$/;
    if (!(name.match(letters))) {
      document.querySelector('.order_confirmation_error').innerHTML = "Name must be letters only";
    }
    else if (name.length < 2) {
      document.querySelector('.order_confirmation_error').innerHTML = "Name must be at least 2 characters";
    }
    else {
      console.log("success");
      document.querySelector('.order_confirmation_overlay').classList.add('hidden');
      document.querySelector('.order_confirmation_container').classList.add('hidden');

      const request = new XMLHttpRequest();
      request.open('POST', '/placeorder');
      // Set csrf token in request header
      request.setRequestHeader('X-CSRFToken', cookies['csrftoken']);
      request.onload = () => {
        const data = JSON.parse(request.responseText);
        console.log(data);
      }
      // Send data
      const data = new FormData();
      const abc = JSON.stringify(orderItems);
      data.append("order", abc);
      request.send(data);
      console.log("sent");
      console.log(abc);
      // Empty order data object
      orderItems = {};
      return false;
    }
    return false;
  }

});

// Trigger cart notification
function cartNotification() {
  notification = document.querySelector('.cart_notification_container');
  notification.classList.remove('cart_notification_animation');
  void notification.offsetWidth;
  notification.classList.add('cart_notification_animation');
}

// Trigger cart notification and add items & toppings to cart
function addToCart(el) {
  let changes = 0;
  const card = el.closest('.category_container');
  const items = card.querySelectorAll('input[type="text"]');
  const categoryToppings = card.querySelectorAll('.category_toppings input[type=checkbox]');
  const overlays = card.querySelectorAll('.item_overlay');

  let toppings = "";
  let toppingNames = [];
  let toppingPrices = [];

  items.forEach(item => {
    const qty = item.value;
    if (qty > 0) {
      // If category toppings exist, add selected ones to a string, and uncheck them
      if (categoryToppings !== null) {
        categoryToppings.forEach(topping => {
          if (topping.checked === true) {
            const name = topping.closest('.topping').querySelector('.topping_name').innerHTML;
            toppings += "<div class='cart_item_toppings_name'>" + name + " </div>";
            toppingNames.push(name);
            console.log(toppings);
            console.log(toppingNames);
          }
        });
      }

      const itemCategoryName = item.closest('.category_box').querySelector('.category_title').innerHTML.trim().split(' ')[0];
      document.querySelector('.cart_' + itemCategoryName).classList.remove('hidden');
      // Cart Category container
      const itemCategory = document.querySelector('.cart_' + itemCategoryName);
      const cartItem = item.closest('.item').querySelector('.item_name').innerHTML;
      // Add item details template to cart
      const cartItemSize = item.closest('.price').className.split(' ')[0];
      const cartItemQty = qty;
      const cartItemPrice = item.closest('.price').querySelector('.price_box').innerHTML;
      // Check if any item toppings selected an dadd them to cart with item
      if (toppings === "") {
        const itemToppings = item.closest('.item_box').querySelectorAll('.topping');
        itemToppings.forEach(topping => {
          const toppingChecked = topping.querySelector(".topping_price input");
          if (toppingChecked.checked) {
            const toppingName = topping.querySelector(".topping_name").innerHTML;
            const toppingPrice = topping.querySelector(".topping_price .price_box").innerHTML;
            toppingPrices.push(Number(parseFloat(toppingPrice)).toFixed(2));
            toppingNames.push(toppingName);
            toppings += "<div class='cart_item_toppings_name'>" + toppingName + " </div>" + "<div class='cart_item_toppings_price'>" + toppingPrice + " </div>";
          }
        });
      }

      // Check if same item and toppings already exist in cart
      let matchedItem = false;
      const itemCategoryItems = itemCategory.querySelectorAll('.cart_item_container');
      if (itemCategoryItems.length > 0) {
        itemCategoryItems.forEach(item2 => {
          const existingCartItem = item2.querySelector('.cart_item_name').innerHTML;
          const existingCartItemSize = item2.querySelector('.cart_item_size').innerHTML;
          if (existingCartItem === cartItem && existingCartItemSize === cartItemSize) {
            console.log("names and sizes match");
            matchedItem = true;
            const cartItemToppings = item2.querySelectorAll('.cart_item_toppings_name');
            let counter = 0;
            if (toppingNames.length !== 0) {
              console.log("toppings !== ''");
              cartItemToppings.forEach(topping => {
                if (topping.innerHTML.trim() != toppingNames[counter]) {
                  matchedItem = false;
                }
                counter++;
              });
            }
            if (matchedItem) {
              matchedItem = item2;
            }
          }
        });
      }

      // If item matched existing item in cart, update qty and prices
      // Else add new item and toppings to cart
      if (!matchedItem) {
        const total = document.querySelector('.cart_total_amount');
        let subtotal = parseFloat(cartItemPrice) * cartItemQty;
        for (let i = 0, len = toppingPrices.length; i < len; i++) {
          subtotal += parseFloat(toppingPrices[i]);
        }
        let cartItemSubtotal = Number(subtotal).toFixed(2);
        total.innerHTML = Number(parseFloat(total.innerHTML) + subtotal).toFixed(2);
        // Add item template to cart
        document.querySelector('.cart_' + itemCategoryName).innerHTML += cartItemTemplate({
          "name": cartItem,
          "size": cartItemSize,
          "qty": cartItemQty,
          "price": cartItemSubtotal,
          "toppings": toppings,
        });
      }
      else {
        const total = document.querySelector('.cart_total_amount');
        const matchedItemName = matchedItem.querySelector('.cart_item_name').innerHTML;
        const matchedItemSize = matchedItem.querySelector('.cart_item_size').innerHTML;
        const matchedItemQty = matchedItem.querySelector('.cart_item_qty').innerHTML.slice(1);
        const matchedItemSubtotal = matchedItem.querySelector('.cart_item_price').innerHTML;
        const newQty = parseInt(matchedItemQty) + parseInt(qty);
        const oneItemSubtotal = parseFloat(matchedItemSubtotal) / parseInt(matchedItemQty);
        matchedItemQty.innerHTML = newQty + "x";
        const newSubtotal = parseFloat(oneItemSubtotal) * parseFloat(newQty);
        const subtotal = Number(newSubtotal).toFixed(2);
        const addToTotal = newSubtotal - parseFloat(matchedItemSubtotal);

        total.innerHTML = Number(parseFloat(total.innerHTML) + addToTotal).toFixed(2);
        matchedItem.parentNode.removeChild(matchedItem);
        document.querySelector('.cart_' + itemCategoryName).innerHTML += cartItemTemplate({
          "name": matchedItemName,
          "size": matchedItemSize,
          "qty": newQty,
          "price": subtotal,
          "toppings": toppings,
        });
      }

      // Reset item value on category card
      item.value = 0;
      changes++;

      // Reset toppings and topping prices
      toppings = "";
      toppingPrices.length = 0;;
    }
  });
  overlays.forEach(overlay => {
    overlay.classList.remove('active');
    overlay.classList.add('hidden');
  });
  // Close open item toppings boxes if there are any
  const itemToppingsBoxes = el.closest('.category_container').querySelectorAll('.item_toppings');
  itemToppingsBoxes.forEach(box => {
    const boxToppings = box.querySelectorAll('input');
    boxToppings.forEach(topping => {
      topping.checked = false;
    });
    box.style.height = "0px";
  });
  // Disable category toppings checkboxes
  if (changes) {
    categoryToppings.forEach(checkbox => {
      checkbox.disabled = true;
      checkbox.checked = false;
    });
  }
  // Trigger cart notification if there were items to add to cart
  changes ? cartNotification() : console.log("No items selected");

  pizzaSelected = false;
}

// Remove item from cart
function removeItem(el) {
  const item = el.closest('.cart_item_container');
  const itemCategory = item.closest('.cart_category_container');
  const total = document.querySelector('.cart_total_amount');
  const itemAmount = item.querySelector('.cart_item_price').innerHTML;
  const itemQty = item.querySelector('.cart_item_qty').innerHTML.slice(1);
  item.parentNode.removeChild(item);
  const subtotal = parseFloat(itemAmount);
  total.innerHTML = Number(parseFloat(total.innerHTML) - subtotal).toFixed(2);
  const itemCategoryItems = itemCategory.querySelectorAll('.cart_item_container');
  if (itemCategoryItems.length === 0) {
    itemCategory.classList.add('hidden');
  }
}

// Place order
function placeOrder() {
  // Check if any items in cart
  const itemsCheck = document.querySelectorAll('.cart_item_container');
  console.log(itemsCheck);
  if (itemsCheck.length === 0) {
    console.log("no items in cart");
  }
  else {
    // Make sure order data is empty
    orderItems = {};

    categories = document.querySelectorAll('.cart_category_title');
    categories.forEach(category => {
      orderItems[category.innerHTML.trim()] = [];
    });
    // Get details of items in cart ready to send to backend
    const items = itemsCheck;
    for (let i = 0, len = items.length; i < len; i++) {
      const category = items[i].closest('.cart_category_container').querySelector('.cart_category_title').innerHTML.trim();
      const itemName = items[i].querySelector('.cart_item_name').innerHTML;
      const itemSize = items[i].querySelector('.cart_item_size').innerHTML;
      const itemQty = items[i].querySelector('.cart_item_qty').innerHTML.slice(1);
      // Add item object to category array
      orderItems[category].push({
        "name": "",
        "size": "",
        "qty": "",
        "toppings": [],
      });
      // Add item name, size, qty and toppings to object
      const index = orderItems[category].length-1; // Correct position index in category item array
      orderItems[category][index].name = itemName;
      orderItems[category][index].size = itemSize;
      orderItems[category][index].qty = itemQty;
      const itemToppings = items[i].querySelectorAll('.cart_item_toppings_name');
      itemToppings.forEach(topping => {
        orderItems[category][index].toppings.push(topping.innerHTML.trim());
      });
    }
    document.querySelector('.order_confirmation_overlay').classList.remove('hidden');
    document.querySelector('.order_confirmation_container').classList.remove('hidden');
  }
}

//
//////
////////////
///////////////////
//////////////////////////
////// Handelbar Templates
//
const cartItemTemplate = Handlebars.compile(
  `<div class="cart_item_container">
    <div class="cart_item">
      <div class="cart_item_remove" onclick="removeItem(this)"><i class="fas fa-times-circle"></i></div>
      <div class="cart_item_name">{{ name }}</div>
      <div class="cart_item_size">{{ size }}</div>
      <div class="cart_item_qty">x{{ qty }}</div>
      <div class="cart_item_price">{{ price }}</div>
    </div>
    <div class="cart_item_toppings">{{{ toppings }}}</div>
  </div>`
);

const cartCategoryTemplate = Handlebars.compile (
  `<div class="cart_category_container">
    <div class="cart_category_title">{{ name }}</div>
  </div>`
);
