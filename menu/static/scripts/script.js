console.log("Hello, World!");

document.addEventListener('DOMContentLoaded', () => {
  // Grab useful DOM elements
  const cartButton = document.querySelector('.cart_button');
  const cartIcon = document.querySelector('.cart_icon');
  const cart = document.querySelector('.cart_contents');
  const cartOverlay = document.querySelector('.cart_overlay');

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

  // Add functionality to + button
  document.querySelectorAll('.plus').forEach(plus => {
    plus.addEventListener('click', function() {
      console.log("plus");
      let val = this.closest('.quantity_container').children[1].value;
      val++;
      this.closest('.quantity_container').children[1].value = val;
    });
  });
  // Add functionality to - button
  document.querySelectorAll('.minus').forEach(minus => {
    minus.addEventListener('click', function() {
      console.log("minus");
      let val = this.closest('.quantity_container').children[1].value;
      val--;
      if(val >= 0) {
        this.closest('.quantity_container').children[1].value = val;
      }
    });
  });
  // If user selects an item, expand the related toppings or extras
  // document.querySelectorAll('.quantity_container input').forEach(qty => {
  //   qty.addEventListener('change', function() {
  //     console.log("qty");
  //     let val = this.closest('.quantity_container').children[1].value;
  //     val++;
  //     this.closest('.quantity_container').children[1].value = val;
  //   });
  // });

});

// Trigger cart notifications
function cartNotification() {
  notification = document.querySelector('.cart_notification_container');
  notification.classList.remove('cart_notification_animation');
  void notification.offsetWidth;
  notification.classList.add('cart_notification_animation');
}
