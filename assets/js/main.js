/* Main JavaScript */
document.addEventListener('DOMContentLoaded', () => {

    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Change icon
            const icon = menuBtn.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    // Router Logic
    // Router Logic
    const productsContainer = document.getElementById('products-container');
    const featuredContainer = document.getElementById('featured-products');
    const detailsContainer = document.getElementById('details-container');

    if (productsContainer) {
        initProductsPage();
    } else if (featuredContainer) {
        initHomePage();
    } else if (detailsContainer) {
        loadProductDetails();
    }
});

// Global state
let allProducts = [];

// --- Cloudinary Integration ---


// --- Order Form Logic ---
function submitOrder(event, productName) {
    event.preventDefault();

    const name = document.getElementById('order-name').value;
    const phone = document.getElementById('order-phone').value;
    const address = document.getElementById('order-address').value;
    const qty = document.getElementById('order-qty').value;

    const message = `مرحباً، أرغب في تأكيد طلب جديد:
    
📦 *المنتج:* ${productName}
🔢 *الكمية:* ${qty}
👤 *الاسم:* ${name}
📱 *الهاتف:* ${phone}
📍 *العنوان:* ${address}

يرجى تأكيد الطلب. شكراً!`;

    const whatsappUrl = `https://wa.me/212604889578?text=${encodeURIComponent(message)}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');

    // Show Success Message
    const formContainer = document.getElementById('order-form-container');
    formContainer.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <i class="fas fa-check-circle" style="font-size: 3rem; color: #25D366; margin-bottom: 20px;"></i>
            <h3 style="color: var(--primary-color); margin-bottom: 10px;">تم استلام طلبك بنجاح!</h3>
            <p style="color: var(--text-light);">شكراً لتسوقكم معنا. سنتواصل معكم قريباً لتأكيد الطلب.</p>
        </div>
    `;
}

// --- Products Page Functions ---
async function initHomePage() {
    try {
        const response = await fetch('assets/data/products.json');
        if (!response.ok) throw new Error('Failed to load products');
        allProducts = await response.json();

        // Get random 8 products or just first 8
        // Let's shuffle for fun or just take first 8 for speed
        const featured = allProducts.slice(0, 8);
        renderFeaturedProducts(featured);
    } catch (error) {
        console.error('Error init homepage:', error);
        const container = document.getElementById('featured-products');
        if (container) container.innerHTML = '<p class="text-center">فشل تحميل المنتجات.</p>';
    }
}

function renderFeaturedProducts(products) {
    const container = document.getElementById('featured-products');
    if (!container) return;
    container.innerHTML = products.map(product => createProductCard(product)).join('');
}

async function initProductsPage() {
    try {
        const response = await fetch('assets/data/products.json');
        if (!response.ok) throw new Error('Failed to load products');

        allProducts = await response.json();

        // Artificial delay for smooth UX (optional, but nice when testing locally to see spinner)
        // setTimeout(() => renderProducts(allProducts), 300); 
        renderProducts(allProducts);

        // Setup Search
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => filterProducts(e.target.value));

            // Enter key support is also added inline in HTML, but good to have here too
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') filterProducts(searchInput.value);
            });
        }

        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => filterProducts(searchInput.value));
        }

        // Setup Category Filters
        const filters = document.querySelectorAll('.filter-btn');
        filters.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all
                filters.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                btn.classList.add('active');

                const category = btn.getAttribute('data-category');
                filterByCategory(category);

                // Clear search input when switching categories for clarity
                if (searchInput) searchInput.value = '';
            });
        });

    } catch (error) {
        console.error('Error init products:', error);
        const container = document.getElementById('products-container');
        if (container) container.innerHTML = '<p class="text-center" style="grid-column: 1/-1; padding: 40px; color: red;">فشل تحميل المنتجات. يرجى المحاولة لاحقاً.</p>';
    }
}

function renderProducts(products) {
    const container = document.getElementById('products-container');
    if (!container) return;

    if (!products.length) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 3rem; color: #eee; margin-bottom: 20px;"></i>
                <p style="font-size: 1.2rem; color: #777;">لا توجد منتجات مطابقة لبحثك.</p>
                <button class="btn btn-secondary" onclick="resetFilters()" style="margin-top: 20px;">عرض كل المنتجات</button>
            </div>
        `;
        return;
    }

    // Fade in animation effect
    container.style.opacity = '0';
    container.innerHTML = products.map(product => createProductCard(product)).join('');

    // Trigger reflow
    void container.offsetWidth;

    container.style.transition = 'opacity 0.5s ease';
    container.style.opacity = '1';
}

function createProductCard(product) {
    return `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-details">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-actions">
                    <a href="product-details.html?id=${product.id}" class="details-link">تفاصيل المنتج <i class="fas fa-arrow-left"></i></a>
                </div>
            </div>
        </div>
    `;
}

function filterProducts(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    // Reset category buttons visual state to 'All' if we are searching globally
    // Or we can keep it within the active category. For simplicity, let's search ALL products.
    // If you want to search ONLY within current category, we'd need to track currentCategory state.
    // Standard UX for this type of store: Search bar searches everything.

    // Let's visual update category to All
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    const allBtn = document.querySelector('.filter-btn[data-category="all"]');
    if (allBtn) allBtn.classList.add('active');

    const filtered = allProducts.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.short_description && p.short_description.toLowerCase().includes(term))
    );
    renderProducts(filtered);
}

function filterByCategory(category) {
    if (category === 'all') {
        renderProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

function resetFilters() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    const allBtn = document.querySelector('.filter-btn[data-category="all"]');
    if (allBtn) allBtn.classList.add('active');

    renderProducts(allProducts);
}

// --- Product Details Page Functions ---
async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));

    if (!id) {
        window.location.href = 'products.html';
        return;
    }

    try {
        const response = await fetch('assets/data/products.json');
        const products = await response.json();
        const product = products.find(p => p.id === id);

        if (!product) {
            window.location.href = 'products.html';
            return;
        }

        // Simulating Price Data (Pro touch)
        // In a real app, this would be in the JSON
        const prices = {
            1: 149, 2: 119, 3: 179, 4: 119, 5: 219, 6: 199, 7: 249
        };
        const price = prices[id] || 199;
        const oldPrice = Math.floor(price * 1.3); // Fake discount

        // Update Page Title
        document.title = `متجر الاحتراف - ${product.name}`;

        // Update Breadcrumb
        const breadcrumbEl = document.getElementById('breadcrumb-current');
        if (breadcrumbEl) breadcrumbEl.textContent = product.name;

        // Render Professional Details Layout
        const container = document.getElementById('details-container');
        if (container) {
            container.innerHTML = `
                <div class="pro-gallery">
                    <div class="gallery-badge">جديد</div>
                    <img src="${product.image}" alt="${product.name}" id="main-image">
                </div>
                <div class="pro-info">
                    <span class="category-pill">${product.category}</span>
                    <h1 class="pro-title">${product.name}</h1>
                    <!-- Price Hidden as per request -->
                    <!-- <div class="pro-price">...</div> -->
                    <p class="pro-desc">${product.short_description}</p>
                    
                    <div class="action-area" style="flex-direction: column;">
                        <!-- Order Button Toggler -->
                        <button onclick="document.getElementById('order-form-container').style.display = 'block'; this.style.display='none'" class="whatsapp-btn">
                            <i class="fas fa-shopping-cart"></i> اضغط للطلب
                        </button>

                        <!-- Order Form -->
                        <div id="order-form-container" style="display: none;">
                            <h3 style="margin-bottom: 15px; font-size: 1.1rem;">أدخل معلومات التوصيل</h3>
                            <form onsubmit="submitOrder(event, '${product.name}')">
                                <div class="form-group">
                                    <label>الاسم الكامل</label>
                                    <input type="text" id="order-name" class="form-control" placeholder="الاسم" required>
                                </div>
                                <div class="form-group">
                                    <label>رقم الهاتف</label>
                                    <input type="tel" id="order-phone" class="form-control" placeholder="06XXXXXXXX" required>
                                </div>
                                <div class="form-group">
                                    <label>العنوان / المدينة</label>
                                    <input type="text" id="order-address" class="form-control" placeholder="العنوان" required>
                                </div>
                                <div class="form-group">
                                    <label>الكمية</label>
                                    <input type="number" id="order-qty" class="form-control" value="1" min="1" required>
                                </div>
                                <button type="submit" class="confirm-btn">
                                    <i class="fab fa-whatsapp"></i> تأكيد الطلب عبر واتساب
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            `;
        }

        // Load Related Products
        loadRelatedProducts(products, product);

    } catch (error) {
        console.error('Error loading product details:', error);
        const container = document.getElementById('details-container');
        if (container) container.innerHTML = '<p class="text-center" style="grid-column:1/-1; padding:50px;">حدث خطأ في تحميل المنتج</p>';
    }
}

function loadRelatedProducts(allProducts, currentProduct) {
    const container = document.getElementById('related-products-container');
    if (!container) return;

    // Filter same category, exclude current
    let related = allProducts.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id);

    // Fallback if not enough
    if (related.length < 3) {
        const others = allProducts.filter(p => p.category !== currentProduct.category);
        related = [...related, ...others];
    }

    // Take top 3
    const toShow = related.slice(0, 3);

    if (toShow.length === 0) {
        document.querySelector('.related-section').style.display = 'none';
        return;
    }

    container.innerHTML = toShow.map(p => createProductCard(p)).join('');
}

function showError(msg) {
    const container = document.getElementById('details-container');
    if (container) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px;">
                <h3 style="color: var(--primary-color);">${msg}</h3>
                <a href="products.html" class="btn" style="margin-top: 20px;">العودة للمنتجات</a>
            </div>
        `;
    }
}
