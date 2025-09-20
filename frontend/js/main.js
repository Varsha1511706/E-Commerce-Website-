// frontend/js/main.js
const API_BASE_URL = 'http://localhost:3000/api'; // Update for deployment

// --- GSAP Animations ---
gsap.registerPlugin(ScrollTrigger);

// Hero Section Animations
gsap.from(".home h1", {
  duration: 1.5,
  y: 50,
  opacity: 0,
  ease: "power3.out",
  stagger: 0.1,
  delay: 0.5,
  onComplete: () => {
    // Reveal text after animation completes
    gsap.to(".gsap-reveal-text", {
      clipPath: "inset(0 0% 0 0)",
      ease: "power3.out",
      duration: 1
    });
  }
});

gsap.from(".home p", {
  duration: 1.2,
  y: 30,
  opacity: 0,
  ease: "power2.out",
  delay: 1.2
});

gsap.from(".home .btn-group", {
  duration: 1,
  y: 20,
  opacity: 0,
  ease: "power2.out",
  delay: 1.5
});

// Scroll-triggered animations for sections
function setupSectionAnimations() {
  document.querySelectorAll('.section-title.gsap-reveal-text').forEach(title => {
    gsap.to(title, {
      clipPath: "inset(0 0% 0 0)",
      ease: "power3.out",
      duration: 1,
      scrollTrigger: {
        trigger: title,
        start: "top 80%",
        toggleActions: "play none none reverse",
      }
    });
  });

  document.querySelectorAll('.gsap-fade-in').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 20,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none reverse",
      }
    });
  });

  document.querySelectorAll('.gsap-slide-up').forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power2.out",
      delay: i * 0.1, // Stagger effect for cards/items
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        toggleActions: "play none none reverse",
      }
    });
  });
}

setupSectionAnimations(); // Call on initial load

// --- Navigation & Mobile Menu ---
const navLinks = document.querySelector('.nav-links');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navItems = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

// Mobile menu toggle
mobileMenuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
});

// Smooth scroll for nav links and highlight active section
navLinks.addEventListener('click', (e) => {
  if (e.target.matches('.nav-link')) {
    e.preventDefault();
    const targetId = e.target.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      window.scrollTo({
        top: targetSection.offsetTop - document.querySelector('.navbar').offsetHeight,
        behavior: 'smooth'
      });
      navLinks.classList.remove('active'); // Close mobile menu after click
    }
  }
});

// Highlight active nav link on scroll
window.addEventListener('scroll', () => {
  let current = '';
  const navbarHeight = document.querySelector('.navbar').offsetHeight;

  sections.forEach(section => {
    const sectionTop = section.offsetTop - navbarHeight;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });

  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href').includes(current)) {
      item.classList.add('active');
    }
  });
});

// Update display on window resize
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    navLinks.classList.remove('active'); // Ensure menu is hidden on larger screens if open
  }
});

// --- Dynamic Product Loading (Suggestions Section) ---
const productsGrid = document.getElementById('products-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
let allProducts = []; // Store all fetched products

async function fetchProducts(category = 'all') {
  productsGrid.innerHTML = '<p class="loading-message">Loading products...</p>';
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const products = await response.json();
    allProducts = products; // Store for filtering
    displayProducts(category); // Display initially or filter
  } catch (error) {
    console.error('Error fetching products:', error);
    productsGrid.innerHTML = '<p class="loading-message error">Failed to load products. Please try again later.</p>';
  }
}

function displayProducts(category) {
  productsGrid.innerHTML = ''; // Clear previous products
  const filteredProducts = category === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === category);

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = '<p class="loading-message">No products found in this category.</p>';
    return;
  }

  filteredProducts.forEach((product, index) => {
    const productCard = document.createElement('div');
    productCard.classList.add('product-card', 'gsap-slide-up');
    productCard.style.animationDelay = `${index * 0.1}s`; // Stagger animation

    productCard.innerHTML = `
      <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        <div class="product-meta">
          <span><i class="fas fa-star"></i> ${product.rating.toFixed(1)}</span>
          <span>${product.stock ? 'In Stock' : 'Out of Stock'}</span>
        </div>
        <div class="product-actions">
          <button class="action-btn primary add-to-cart-btn" data-id="${product._id}">
            <i class="fas fa-cart-plus"></i> Add
          </button>
          <button class="action-btn">
            <i class="fas fa-heart"></i>
          </button>
        </div>
      </div>
    `;
    productsGrid.appendChild(productCard);
  });

  // Re-run GSAP animations for newly added products
  gsap.from(productsGrid.querySelectorAll('.product-card.gsap-slide-up'), {
    opacity: 0,
    y: 50,
    duration: 0.8,
    ease: "power2.out",
    stagger: 0.1,
    scrollTrigger: {
      trigger: productsGrid,
      start: "top 90%",
      toggleActions: "play none none reverse",
    }
  });

  // Add event listeners to "Add to Cart" buttons
  productsGrid.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const productId = e.target.closest('.add-to-cart-btn').dataset.id;
      const productToAdd = allProducts.find(p => p._id === productId);
      if (productToAdd) {
        addToCart(productToAdd);
      }
    });
  });
}

filterBtns.forEach(button => {
  button.addEventListener('click', (e) => {
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    const category = e.target.dataset.category;
    displayProducts(category);
  });
});

fetchProducts(); // Initial fetch of products when page loads

// --- Simple Client-Side Cart Logic ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartCountSpan = document.querySelector('.cart-count');
const cartItemsList = document.getElementById('cart-items-list');
const emptyCartMessage = document.getElementById('empty-cart-message');
const cartItemCountSpan = document.getElementById('cart-item-count');
const cartSubtotalSpan = document.getElementById('cart-subtotal');
const cartTaxSpan = document.getElementById('cart-tax');
const cartTotalSpan = document.getElementById('cart-total');

function updateCartDisplay() {
  cartCountSpan.textContent = cart.length;
  cartItemCountSpan.textContent = `${cart.length} Items`;
  cartItemsList.innerHTML = '';

  if (cart.length === 0) {
    emptyCartMessage.style.display = 'block';
  } else {
    emptyCartMessage.style.display = 'none';
    cart.forEach(item => {
      const cartItemDiv = document.createElement('div');
      cartItemDiv.classList.add('cart-item');
      cartItemDiv.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.name}" class="item-image">
        <div class="item-details">
          <div class="item-header">
            <h3 class="item-title">${item.name}</h3>
            <span class="item-price">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
          <p class="item-color">Quantity: ${item.quantity}</p>
          <div class="item-actions">
            <div class="quantity-control">
              <button class="quantity-btn decrease-qty" data-id="${item._id}">-</button>
              <span>${item.quantity}</span>
              <button class="quantity-btn increase-qty" data-id="${item._id}">+</button>
            </div>
            <button class="remove-btn" data-id="${item._id}">
              <i class="fas fa-trash"></i> Remove
            </button>
          </div>
        </div>
      `;
      cartItemsList.appendChild(cartItemDiv);
    });

    cartItemsList.querySelectorAll('.increase-qty').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        updateQuantity(id, 1);
      });
    });

    cartItemsList.querySelectorAll('.decrease-qty').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        updateQuantity(id, -1);
      });
    });

    cartItemsList.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        removeFromCart(id);
      });
    });
  }
  calculateCartTotals();
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
  const existingItem = cart.find(item => item._id === product._id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCartDisplay();
  // Trigger bounce animation for cart icon
  cartCountSpan.style.animation = 'none';
  void cartCountSpan.offsetWidth; // Trigger reflow
  cartCountSpan.style.animation = 'cartBounce 0.5s ease';
}

function updateQuantity(id, change) {
  const itemIndex = cart.findIndex(item => item._id === id);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += change;
    if (cart[itemIndex].quantity <= 0) {
      cart.splice(itemIndex, 1); // Remove if quantity is 0 or less
    }
    updateCartDisplay();
  }
}

function removeFromCart(id) {
  cart = cart.filter(item => item._id !== id);
  updateCartDisplay();
}

function calculateCartTotals() {
  let subtotal = 0;
  cart.forEach(item => {
    subtotal += item.price * item.quantity;
  });
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  cartSubtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
  cartTaxSpan.textContent = `$${tax.toFixed(2)}`;
  cartTotalSpan.textContent = `$${total.toFixed(2)}`;
}

updateCartDisplay(); // Initial cart display on page load

// --- Profile Page Tab Switching ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    const tabId = tab.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  });
});