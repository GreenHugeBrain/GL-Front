document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const mainContent = document.getElementById('mainContent');
    const coursesBtn = document.getElementById('coursesBtn');
    const masterclassBtn = document.getElementById('masterclassBtn');
    const coursesSection = document.getElementById('coursesSection');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const coursesWrapper = document.querySelector('.courses-wrapper');
    const courseCards = document.querySelectorAll('.course-card');
    
    let currentSlide = 0;

    // პირდაპირ ვაჩვენოთ კონტენტი
    mainContent.classList.add('visible');

    // Courses Slider Logic
    function updateSlider() {
        const cardWidth = courseCards[0].offsetWidth + 32; // card width + gap
        const offset = -currentSlide * cardWidth;
        courseCards.forEach((card, index) => {
            card.style.transform = `translateX(${offset}px)`;
            card.style.opacity = index === currentSlide ? '1' : '0.6';
            card.style.pointerEvents = index === currentSlide ? 'auto' : 'none';
        });
    }

    function showSlide(index) {
        if (index < 0) {
            currentSlide = courseCards.length - 1;
        } else if (index >= courseCards.length) {
            currentSlide = 0;
        } else {
            currentSlide = index;
        }
        updateSlider();
    }

    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

    // Initialize slider
    if (courseCards.length > 0) {
        courseCards.forEach((card, index) => {
            card.style.position = 'absolute';
            card.style.left = '0';
            card.style.top = '0';
            card.style.width = '100%';
            card.style.transition = 'all 0.5s ease';
        });
        updateSlider();
    }

    // Expand/Collapse Description Logic
    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const descriptionText = this.parentElement.querySelector('.description-text');
            const isExpanded = descriptionText.classList.contains('expanded');
            
            if (isExpanded) {
                descriptionText.classList.remove('expanded');
                this.classList.remove('expanded');
            } else {
                descriptionText.classList.add('expanded');
                this.classList.add('expanded');
            }
        });
    });

    // Register Button Logic
    document.querySelectorAll('.register-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            alert('რეგისტრაციის ფუნქციონალი ჯერ განვითარების ეტაპზეა');
        });
    });

    // Keyboard Navigation
    document.addEventListener('keydown', function(e) {
        if (window.innerWidth > 768) { // Only on desktop
            if (e.key === 'ArrowLeft') {
                showSlide(currentSlide - 1);
            } else if (e.key === 'ArrowRight') {
                showSlide(currentSlide + 1);
            }
        }
    });

    // Smooth scroll to courses when button is clicked
    coursesBtn.addEventListener('click', function() {
        coursesSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });

    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    coursesWrapper.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });

    coursesWrapper.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            showSlide(currentSlide + 1); // Swipe left
        }
        if (touchEndX > touchStartX + 50) {
            showSlide(currentSlide - 1); // Swipe right
        }
    }

    // Auto-play functionality (optional)
    let autoplayInterval;
    
    function startAutoplay() {
        if (window.innerWidth > 768) {
            autoplayInterval = setInterval(() => {
                showSlide(currentSlide + 1);
            }, 5000);
        }
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    coursesWrapper.addEventListener('mouseenter', stopAutoplay);
    coursesWrapper.addEventListener('mouseleave', startAutoplay);

    // Start autoplay after a delay
    setTimeout(() => {
        if (window.innerWidth > 768) {
            startAutoplay();
        }
    }, 2000);

    // Responsive behavior
    function handleResize() {
        if (window.innerWidth <= 768) {
            // On mobile, show all cards vertically
            courseCards.forEach((card, index) => {
                card.style.position = 'relative';
                card.style.transform = 'none';
                card.style.opacity = '1';
                card.style.pointerEvents = 'auto';
                card.style.marginBottom = '2rem';
            });
        } else {
            // On desktop, use slider
            if (courseCards.length > 0) {
                courseCards.forEach((card, index) => {
                    card.style.position = 'absolute';
                    card.style.marginBottom = '0';
                });
                updateSlider();
            }
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on load
});
