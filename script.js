// Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Make showNotification global so it can be called from HTML onclick
window.showNotification = showNotification;
window.toggleCourseText = toggleCourseText;

// Global variables for carousel
let loop;
let draggable;
let currentSpeed = 1;

// Main initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page with a fade-in effect
    setTimeout(() => {
        document.getElementById('mainContent').classList.add('visible');
    }, 300);

    // Initialize components
    initInfiniteCarousel();
    initNavigationButtons();
    initVideoButtons();
    initRegistrationSystem();
    initReadMoreButtons();
});

// GSAP Infinite Carousel Implementation
function initInfiniteCarousel() {
    const track = document.querySelector('.courses-track');
    const cards = gsap.utils.toArray('.course-card');
    
    if (!track || cards.length === 0) return;

    // Duplicate courses for seamless loop
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });

    // Duplicate again for triple set to ensure seamless loop
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });

    const allCards = gsap.utils.toArray('.course-card');
    
    // Set up the horizontal loop with consistent speed
    loop = horizontalLoop(allCards, {
        paused: false,
        repeat: -1,
        speed: 0.5, // Slower, more consistent speed
        snap: false,
        paddingRight: 32, // gap between cards
        ease: "none" // Linear movement for consistency
    });

    // Initialize Draggable for user interaction
    initDraggable(track, allCards);
    
    // Initialize carousel controls (only reverse button now)
    
    // Re-initialize registration buttons for cloned cards
    initRegistrationSystem();
    initReadMoreButtons();
}

// Horizontal Loop Function (Based on GSAP's horizontalLoop)
function horizontalLoop(items, config) {
    items = gsap.utils.toArray(items);
    config = config || {};
    
    let onChange = config.onChange,
        lastIndex = 0,
        tl = gsap.timeline({
            repeat: config.repeat,
            paused: config.paused,
            defaults: { ease: "none" },
            onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)
        }),
        length = items.length,
        startX = items[0].offsetLeft,
        times = [],
        widths = [],
        spaceBefore = [],
        xPercents = [],
        curIndex = 0,
        indexIsDirty = false,
        center = config.center,
        pixelsPerSecond = (config.speed || 1) * 100,
        snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1),
        timeOffset = 0,
        container = center === true ? items[0].parentNode : gsap.utils.toArray(center)[0] || items[0].parentNode,
        totalWidth,
        getTotalWidth = () => items[length - 1].offsetLeft + xPercents[length - 1] / 100 * widths[length - 1] - startX + spaceBefore[0] + items[length - 1].offsetWidth * gsap.getProperty(items[length - 1], "scaleX") + (parseFloat(config.paddingRight) || 0),
        populateWidths = () => {
            let b1 = container.getBoundingClientRect(), b2;
            items.forEach((el, i) => {
                widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
                xPercents[i] = snap(parseFloat(gsap.getProperty(el, "x", "px")) / widths[i] * 100 + gsap.getProperty(el, "xPercent"));
                b2 = el.getBoundingClientRect();
                spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
                b1 = b2;
            });
            gsap.set(items, {
                xPercent: i => xPercents[i]
            });
            totalWidth = getTotalWidth();
        },
        timeWrap,
        populateOffsets = () => {
            timeOffset = center ? tl.duration() * (container.getBoundingClientRect().width / 2) / totalWidth : 0;
            center && times.forEach((t, i) => {
                times[i] = timeWrap(tl.labels["label" + i] + tl.duration() - timeOffset);
            });
        },
        getClosest = (values, value, wrap) => {
            let i = values.length,
                closest = 1e10,
                index = 0, d;
            while (i--) {
                d = Math.abs(values[i] - value);
                if (d > wrap / 2) {
                    d = wrap - d;
                }
                if (d < closest) {
                    closest = d;
                    index = i;
                }
            }
            return index;
        },
        populateTimeline = () => {
            let i, item, curX, distanceToStart, distanceToLoop;
            tl.clear();
            for (i = 0; i < length; i++) {
                item = items[i];
                curX = xPercents[i] / 100 * widths[i];
                distanceToStart = item.offsetLeft + curX - startX;
                distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
                
                // Use consistent duration calculation
                let duration = distanceToLoop / pixelsPerSecond;
                let loopBackDuration = (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond;
                
                tl.to(item, {
                    xPercent: snap((curX - distanceToLoop) / widths[i] * 100),
                    duration: duration,
                    ease: "none" // Linear easing for consistent speed
                }, 0)
                .fromTo(item, {
                    xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)
                }, {
                    xPercent: xPercents[i],
                    duration: loopBackDuration,
                    ease: "none", // Linear easing for consistent speed
                    immediateRender: false
                }, duration)
                .add("label" + i, distanceToStart / pixelsPerSecond);
                times[i] = distanceToStart / pixelsPerSecond;
            }
            timeWrap = gsap.utils.wrap(0, tl.duration());
        },
        refresh = (deep) => {
            let progress = tl.progress();
            tl.progress(0);
            populateWidths();
            deep && populateTimeline();
            populateOffsets();
            deep && tl.draggable && tl.draggable.update();
            tl.progress(progress);
            return tl;
        },
        onResize = () => refresh(true),
        proxy;

    gsap.set(items, { x: 0 });
    populateWidths();
    populateTimeline();
    populateOffsets();
    refresh();

    window.addEventListener("resize", onResize);

    tl.toIndex = (index, vars) => {
        vars = vars || {};
        (Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length);
        let newIndex = gsap.utils.wrap(0, length, index),
            time = times[newIndex];
        if (time > tl.time() !== index > curIndex && index !== curIndex) {
            time += tl.duration() * (index > curIndex ? 1 : -1);
        }
        if (time < 0 || time > tl.duration()) {
            vars.modifiers = { time: timeWrap };
        }
        curIndex = newIndex;
        vars.overwrite = true;
        gsap.killTweensOf(proxy);
        return vars.duration === 0 ? tl.time(timeWrap(time)) : tl.tweenTo(time, vars);
    };

    tl.refresh = refresh;
    tl.times = times;
    tl.progress(1).progress(0);
    config.reversed && tl.vars.onReverseComplete();
    onChange && tl.vars.onUpdate(tl);

    return tl;
}

// Initialize Draggable functionality
function initDraggable(track, items) {
    if (!track || !items.length) return;

    draggable = Draggable.create(track, {
        type: "x",
        inertia: true,
        snap: {
            x: (value) => {
                return Math.round(value / (items[0].offsetWidth + 32)) * (items[0].offsetWidth + 32);
            }
        },
        onDrag: function() {
            if (loop) {
                loop.pause();
            }
        },
        onThrowUpdate: function() {
            if (loop && loop.paused()) {
                const progress = -this.x / (items.length * (items[0].offsetWidth + 32));
                loop.progress(progress);
            }
        },
        onThrowComplete: function() {
            if (loop) {
                loop.resume();
            }
        }
    })[0];
}

// Initialize carousel controls (simplified - only reverse button)
function initCarouselControls() {
    const reverseBtn = document.querySelector('.reverse-carousel');

    // Reverse button functionality
    if (reverseBtn) {
        reverseBtn.addEventListener('click', () => {
            if (loop) {
                loop.reversed(!loop.reversed());
                showNotification(loop.reversed() ? 'რევერს რეჟიმი' : 'ნორმალური რეჟიმი', 'info');
            }
        });
    }
}

// Registration System (keeping original functionality)
function initRegistrationSystem() {
    const modal = document.getElementById('registrationModal');
    const form = document.getElementById('registrationForm');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.querySelector('.btn-cancel');
    const registrationButtons = document.querySelectorAll('[data-course]');

    // Open modal when registration button is clicked
    registrationButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const courseName = this.getAttribute('data-course');
            openRegistrationModal(courseName);
        });
    });

    // Close modal events
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Handle form submission
    if (form) form.addEventListener('submit', handleRegistration);

    function openRegistrationModal(courseName) {
        const courseInput = document.getElementById('courseName');
        if (courseInput) courseInput.value = courseName;
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                if (form) form.reset();
            }, 300);
        }
    }

    async function handleRegistration(e) {
        e.preventDefault();
        
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
        
        const formData = new FormData(form);
        const registrationData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            reason: formData.get('reason') || '',
            course_name: formData.get('course_name')
        };

        try {
            const response = await fetch(`${API_BASE_URL}/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });

            const result = await response.json();
            
            if (loadingOverlay) loadingOverlay.style.display = 'none';

            if (response.ok && result.success) {
                showNotification(`წარმატებით დარეგისტრირდით კურსზე: ${registrationData.course_name}`, 'success');
                closeModal();
                
                setTimeout(() => {
                    showNotification('რეგისტრაციის დეტალები გამოიგზავნა თქვენს ელ-ფოსტაზე', 'info');
                }, 2000);
                
            } else {
                const errorMessage = result.message || 'რეგისტრაცია ვერ მოხერხდა';
                showNotification(errorMessage, 'error');
            }

        } catch (error) {
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            console.error('Registration error:', error);
            showNotification('კავშირის შეცდომა. სცადეთ მოგვიანებით.', 'error');
        }
    }
}

// Navigation buttons functionality
function initNavigationButtons() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!button.classList.contains('disabled')) {
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                if (!button.classList.contains('active')) {
                    showNotification('ეს სექცია მალე დაემატება', 'info');
                }
            }
        });
    });
}

// Video play buttons functionality
function initVideoButtons() {
    const playButtons = document.querySelectorAll('.play-btn');
    
    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.course-card');
            const courseTitle = card.querySelector('h3').textContent;
            showNotification(`ვიდეო დემო: ${courseTitle}`, 'info');
        });
    });
}

// Initialize read more buttons
function initReadMoreButtons() {
    const readMoreButtons = document.querySelectorAll('.read-more-btn');
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleCourseText(this);
        });
    });
}

// Toggle course text visibility
function toggleCourseText(button) {
    const courseContent = button.closest('.course-description');
    const features = courseContent.querySelector('.course-features');
    const cta = courseContent.querySelector('.course-cta');
    const bundleBenefits = courseContent.querySelector('.bundle-benefits');
    const bundleDetails = courseContent.querySelector('.bundle-details-collapsed');
    
    // Toggle button state
    button.classList.toggle('expanded');
    
    // Update icon and text
    const icon = button.querySelector('i');
    if (button.classList.contains('expanded')) {
        icon.className = 'fas fa-chevron-up';
        button.innerHTML = '<i class="fas fa-chevron-up"></i> ნაკლების ნახვა';
        
        // Show all content
        if (features) {
            features.classList.remove('course-features-collapsed');
            features.classList.add('course-features-expanded');
        }
        if (cta) {
            cta.classList.remove('course-cta-collapsed');
            cta.classList.add('course-cta-expanded');
        }
        if (bundleBenefits) {
            bundleBenefits.classList.remove('bundle-benefits-collapsed');
            bundleBenefits.classList.add('bundle-benefits-expanded');
        }
        if (bundleDetails) {
            bundleDetails.classList.remove('bundle-details-collapsed');
            bundleDetails.classList.add('bundle-details-expanded');
        }
    } else {
        icon.className = 'fas fa-chevron-down';
        button.innerHTML = '<i class="fas fa-chevron-down"></i> სრულად ნახვა';
        
        // Hide additional content
        if (features) {
            features.classList.remove('course-features-expanded');
            features.classList.add('course-features-collapsed');
        }
        if (cta) {
            cta.classList.remove('course-cta-expanded');
            cta.classList.add('course-cta-collapsed');
        }
        if (bundleBenefits) {
            bundleBenefits.classList.remove('bundle-benefits-expanded');
            bundleBenefits.classList.add('bundle-benefits-collapsed');
        }
        if (bundleDetails) {
            bundleDetails.classList.remove('bundle-details-expanded');
            bundleDetails.classList.add('bundle-details-collapsed');
        }
    }
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    let icon = 'fas fa-info-circle';
    let bgColor = 'rgba(186, 85, 211, 0.9)';
    
    switch(type) {
        case 'success':
            icon = 'fas fa-check-circle';
            bgColor = 'rgba(76, 175, 80, 0.9)';
            break;
        case 'error':
            icon = 'fas fa-exclamation-circle';
            bgColor = 'rgba(244, 67, 54, 0.9)';
            break;
        case 'warning':
            icon = 'fas fa-exclamation-triangle';
            bgColor = 'rgba(255, 152, 0, 0.9)';
            break;
    }
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: bgColor,
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        zIndex: '10000',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        fontWeight: '500',
        backdropFilter: 'blur(10px)',
        transform: 'translateY(100px)',
        opacity: '0',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateY(0)';
        notification.style.opacity = '1';
    }, 10);
    
    const duration = Math.max(3000, message.length * 50);
    setTimeout(() => {
        notification.style.transform = 'translateY(100px)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// Add escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('registrationModal');
        if (modal && modal.style.display === 'block') {
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) closeBtn.click();
        }
    }
});

// Form validation helpers
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[0-9]{9,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Add real-time form validation
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    if (form) {
        const emailInput = form.querySelector('#email');
        const phoneInput = form.querySelector('#phone');
        
        emailInput?.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.style.borderColor = '#f44336';
                showNotification('გთხოვთ შეიყვანოთ სწორი ელ-ფოსტის მისამართი', 'warning');
            } else {
                this.style.borderColor = '';
            }
        });
        
        phoneInput?.addEventListener('blur', function() {
            if (this.value && !validatePhone(this.value)) {
                this.style.borderColor = '#f44336';
                showNotification('გთხოვთ შეიყვანოთ სწორი ტელეფონის ნომერი', 'warning');
            } else {
                this.style.borderColor = '';
            }
        });
    }
});

// Handle window resize for carousel
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (loop) {
            loop.refresh(true);
        }
    }, 250);
});

// Pause carousel on tab visibility change
document.addEventListener('visibilitychange', () => {
    if (loop) {
        if (document.hidden) {
            loop.pause();
        } else {
            loop.resume();
        }
    }
});