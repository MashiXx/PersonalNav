// ===== Theme IIFE — runs immediately to prevent flash =====
(function() {
    var stored = localStorage.getItem('pnav-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    window.__pnavTheme = theme;
})();

// ===== DOMContentLoaded =====
document.addEventListener('DOMContentLoaded', function() {

    // --- Theme Toggle ---
    function getTheme() {
        return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('pnav-theme', theme);
        updateThemeIcons(theme);
        updateChartTheme(theme);
    }

    function updateThemeIcons(theme) {
        var suns = document.querySelectorAll('.icon-sun');
        var moons = document.querySelectorAll('.icon-moon');
        suns.forEach(function(el) { el.style.display = theme === 'dark' ? 'none' : 'block'; });
        moons.forEach(function(el) { el.style.display = theme === 'dark' ? 'block' : 'none'; });
    }

    function toggleTheme() {
        setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    }

    // Bind all theme toggle buttons
    document.querySelectorAll('#themeToggle, #themeToggleMobile').forEach(function(btn) {
        btn.addEventListener('click', toggleTheme);
    });

    // Initialize icons
    updateThemeIcons(getTheme());

    // --- Sidebar Mobile Toggle ---
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
    var hamburger = document.getElementById('hamburgerBtn');

    function openSidebar() {
        if (sidebar) sidebar.classList.add('open');
        if (overlay) {
            overlay.style.display = 'block';
            // Force reflow for transition
            overlay.offsetHeight;
            overlay.classList.add('active');
        }
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(function() { overlay.style.display = 'none'; }, 250);
        }
    }

    if (hamburger) hamburger.addEventListener('click', openSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Close sidebar on Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeSidebar();
    });

    // --- Active Sidebar Link ---
    var currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-link').forEach(function(link) {
        var linkPath = link.getAttribute('data-path');
        if (!linkPath) return;
        if (currentPath === linkPath ||
            (currentPath.startsWith(linkPath) && linkPath !== '/dashboard')) {
            link.classList.add('active');
        }
    });

    // --- Auto-dismiss alerts after 5 seconds ---
    document.querySelectorAll('.alert').forEach(function(alert) {
        setTimeout(function() {
            alert.style.opacity = '0';
            setTimeout(function() { alert.remove(); }, 500);
        }, 5000);
    });

    // --- Confirm delete actions ---
    document.querySelectorAll('form[action*="/delete"]').forEach(function(form) {
        form.addEventListener('submit', function(e) {
            if (!confirm('Are you sure you want to delete?')) {
                e.preventDefault();
            }
        });
    });

    // --- Format currency inputs ---
    document.querySelectorAll('input[type="number"]').forEach(function(input) {
        input.addEventListener('blur', function() {
            if (this.value) {
                this.value = parseFloat(this.value).toFixed(2);
            }
        });
    });

    // --- Chart.js theme integration ---
    function updateChartTheme(theme) {
        if (typeof Chart === 'undefined') return;

        var textColor = theme === 'dark' ? '#a1a1aa' : '#52525b';
        var gridColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

        Chart.defaults.color = textColor;
        Chart.defaults.borderColor = gridColor;

        // Update existing chart instances
        Object.keys(Chart.instances || {}).forEach(function(key) {
            var chart = Chart.instances[key];
            if (!chart) return;

            if (chart.options.scales) {
                Object.keys(chart.options.scales).forEach(function(axis) {
                    if (chart.options.scales[axis].ticks) {
                        chart.options.scales[axis].ticks.color = textColor;
                    }
                    if (chart.options.scales[axis].grid) {
                        chart.options.scales[axis].grid.color = gridColor;
                    }
                });
            }
            if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
                chart.options.plugins.legend.labels.color = textColor;
            }
            chart.update('none');
        });
    }

    // Set initial Chart.js defaults
    if (typeof Chart !== 'undefined') {
        var theme = getTheme();
        Chart.defaults.color = theme === 'dark' ? '#a1a1aa' : '#52525b';
        Chart.defaults.borderColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    }
});

// ===== Utility Functions =====
function formatCurrency(value, currency) {
    currency = currency || 'VND';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency
    }).format(value);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN');
}
