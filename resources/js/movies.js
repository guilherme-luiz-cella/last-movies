/**
 * Movies Page JavaScript - Netflix Style Interactions
 */

document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    initNotifications();
    initMovieCards();
    initLazyLoading();
});

/**
 * Header scroll effect
 */
function initHeader() {
    const header = document.getElementById("header");

    if (!header) return;

    let lastScroll = 0;

    window.addEventListener("scroll", () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.classList.add("header-scrolled");
        } else {
            header.classList.remove("header-scrolled");
        }

        lastScroll = currentScroll;
    });
}

/**
 * Auto-hide notifications/alerts
 */
function initNotifications() {
    const alerts = document.querySelectorAll(
        ".alert-success, .alert-error, .alert-info",
    );

    alerts.forEach((alert) => {
        setTimeout(() => {
            alert.style.transition = "opacity 0.5s ease, transform 0.5s ease";
            alert.style.opacity = "0";
            alert.style.transform = "translateY(-10px)";

            setTimeout(() => {
                alert.remove();
            }, 500);
        }, 5000);
    });
}

/**
 * Movie card interactions
 */
function initMovieCards() {
    const cards = document.querySelectorAll(".movie-card");

    cards.forEach((card) => {
        // Add ripple effect on click
        card.addEventListener("click", function (e) {
            if (e.target.closest("button") || e.target.closest("form")) {
                return; // Don't trigger for buttons/forms
            }

            const ripple = document.createElement("span");
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            this.style.position = "relative";
            this.style.overflow = "hidden";
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

/**
 * Lazy load images
 */
function initLazyLoading() {
    if ("IntersectionObserver" in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute("data-src");
                    }
                    img.classList.add("loaded");
                    observer.unobserve(img);
                }
            });
        });

        const images = document.querySelectorAll("img[data-src]");
        images.forEach((img) => imageObserver.observe(img));
    }
}

/**
 * Confirm delete action
 */
function confirmDelete(movieTitle) {
    return confirm(
        `Tem certeza que deseja remover "${movieTitle}" da sua lista?`,
    );
}

/**
 * Toggle movie status with animation
 */
function toggleStatus(form) {
    const button = form.querySelector("button");
    const originalContent = button.innerHTML;

    button.disabled = true;
    button.innerHTML =
        '<svg class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';

    // Submit form
    form.submit();
}

// Add ripple animation style
const style = document.createElement("style");
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Export functions for use in inline handlers
window.confirmDelete = confirmDelete;
window.toggleStatus = toggleStatus;
