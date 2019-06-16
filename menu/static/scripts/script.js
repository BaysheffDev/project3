
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
        // Expand toppings
      }
      else if (item_toppings !== null) {
        const height = item_toppings.querySelector('.toppings_box').offsetHeight;
        item_toppings.style.height = `${height}px`;
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
      const toppings = this.closest('.item_box').querySelector('.item_toppings');
      function checkQtys(qtys) {
        for (let i = 0, len = qtys.length; i < len; i++) {
          if (qtys[i].value != 0) {
            return false;
          }
        }
        return true;
      }
      if (checkQtys(itemQuantities)) {
        const otherItems = this.closest('.item_container').querySelectorAll('.item_overlay');
        otherItems.forEach(item => {
          item.classList.remove('active');
          item.classList.add('hidden');
        });
        if (toppings !== null) {
          toppings.style.height = "0px";
        }
      }
    });
  });

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
  const items = card.querySelectorAll('input[type=text]');
  const categoryToppings = card.querySelectorAll('.category_toppings input[type=checkbox]');
  const overlays = card.querySelectorAll('.item_overlay');

  const itemToppings = card.querySelectorAll('.item_toppings input[type=checkbox]');

  items.forEach(item => {
    const qty = item.value;
    if (qty > 0) {
      const itemCategory = item.closest('.category_box').querySelector('.category_title').innerHTML.trim().split(' ')[0];
      document.querySelector('.cart_' + itemCategory).classList.remove('hidden');
      console.log(itemCategory);
      const cartItem = item.closest('.item').querySelector('.item_name').innerHTML;
      // Add item details template to cart
      const cartItemSize = item.closest('.price').className.split(' ')[0];
      const cartItemQty = qty;
      const cartItemPrice = item.closest('.price').querySelector('.price_box').innerHTML;
      document.querySelector('.cart_' + itemCategory).innerHTML += cartItemTemplate({
        "name": cartItem,
        "size": cartItemSize,
        "qty": cartItemQty,
        "price": cartItemPrice,
      });
      // Update order total
      const total = document.querySelector('.cart_total_amount');
      const subtotal = parseFloat(cartItemPrice) * cartItemQty;
      total.innerHTML = Number(parseFloat(total.innerHTML) + subtotal).toFixed(2);
      // Reset item value on category card
      item.value = 0;
      changes++;
    }
  });
  categoryToppings.forEach(topping => {
    if (topping.checked === true && changes) {
      // TODO: remove and put correct code here
      const name = topping.closest('.topping').querySelector('.topping_name').innerHTML;
      document.querySelector('.cart_contents').innerHTML += name + " ";

      topping.checked = false;
    }
  });
  overlays.forEach(overlay => {
    overlay.classList.remove('active');
    overlay.classList.add('hidden');
  });
  // Close open item toppings boxes if there are any
  const itemToppingsBoxes = el.closest('.category_container').querySelectorAll('.item_toppings');
  itemToppingsBoxes.forEach(box => {
    box.style.height = "0px";
  });
  // Trigger cart notification if there were items to add to cart
  changes ? cartNotification() : console.log("No items selected");
}

// Remove item from cart
function removeItem(el) {
  const item = el.closest('.cart_item_container');
  item.parentNode.removeChild(item);
  const total = document.querySelector('.cart_total_amount');
  const itemAmount = item.querySelector('.cart_item_price').innerHTML;
  const itemQty = item.querySelector('.cart_item_qty').innerHTML.substr(1);
  const subtotal = parseFloat(itemAmount) * itemQty;
  total.innerHTML = Number(parseFloat(total.innerHTML) - subtotal).toFixed(2);
}

// Handelbar Templates
const cartItemTemplate = Handlebars.compile(
  `<div class="cart_item_container">
    <div class="cart_item">
      <div class="cart_item_remove" onclick="removeItem(this)"><i class="fas fa-times-circle"></i></div>
      <div class="cart_item_name">{{ name }}</div>
      <div class="cart_item_size">{{ size }}</div>
      <div class="cart_item_qty">x{{ qty }}</div>
      <div class="cart_item_price">{{ price }}</div>
    </div>
    <div class="cart_item_toppings">{{ toppings }}</div>
  </div>`
);

const cartCategoryTemplate = Handlebars.compile (
  `<div class="cart_category_container">
    <div class="cart_category_title">{{ name }}</div>
  </div>`
);
