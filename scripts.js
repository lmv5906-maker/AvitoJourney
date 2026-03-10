function safeImage(src, alt, classes = '') {
    return `
        <img 
            src="${src}" 
            alt="${alt}" 
            class="${classes}" 
            onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Фото+недоступно'" 
            loading="lazy"
        >
    `;
}

// Функция для загрузки продуктов на главной странице
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        const products = await response.json();
        const productGrid = document.querySelector('.product-grid');

        if (productGrid) {
            productGrid.innerHTML = '';

            products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'product';
                productElement.setAttribute('data-product-id', product.id);
                
                productElement.innerHTML = `
                    <a href="product.html?id=${product.id}" class="product-link">
                        ${safeImage(product.image, product.name, 'product-image')}
                        <div class="title-container">
                            <h3>${product.name}</h3>
                        </div>
                        <p>${product.description}</p>
                        <div class="product-price-preview">
                            <span class="price">${product.price || 'Цена не указана'} ${product.currency || 'Руб.'}</span>
                            <span class="location">📍 ${product.location || 'Местоположение не указано'}</span>
                        </div>
                    </a>
                `;
                
                productGrid.appendChild(productElement);
            });

            // Обработчики кликов по карточкам
            document.querySelectorAll('.product-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const productId = this.closest('.product').getAttribute('data-product-id');
                    window.location.href = `product.html?id=${productId}`;
                });
            });
        }

    } catch (error) {
        console.error('Ошибка загрузки объявлений:', error);
        const productGrid = document.querySelector('.product-grid');
        if (productGrid) {
            productGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <p style="color: #666; font-size: 18px;">Не удалось загрузить объявления. Пожалуйста, попробуйте позже.</p>
                </div>
            `;
        }
    }
}

// Карусель для главной страницы
function initMainCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    const indicatorsContainer = document.getElementById('indicators');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (carouselTrack && indicatorsContainer && prevBtn && nextBtn) {
        const banners = carouselTrack.querySelectorAll('.banner');
        const totalBanners = banners.length;
        let currentIndex = 0;
        let autoPlayInterval;

        function createIndicators() {
            for (let i = 0; i < totalBanners; i++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(i));
                indicatorsContainer.appendChild(dot);
            }
        }

        function goToSlide(index) {
            currentIndex = (index + totalBanners) % totalBanners;
            updateCarousel();
            resetAutoPlay();
        }

        function updateCarousel() {
            document.querySelectorAll('.banner').forEach((banner, index) => {
                banner.classList.remove('left', 'center', 'right');
                
                if (index === currentIndex) {
                    banner.classList.add('center');
                } else if ((index - currentIndex + totalBanners) % totalBanners === 1) {
                    banner.classList.add('right');
                } else if ((index - currentIndex + totalBanners) % totalBanners === totalBanners - 1) {
                    banner.classList.add('left');
                }
            });
            
            document.querySelectorAll('.dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalBanners;
            updateCarousel();
            resetAutoPlay();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalBanners) % totalBanners;
            updateCarousel();
            resetAutoPlay();
        }

        function startAutoPlay() {
            autoPlayInterval = setInterval(nextSlide, 5000);
        }

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            startAutoPlay();
        }

        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);

        createIndicators();
        updateCarousel();
        startAutoPlay();

        carouselTrack.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        carouselTrack.addEventListener('mouseleave', startAutoPlay);
    }
}

// Функция для инициализации кнопки "Наверх"
function initScrollToTop() {
    const scrollToTopBtn = document.querySelector('.scroll-to-top');

    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });

        scrollToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Функция для инициализации поля поиска
function initSearchField() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        const originalPlaceholder = searchInput.placeholder;
        
        searchInput.addEventListener('focus', function() {
            this.classList.add('no-emoji', 'search-focused');
            this.placeholder = originalPlaceholder.replace('🔍 ', '').replace('🔍', '');
        });
        
        searchInput.addEventListener('blur', function() {
            if (this.value === '') {
                this.classList.remove('no-emoji', 'search-focused');
                this.placeholder = originalPlaceholder;
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = this.value.trim();
                if (query) {
                    alert(`Поиск: "${query}"\nВ реальном приложении здесь будет выполнен поиск объявлений.`);
                    this.value = '';
                    this.blur();
                }
            }
        });
    }
}

// Загрузка данных из JSON
async function loadProductData() {
    try {
        const response = await fetch('product.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const productData = await response.json();
        return productData;
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        throw error;
    }
}

// Показ ошибки
function showError(message) {
    const productInfo = document.getElementById('productInfo');
    if (productInfo) {
        productInfo.innerHTML = `
            <div class="error-message">
                <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                <h3>Ошибка загрузки данных</h3>
                <p>${message}</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #228B22; color: white; border: none; border-radius: 25px; cursor: pointer;">
                    Повторить попытку
                </button>
            </div>
        `;
    }
}

// Переменные для полноэкранного просмотра
let currentMediaItems = [];
let currentFullscreenIndex = 0;

// Открыть в полноэкранном режиме
function openFullscreen(index) {
    const modal = document.getElementById('fullscreenModal');
    const modalContent = document.getElementById('modalContent');
    const modalCounter = document.getElementById('modalCounter');
    
    currentFullscreenIndex = index;
    const mediaItem = currentMediaItems[index];
    
    modalContent.innerHTML = '';
    
    if (mediaItem.type === 'image') {
        const img = document.createElement('img');
        img.src = mediaItem.url;
        img.alt = `Фото ${index + 1}`;
        modalContent.appendChild(img);
    } else if (mediaItem.type === 'video') {
        const video = document.createElement('video');
        video.src = mediaItem.url;
        video.controls = true;
        video.autoplay = true;
        modalContent.appendChild(video);
    }
    
    if (modalCounter) {
        modalCounter.textContent = `${index + 1}/${currentMediaItems.length}`;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрыть полноэкранный режим
function closeFullscreen() {
    const modal = document.getElementById('fullscreenModal');
    const modalContent = document.getElementById('modalContent');
    
    const video = modalContent.querySelector('video');
    if (video) video.pause();
    
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Навигация в полноэкранном режиме
function navigateFullscreen(direction) {
    let newIndex = currentFullscreenIndex + direction;
    if (newIndex < 0) newIndex = currentMediaItems.length - 1;
    if (newIndex >= currentMediaItems.length) newIndex = 0;
    openFullscreen(newIndex);
}

// Инициализация карусели медиа
function initProductCarousel(mediaItems) {
    const carouselTrack = document.getElementById('carouselTrack');
    const indicatorsContainer = document.getElementById('indicators');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (!carouselTrack || !indicatorsContainer) return;
    
    currentMediaItems = mediaItems;
    carouselTrack.innerHTML = '';
    
    mediaItems.forEach((mediaItem, index) => {
        const banner = document.createElement('div');
        banner.className = 'banner';
        
        const typeBadge = document.createElement('div');
        typeBadge.className = 'media-type-badge';
        typeBadge.textContent = mediaItem.type === 'video' ? '▶ Видео' : '📷 Фото';
        
        if (mediaItem.type === 'image') {
            banner.innerHTML = safeImage(mediaItem.url, `Фото ${index + 1}`, 'carousel-image');
        } else if (mediaItem.type === 'video') {
            banner.innerHTML = `<video src="${mediaItem.url}" preload="metadata" poster="${mediaItem.thumbnail || ''}"></video>`;
        }
        
        banner.appendChild(typeBadge);
        banner.addEventListener('click', () => openFullscreen(index));
        carouselTrack.appendChild(banner);
    });

    const totalBanners = mediaItems.length;
    let currentIndex = 0;
    let autoPlayInterval;

    function createIndicators() {
        indicatorsContainer.innerHTML = '';
        for (let i = 0; i < totalBanners; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(i));
            indicatorsContainer.appendChild(dot);
        }
    }

    function goToSlide(index) {
        currentIndex = (index + totalBanners) % totalBanners;
        updateCarousel();
        resetAutoPlay();
    }

    function updateCarousel() {
        document.querySelectorAll('.banner').forEach((banner, index) => {
            banner.classList.remove('left', 'center', 'right');
            if (index === currentIndex) banner.classList.add('center');
            else if ((index - currentIndex + totalBanners) % totalBanners === 1) banner.classList.add('right');
            else if ((index - currentIndex + totalBanners) % totalBanners === totalBanners - 1) banner.classList.add('left');
        });

        document.querySelectorAll('.dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalBanners;
        updateCarousel();
        resetAutoPlay();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalBanners) % totalBanners;
        updateCarousel();
        resetAutoPlay();
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    createIndicators();
    updateCarousel();
    startAutoPlay();

    carouselTrack.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    carouselTrack.addEventListener('mouseleave', startAutoPlay);
}

function displayProductData(productData) {
    const productInfo = document.getElementById('productInfo');

    if (productInfo) {
        productInfo.innerHTML = `
            <div class="product-header">
                <h1 class="product-title">${productData.title || 'Название не указано'}</h1>
                <div class="product-price">${productData.price || '0'} ${productData.currency || 'Руб.'}</div>
            </div>
            
            <div class="product-location">
                <div class="location-details">
                    <span>📍 ${productData.location || 'Адрес не указан'}</span>
                    ${productData.distance ? `<span class="distance">• ${productData.distance}</span>` : ''}
                    <a href="#" class="show-map">Показать на карте</a>
                </div>
            </div>
            
            ${productData.tags && productData.tags.length > 0 ? `
            <div class="product-tags">
                ${productData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            ` : ''}
            
            ${productData.description ? `
            <div class="description-section">
                <h3>Описание</h3>
                <div class="description-content">
                    ${productData.description}
                </div>
            </div>
            ` : ''}
        `;

        const showMapBtn = document.querySelector('.show-map');
        if (showMapBtn) {
            showMapBtn.addEventListener('click', function(e) {
                e.preventDefault();
                alert(`Показать на карте: ${productData.location || 'Адрес не указан'}`);
            });
        }
    }

    const seller = productData.seller || {};
    document.getElementById('seller-name').textContent = seller.name || 'Не указано';
    document.getElementById('seller-role').textContent = seller.role || '';
    document.getElementById('seller-clients').textContent = seller.clients || 0;

    const ratingStars = '★'.repeat(Math.round(seller.rating)) + '☆'.repeat(5 - Math.round(seller.rating));
    document.getElementById('seller-rating').innerHTML = `${ratingStars} <span>(${seller.rating || 0})</span>`;

    const reviewsSection = document.querySelector('.reviews-section');
    if (!reviewsSection) return;

    reviewsSection.innerHTML = '<h4>Отзывы</h4>';

    if (!productData.reviews || productData.reviews.length === 0) {
        const noReviews = document.createElement('p');
        noReviews.textContent = 'Пока нет отзывов.';
        reviewsSection.appendChild(noReviews);
        return;
    }

    const reviewsChat = document.createElement('div');
    reviewsChat.className = 'reviews-chat';

    productData.reviews.forEach(review => {
        const message = document.createElement('div');
        message.className = 'review-message';

        const avatarUrl = review.avatar || 'https://via.placeholder.com/60x60?text=👤';

        message.innerHTML = `
            <div class="review-avatar">
                <img src="${avatarUrl}" alt="${review.author}">
            </div>
            <div class="review-content">
                <div class="review-author">${review.author}</div>
                <div class="review-rating">${'★'.repeat(Math.round(review.rating))}${'☆'.repeat(5 - Math.round(review.rating))}</div>
                <div class="review-text">«${review.text}»</div>
                <div class="review-actions">
                    <button class="review-like" data-review-id="${review.id}"></button>
                    <span style="color: #aaa; font-size: 11px;">${review.date}</span>
                </div>
            </div>
        `;
        reviewsChat.appendChild(message);
    });

    reviewsSection.appendChild(reviewsChat);

    const likeButtons = reviewsSection.querySelectorAll('.review-like');
    likeButtons.forEach(btn => {
        const id = btn.dataset.reviewId;
        const liked = localStorage.getItem(`like_${id}`) === 'true';
        if (liked) btn.classList.add('liked');

        btn.addEventListener('click', () => {
            if (btn.classList.contains('liked')) {
                btn.classList.remove('liked');
                localStorage.setItem(`like_${id}`, 'false');
            } else {
                btn.classList.add('liked');
                localStorage.setItem(`like_${id}`, 'true');
            }
        });
    });
}

function initFullscreenModal() {
    const modalClose = document.getElementById('modalClose');
    const modalPrev = document.getElementById('modalPrev');
    const modalNext = document.getElementById('modalNext');
    const modal = document.getElementById('fullscreenModal');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeFullscreen);
    }
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeFullscreen();
            }
        });
    }
    
    if (modalPrev) {
        modalPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateFullscreen(-1);
        });
    }
    
    if (modalNext) {
        modalNext.addEventListener('click', (e) => {
            e.stopPropagation();
            navigateFullscreen(1);
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeFullscreen();
        }
        
        if (modal && modal.classList.contains('active')) {
            if (e.key === 'ArrowLeft') {
                navigateFullscreen(-1);
            } else if (e.key === 'ArrowRight') {
                navigateFullscreen(1);
            }
        }
    });
}

async function initProductPage() {
    try {
        const productData = await loadProductData();
        
        if (productData.media && productData.media.length > 0) {
            initProductCarousel(productData.media);
        } else {
            const productCarousel = document.querySelector('.product-carousel');
            if (productCarousel) {
                productCarousel.style.display = 'none';
            }
        }
        
        initFullscreenModal();
        
        displayProductData(productData);
        
    } catch (error) {
        showError(error.message || 'Не удалось загрузить данные объявления');
        
        const productCarousel = document.querySelector('.product-carousel');
        if (productCarousel) {
            productCarousel.style.display = 'none';
        }
    }
}

// === Функции для обработки лайков отзывов ===
function initReviewLikes() {
    const likeButtons = document.querySelectorAll('.review-like');
    likeButtons.forEach(btn => {
        const id = btn.dataset.reviewId;
        const liked = localStorage.getItem(`like_${id}`) === 'true';
        if (liked) {
            btn.classList.add('liked');
            btn.setAttribute('aria-label', 'Убрать лайк');
            btn.setAttribute('title', 'Убрать лайк');
        }
        
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (btn.classList.contains('liked')) {
                btn.classList.remove('liked');
                btn.setAttribute('aria-label', 'Нравится');
                btn.setAttribute('title', 'Поставить лайк');
                localStorage.setItem(`like_${id}`, 'false');
            } else {
                btn.classList.add('liked');
                btn.setAttribute('aria-label', 'Убрать лайк');
                btn.setAttribute('title', 'Убрать лайк');
                localStorage.setItem(`like_${id}`, 'true');
            }
        });
    });
}

// === Система бронирования времени ===
let selectedTimeSlot = null;
let currentProductId = null;

// Инициализация системы бронирования
function initBookingSystem() {
    const bookingSection = document.getElementById('bookingSection');
    const bookingDateInput = document.getElementById('bookingDate');
    const bookingTimeGrid = document.getElementById('bookingTimeGrid');
    const bookingConfirm = document.getElementById('bookingConfirm');
    const bookingSubmitBtn = document.getElementById('bookingSubmitBtn');
    const selectedTimeText = document.getElementById('selectedTimeText');

    if (!bookingSection || !bookingDateInput || !bookingTimeGrid) return;

    // Получаем ID продукта из URL
    const urlParams = new URLSearchParams(window.location.search);
    currentProductId = urlParams.get('id');

    // Показываем секцию бронирования
    bookingSection.style.display = 'block';

    // Устанавливаем минимальную дату (сегодня)
    const today = new Date().toISOString().split('T')[0];
    bookingDateInput.min = today;
    bookingDateInput.value = today;

    // Загружаем доступное время при изменении даты
    bookingDateInput.addEventListener('change', () => {
        loadAvailableTimes(bookingDateInput.value);
    });

    // Загружаем время при первой загрузке
    loadAvailableTimes(today);

    // Обработчик кнопки подтверждения
    if (bookingSubmitBtn) {
        bookingSubmitBtn.addEventListener('click', () => {
            submitBooking();
        });
    }
}

// Загрузка доступного времени из БД (заглушка для подключения БД)
async function loadAvailableTimes(date) {
    const bookingTimeGrid = document.getElementById('bookingTimeGrid');
    const bookingConfirm = document.getElementById('bookingConfirm');

    if (!bookingTimeGrid) return;

    bookingTimeGrid.innerHTML = '<div class="loading-times">Загрузка доступного времени...</div>';
    if (bookingConfirm) bookingConfirm.style.display = 'none';
    selectedTimeSlot = null;

    try {
        // TODO: Подключи здесь загрузку из БД
        // Пример: const response = await fetch(`/api/available-times?productId=${currentProductId}&date=${date}`);
        // const availableTimes = await response.json();

        // Временные данные для демонстрации (удали после подключения БД)
        const availableTimes = await getMockAvailableTimes(date);

        bookingTimeGrid.innerHTML = '';

        if (availableTimes.length === 0) {
            bookingTimeGrid.innerHTML = '<div class="loading-times">Нет доступного времени на эту дату</div>';
            return;
        }

        availableTimes.forEach(time => {
            const slot = document.createElement('div');
            slot.className = `time-slot ${time.booked ? 'booked' : ''}`;
            slot.textContent = time.time;
            slot.dataset.time = time.time;
            slot.dataset.booked = time.booked;

            if (!time.booked) {
                slot.addEventListener('click', () => selectTimeSlot(slot, time.time));
            }

            bookingTimeGrid.appendChild(slot);
        });

    } catch (error) {
        console.error('Ошибка загрузки времени:', error);
        bookingTimeGrid.innerHTML = '<div class="loading-times">Ошибка загрузки времени</div>';
    }
}

// Получение доступного времени (MOCK-данные - удали после подключения БД)
async function getMockAvailableTimes(date) {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 300));

    // Генерируем временные слоты с 9:00 до 20:00
    const times = [];
    for (let hour = 9; hour <= 20; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        // Случайным образом помечаем некоторые слоты как забронированные
        const isBooked = Math.random() < 0.3;
        times.push({
            time,
            booked: isBooked
        });
    }
    return times;
}

// Выбор временного слота
function selectTimeSlot(slotElement, time) {
    // Снимаем выделение с предыдущего
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));

    // Выделяем текущий
    slotElement.classList.add('selected');
    selectedTimeSlot = time;

    // Показываем кнопку подтверждения
    const bookingConfirm = document.getElementById('bookingConfirm');
    const selectedTimeText = document.getElementById('selectedTimeText');

    if (bookingConfirm && selectedTimeText) {
        const bookingDateInput = document.getElementById('bookingDate');
        selectedTimeText.textContent = `${bookingDateInput.value} в ${time}`;
        bookingConfirm.style.display = 'block';
    }
}

// Подтверждение бронирования
async function submitBooking() {
    const bookingDateInput = document.getElementById('bookingDate');
    const bookingSubmitBtn = document.getElementById('bookingSubmitBtn');

    if (!selectedTimeSlot || !bookingDateInput.value) return;

    bookingSubmitBtn.disabled = true;
    bookingSubmitBtn.textContent = 'Бронирование...';

    try {
        // TODO: Подключи здесь отправку данных в БД
        // Пример: const response = await fetch('/api/book', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         productId: currentProductId,
        //         date: bookingDateInput.value,
        //         time: selectedTimeSlot
        //     })
        // });

        // Имитация задержки
        await new Promise(resolve => setTimeout(resolve, 500));

        // Успешное бронирование
        alert(`✅ Бронирование подтверждено!\nДата: ${bookingDateInput.value}\nВремя: ${selectedTimeSlot}`);

        // Перезагружаем доступное время
        loadAvailableTimes(bookingDateInput.value);

    } catch (error) {
        console.error('Ошибка бронирования:', error);
        alert('❌ Ошибка при бронировании. Попробуйте ещё раз.');
    } finally {
        bookingSubmitBtn.disabled = false;
        bookingSubmitBtn.textContent = 'Подтвердить бронирование';
    }
}

// === Функции для формы отзыва ===
function initReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    const ratingStars = document.getElementById('ratingStars');
    
    if (!reviewForm || !ratingStars) return;
    
    let selectedRating = 5;
    
    ratingStars.querySelectorAll('span').forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-value'));
            updateStars();
            document.getElementById('rating').value = selectedRating;
        });
        
        star.addEventListener('mouseover', function() {
            const value = parseInt(this.getAttribute('data-value'));
            ratingStars.querySelectorAll('span').forEach(s => {
                s.classList.toggle('active', parseInt(s.getAttribute('data-value')) <= value);
            });
        });
        
        star.addEventListener('mouseout', () => {
            updateStars();
        });
    });
    
    function updateStars() {
        ratingStars.querySelectorAll('span').forEach(s => {
            s.classList.toggle('active', parseInt(s.getAttribute('data-value')) <= selectedRating);
        });
    }
    
    updateStars();
    
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const author = document.getElementById('author').value.trim();
        const rating = document.getElementById('rating').value;
        const text = document.getElementById('reviewText').value.trim();
        
        const newReview = {
            id: Date.now(),
            author: author,
            rating: parseInt(rating),
            text: text,
            date: new Date().toLocaleString('ru-RU', { month: 'long', year: 'numeric' }),
            avatar: 'https://via.placeholder.com/60x60?text=👤'
        };
        
        const reviewsChat = document.querySelector('.reviews-chat');
        if (reviewsChat) {
            const message = document.createElement('div');
            message.className = 'review-message';
            
            message.innerHTML = `
                <div class="review-avatar">
                    <img src="${newReview.avatar}" alt="${newReview.author}">
                </div>
                <div class="review-content">
                    <div class="review-author">${newReview.author}</div>
                    <div class="review-rating">${'★'.repeat(newReview.rating)}${'☆'.repeat(5 - newReview.rating)}</div>
                    <div class="review-text">«${newReview.text}»</div>
                    <div class="review-actions">
                        <button class="review-like" data-review-id="${newReview.id}"></button>
                        <span style="color: #aaa; font-size: 11px;">${newReview.date}</span>
                    </div>
                </div>
            `;
            
            reviewsChat.prepend(message);
            
            const likeBtn = message.querySelector('.review-like');
            likeBtn.addEventListener('click', function() {
                this.classList.toggle('liked');
                const id = this.dataset.reviewId;
                localStorage.setItem(`like_${id}`, this.classList.contains('liked') ? 'true' : 'false');
            });
        }
        
        reviewForm.reset();
        selectedRating = 5;
        updateStars();
        document.getElementById('rating').value = 5;
        
        alert('Спасибо за отзыв!');
    });
}

// === Функция для sticky колонки ===
function initStickyColumn() {
    const rightColumn = document.querySelector('.product-detail-right');
    if (!rightColumn) return;
    
    window.addEventListener('scroll', function() {
        if (window.innerWidth > 1200) {
            const scrollTop = window.pageYOffset;
            const pageTop = document.querySelector('.product-detail-page').offsetTop;
            
            if (scrollTop > pageTop + 100) {
                rightColumn.classList.add('sticky');
            } else {
                rightColumn.classList.remove('sticky');
            }
        }
    });
}

// === Основная инициализация ===
document.addEventListener('DOMContentLoaded', function() {
    initScrollToTop();
    initSearchField();

    if (document.querySelector('.product-grid')) {
        loadProducts();
        initMainCarousel();
    } else if (document.querySelector('.product-detail-page')) {
        initProductPage();
        initReviewLikes();
        initReviewForm();
        initStickyColumn();
        initBookingSystem();
        initFavoriteButton();
    } else if (document.querySelector('.page-user')) {
        initUserPage();
    }
});

// === Система избранных объявлений ===
const FAVORITES_STORAGE_KEY = 'favorites';

// Получение списка избранных
function getFavorites() {
    const favorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return favorites ? JSON.parse(favorites) : [];
}

// Добавление в избранное
function addToFavorites(product) {
    const favorites = getFavorites();
    if (!favorites.find(f => f.id === product.id)) {
        favorites.push(product);
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
}

// Удаление из избранного
function removeFromFavorites(productId) {
    const favorites = getFavorites();
    // Преобразуем productId к числу для корректного сравнения
    const productIdNum = parseInt(productId);
    const filtered = favorites.filter(f => parseInt(f.id) !== productIdNum);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(filtered));
    console.log('Избранное после удаления:', filtered);
}

// Проверка, есть ли товар в избранном
function isFavorite(productId) {
    const favorites = getFavorites();
    return favorites.some(f => f.id === productId);
}

// Инициализация кнопки избранного на странице продукта
function initFavoriteButton() {
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (!favoriteBtn) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) return;

    // Проверяем, есть ли товар в избранном
    updateFavoriteButton(productId);

    favoriteBtn.addEventListener('click', async () => {
        // Загружаем данные продукта если их нет
        let product = await loadProductData();
        product.id = parseInt(productId);

        if (isFavorite(productId)) {
            removeFromFavorites(productId);
            updateFavoriteButton(productId, false);
        } else {
            addToFavorites(product);
            updateFavoriteButton(productId, true);
        }
    });
}

// Обновление состояния кнопки
function updateFavoriteButton(productId, isFav = null) {
    const favoriteBtn = document.getElementById('favoriteBtn');
    const favoriteIcon = favoriteBtn?.querySelector('.favorite-icon');
    const favoriteText = favoriteBtn?.querySelector('.favorite-text');

    if (!favoriteBtn) return;

    const favorite = isFav !== null ? isFav : isFavorite(productId);

    if (favorite) {
        favoriteBtn.classList.add('active');
        favoriteIcon.textContent = '❤';
        favoriteText.textContent = 'В избранном';
    } else {
        favoriteBtn.classList.remove('active');
        favoriteIcon.textContent = '☆';
        favoriteText.textContent = 'В избранное';
    }
}

// Инициализация страницы пользователя
function initUserPage() {
    initUserTabs();
    loadFavorites();
}

// Инициализация вкладок
function initUserTabs() {
    const tabLinks = document.querySelectorAll('.page-user .sidebar a[data-tab]');
    const tabContents = document.querySelectorAll('.page-user .tab-content');

    // Показываем первую вкладку по умолчанию
    if (tabContents.length > 0) {
        tabContents[0].classList.add('active');
    }
    if (tabLinks.length > 0) {
        tabLinks[0].classList.add('active');
    }

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.dataset.tab;

            // Скрываем все вкладки
            tabContents.forEach(content => content.classList.remove('active'));
            tabLinks.forEach(l => l.classList.remove('active'));

            // Показываем выбранную
            const targetTab = document.getElementById(`tab-${tabId}`);
            if (targetTab) {
                targetTab.classList.add('active');
                link.classList.add('active');

                // Загружаем контент вкладки
                if (tabId === 'favorites') {
                    loadFavorites();
                }
            }
        });
    });
}

// Загрузка избранных объявлений
async function loadFavorites() {
    const favoritesGrid = document.getElementById('favoritesGrid');
    if (!favoritesGrid) return;

    const favorites = getFavorites();

    if (favorites.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="empty-favorites">
                <h3>❤️ В избранном пока пусто</h3>
                <p>Добавляйте объявления в избранное, чтобы быстро находить их позже</p>
                <a href="index.html" class="back-button" style="display: inline-block; margin-top: 15px;">Перейти к объявлениям</a>
            </div>
        `;
        return;
    }

    // Загружаем все продукты для получения актуальных данных
    try {
        const response = await fetch('products.json');
        const allProducts = await response.json();

        // Фильтруем только избранные
        const favoriteProducts = allProducts.filter(p => favorites.some(f => f.id === p.id));

        if (favoriteProducts.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="empty-favorites">
                    <h3>❤️ В избранном пока пусто</h3>
                    <p>Добавляйте объявления в избранное, чтобы быстро находить их позже</p>
                    <a href="index.html" class="back-button" style="display: inline-block; margin-top: 15px;">Перейти к объявлениям</a>
                </div>
            `;
            return;
        }

        favoritesGrid.innerHTML = '';
        favoriteProducts.forEach(product => {
            const favoriteItem = document.createElement('div');
            favoriteItem.className = 'favorite-item';
            favoriteItem.setAttribute('data-product-id', product.id);
            favoriteItem.innerHTML = `
                <a href="product.html?id=${product.id}" class="product-link">
                    ${safeImage(product.image, product.name)}
                    <div class="favorite-item-info">
                        <h4 class="favorite-item-title">${product.name}</h4>
                        <div class="favorite-item-price">${product.price || 'Цена не указана'} ${product.currency || 'Руб.'}</div>
                        <div class="favorite-item-location">📍 ${product.location || 'Местоположение не указано'}</div>
                    </div>
                </a>
                <button class="favorite-item-remove" data-product-id="${product.id}">Удалить из избранного</button>
            `;
            favoritesGrid.appendChild(favoriteItem);
        });

        // Обработчики кнопок удаления
        document.querySelectorAll('.favorite-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                const productId = btn.dataset.productId;
                console.log('Удаление продукта:', productId);
                
                // Находим элемент и добавляем класс анимации
                const itemElement = document.querySelector(`.favorite-item[data-product-id="${productId}"]`);
                if (itemElement) {
                    itemElement.classList.add('removing');
                    
                    // Ждём окончания анимации и удаляем
                    setTimeout(() => {
                        itemElement.remove();
                        
                        // Проверяем, осталось ли что-то в избранном
                        const remainingFavorites = getFavorites();
                        if (remainingFavorites.length === 0) {
                            loadFavorites(); // Перезагружаем чтобы показать пустое состояние
                        }
                    }, 300);
                }
                
                // Удаляем из localStorage
                removeFromFavorites(productId);
                
                // Обновляем кнопку на странице продукта если открыта
                updateFavoriteButton(productId, false);
            });
        });

    } catch (error) {
        console.error('Ошибка загрузки избранных:', error);
        favoritesGrid.innerHTML = '<div class="loading-favorites">Ошибка загрузки избранных объявлений</div>';
    }
}

// Функция безопасного отображения изображения (глобальная)
window.safeImage = function(src, alt, classes = '') {
    return `
        <img
            src="${src}"
            alt="${alt}"
            class="${classes}"
            onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Фото+недоступно'"
            loading="lazy"
        >
    `;
};
