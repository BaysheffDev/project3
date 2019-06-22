
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
          const boxToppings = toppings.querySelectorAll('input');
          boxToppings.forEach(topping => {
            topping.checked = false;
          });
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
  const items = card.querySelectorAll('input[type="text"]');
  const categoryToppings = card.querySelectorAll('.category_toppings input[type=checkbox]');
  const overlays = card.querySelectorAll('.item_overlay');

  let toppings = "";
  let toppingNames = [];
  let toppingPrices = [];
  // If category toppings exist, add selected ones to a string, and uncheck them
  if (categoryToppings !== null) {
    categoryToppings.forEach(topping => {
      if (topping.checked === true) {
        const name = topping.closest('.topping').querySelector('.topping_name').innerHTML;
        toppings += name + " ";
        topping.checked = false;
      }
    });
  }

  items.forEach(item => {
    const qty = item.value;
    if (qty > 0) {
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
      let newItemQty = 0;
      const itemCategoryItems = itemCategory.querySelectorAll('.cart_item_container');
      if (itemCategoryItems.length > 0) {
        itemCategoryItems.forEach(item => {
          const existingCartItem = item.querySelector('.cart_item_name').innerHTML;
          const existingCartItemSize = item.querySelector('.cart_item_size').innerHTML;
          if (existingCartItem === cartItem && existingCartItemSize === cartItemSize) {
            console.log("names and sizes match");
            matchedItem = true;
            const cartItemToppings = item.querySelectorAll('.cart_item_toppings_name');
            let counter = 0;
            if (toppings !== "") {
              console.log("toppings !== ''");
              cartItemToppings.forEach(topping => {
                if (topping.innerHTML.trim() != toppingNames[counter]) {
                  matchedItem = false;
                }
                counter++;
              });
            }
            if (matchedItem) {
              matchedItem = item;
              newItemQty = parseInt(item.querySelector('.cart_item_qty').innerHTML.slice(1));
            }
          }
        });
      }

      // If item matched existing item in cart, update qty and prices
      if (matchedItem !== false) {
        const total = document.querySelector('.cart_total_amount');
        const matchedItemQty = matchedItem.querySelector('.cart_item_qty');
        const newQty = parseInt(matchedItemQty.innerHTML.slice(1)) + newItemQty;
        const subtotal = matchedItem.querySelector('.cart_item_price');
        const oneItemSubtitle = parseFloat(subtotal.innerHTML) / parseFloat(matchedItemQty.innerHTML.slice(1));
        matchedItemQty.innerHTML = newQty + "x";
        const newSubtotal = parseFloat(oneItemSubtitle * newQty);
        const addToTotal = newSubtotal - parseFloat(subtotal.innerHTML);
        subtotal.innerHTML = Number(newSubtotal).toFixed(2);
        console.log(total.innerHTML);
        console.log(subtotal.innerHTML);
        console.log(addToTotal);
        total.innerHTML = Number(parseFloat(total.innerHTML) + addToTotal).toFixed(2);
      }
      else {
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

      // Reset item value on category card
      item.value = 0;
      changes++;

      // Reset toppings and topping prices
      toppings = "";
      toppingPrices = [];
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
  // Trigger cart notification if there were items to add to cart
  changes ? cartNotification() : console.log("No items selected");
}

// Remove item from cart
function removeItem(el) {
  const item = el.closest('.cart_item_container');
  const itemCategory = item.closest('.cart_category_container');
  item.parentNode.removeChild(item);
  const total = document.querySelector('.cart_total_amount');
  const itemAmount = item.querySelector('.cart_item_price').innerHTML;
  const itemQty = item.querySelector('.cart_item_qty').innerHTML.substr(1);
  const subtotal = parseFloat(itemAmount);
  total.innerHTML = Number(parseFloat(total.innerHTML) - subtotal).toFixed(2);
  const itemCategoryItems = itemCategory.querySelectorAll('.cart_item_container');
  if (itemCategoryItems.length === 0) {
    itemCategory.classList.add('hidden');
  }
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
    <div class="cart_item_toppings">{{{ toppings }}}</div>
  </div>`
);

const cartCategoryTemplate = Handlebars.compile (
  `<div class="cart_category_container">
    <div class="cart_category_title">{{ name }}</div>
  </div>`
);
