// frontend/js/admin.js
const adminAPI_BASE_URL = 'http://localhost:3000/api/products'; // Admin API endpoint

const productForm = document.getElementById('product-form');
const productIdInput = document.getElementById('product-id');
const nameInput = document.getElementById('name');
const descriptionInput = document.getElementById('description');
const priceInput = document.getElementById('price');
const imageUrlInput = document.getElementById('imageUrl');
const categoryInput = document.getElementById('category');
const ratingInput = document.getElementById('rating');
const stockInput = document.getElementById('stock');
const formSubmitBtn = document.getElementById('form-submit-btn');
const formCancelBtn = document.getElementById('form-cancel-btn');
const productListGrid = document.getElementById('product-list-grid');
const loadingProductsMessage = document.getElementById('loading-products-message');

let currentEditingProductId = null;

// --- Fetch & Display Products in Admin Panel ---
async function fetchAdminProducts() {
  productListGrid.innerHTML = '';
  loadingProductsMessage.style.display = 'block';
  try {
    const response = await fetch(adminAPI_BASE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const products = await response.json();
    loadingProductsMessage.style.display = 'none';

    if (products.length === 0) {
      productListGrid.innerHTML = '<p class="loading-message">No products in the database. Add some!</p>';
      return;
    }

    products.forEach((product, index) => {
      const productCard = document.createElement('div');
      productCard.classList.add('product-card', 'gsap-slide-up'); // Reusing product card style
      productCard.style.animationDelay = `${index * 0.05}s`;

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
            <button class="action-btn primary edit-btn" data-id="${product._id}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="action-btn remove-btn" data-id="${product._id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
      productListGrid.appendChild(productCard);
    });

    // Add event listeners for edit/delete buttons
    productListGrid.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', (e) => editProduct(e.target.dataset.id));
    });
    productListGrid.querySelectorAll('.remove-btn').forEach(button => {
      button.addEventListener('click', (e) => deleteProduct(e.target.dataset.id));
    });

    // Animate newly loaded products
    gsap.from(productListGrid.querySelectorAll('.product-card.gsap-slide-up'), {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.05,
      scrollTrigger: {
        trigger: productListGrid,
        start: "top 90%",
        toggleActions: "play none none reverse",
      }
    });

  } catch (error) {
    console.error('Error fetching admin products:', error);
    loadingProductsMessage.style.display = 'block';
    loadingProductsMessage.textContent = 'Failed to load products. Backend might be down.';
    loadingProductsMessage.style.color = 'var(--accent)';
  }
}

// --- Add/Edit Product Form Submission ---
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const productData = {
    name: nameInput.value,
    description: descriptionInput.value,
    price: parseFloat(priceInput.value),
    imageUrl: imageUrlInput.value,
    category: categoryInput.value,
    rating: parseFloat(ratingInput.value),
    stock: stockInput.checked
  };

  let url = adminAPI_BASE_URL;
  let method = 'POST';

  if (currentEditingProductId) {
    url = `${adminAPI_BASE_URL}/${currentEditingProductId}`;
    method = 'PUT';
  }

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Product operation successful:', result);
    alert(`Product ${currentEditingProductId ? 'updated' : 'added'} successfully!`);

    resetForm();
    fetchAdminProducts(); // Refresh the list
  } catch (error) {
    console.error('Error saving product:', error);
    alert(`Failed to save product: ${error.message}`);
  }
});

// --- Populate Form for Editing ---
async function editProduct(id) {
  try {
    const response = await fetch(`${adminAPI_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const product = await response.json();

    nameInput.value = product.name;
    descriptionInput.value = product.description;
    priceInput.value = product.price;
    imageUrlInput.value = product.imageUrl;
    categoryInput.value = product.category;
    ratingInput.value = product.rating;
    stockInput.checked = product.stock;

    productIdInput.value = product._id; // Store ID for PUT request
    currentEditingProductId = product._id;
    formSubmitBtn.innerHTML = '<i class="fas fa-save"></i> Update Product';
    formCancelBtn.style.display = 'inline-block';

    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  } catch (error) {
    console.error('Error fetching product for edit:', error);
    alert(`Failed to load product for edit: ${error.message}`);
  }
}

// --- Delete Product ---
async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }
  try {
    const response = await fetch(`${adminAPI_BASE_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    alert('Product deleted successfully!');
    fetchAdminProducts(); // Refresh the list
  } catch (error) {
    console.error('Error deleting product:', error);
    alert(`Failed to delete product: ${error.message}`);
  }
}

// --- Reset Form ---
function resetForm() {
  productForm.reset();
  productIdInput.value = '';
  currentEditingProductId = null;
  formSubmitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add Product';
  formCancelBtn.style.display = 'none';
}

formCancelBtn.addEventListener('click', resetForm);

// Initial fetch when admin page loads
document.addEventListener('DOMContentLoaded', fetchAdminProducts);

// Setup GSAP animations specifically for the admin page elements
gsap.from(".admin-form-container", {
  opacity: 0,
  y: 50,
  duration: 1,
  ease: "power2.out",
  delay: 0.5,
  scrollTrigger: {
    trigger: ".admin-form-container",
    start: "top 80%",
    toggleActions: "play none none reverse",
  }
});

gsap.from(".product-list-container", {
  opacity: 0,
  y: 50,
  duration: 1,
  ease: "power2.out",
  delay: 0.7,
  scrollTrigger: {
    trigger: ".product-list-container",
    start: "top 80%",
    toggleActions: "play none none reverse",
  }
});