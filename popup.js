document.addEventListener('DOMContentLoaded', () => {
    const colorGrid = document.getElementById('color-grid');
    const colors = ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#64748b'];

    colors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.addEventListener('click', () => {
            // When a color is clicked, send a message to the background script
            chrome.runtime.sendMessage({ type: 'changeFavicon', color: color });
        });
        colorGrid.appendChild(swatch);
    });
});

