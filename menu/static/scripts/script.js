
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
      console.log('night');
    }
    else {
      document.querySelector('body').style.background = "white";
      document.querySelector('body').style.color = "black";
      console.log('day');
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
      const item_quantities = this.closest('.price_container').querySelectorAll('input');
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
      if (checkQtys(item_quantities)) {
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

// Trigger cart notifications
function cartNotification() {
  notification = document.querySelector('.cart_notification_container');
  notification.classList.remove('cart_notification_animation');
  void notification.offsetWidth;
  notification.classList.add('cart_notification_animation');
}
