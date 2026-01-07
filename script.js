// Windows 95 Simulation Script
// Made with love for nostalgia - feel free to hack around!

let zIndexCounter = 10; // Keep track of window layering
let calcExpression = ''; // Calculator's current expression
let calcResult = 0; // Last calculated result
let openWindows = new Set(); // Track which windows are open
let minimizedWindows = new Set(); // Track minimized windows

// Paint app variables
let paintCanvas, paintCtx;
let currentPaintTool = 'brush';
let isDrawing = false;

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setupWindowDragging();
    setupPaintApp();
    updateClock();
    setInterval(updateClock, 1000);

    // Close start menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#start-button') && !e.target.closest('#start-menu')) {
            document.getElementById('start-menu').style.display = 'none';
        }
    });

    // Prevent right-click context menu (Windows 95 style)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    console.log('Windows 95 simulation loaded! Enjoy the nostalgia.');
});

// Open an application window
function openApp(appName) {
    const windowId = appName + '-window';
    const windowEl = document.getElementById(windowId);

    if (!windowEl) {
        console.error('Window not found:', windowId);
        return;
    }

    // If already open and not minimized, just focus it
    if (openWindows.has(appName) && !minimizedWindows.has(appName)) {
        focusWindow(windowEl);
        return;
    }

    // Show the window
    windowEl.style.display = 'block';
    openWindows.add(appName);
    minimizedWindows.delete(appName);

    // Position randomly if not set
    if (!windowEl.style.left) {
        windowEl.style.left = Math.random() * 200 + 50 + 'px';
        windowEl.style.top = Math.random() * 150 + 50 + 'px';
    }

    focusWindow(windowEl);
    updateTaskbar();
    toggleStartMenu(false);
}

// Close a window
function closeWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    const appName = windowEl.dataset.app;

    windowEl.style.display = 'none';
    windowEl.classList.remove('maximized');
    openWindows.delete(appName);
    minimizedWindows.delete(appName);
    updateTaskbar();
}

// Minimize a window
function minimizeWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    const appName = windowEl.dataset.app;

    windowEl.style.display = 'none';
    minimizedWindows.add(appName);
    updateTaskbar();
}

// Maximize/restore a window
function maximizeWindow(windowId) {
    const windowEl = document.getElementById(windowId);
    windowEl.classList.toggle('maximized');
}

// Focus a window (bring to front)
function focusWindow(windowEl) {
    windowEl.style.zIndex = ++zIndexCounter;
}

// Toggle start menu visibility
function toggleStartMenu(show) {
    const menu = document.getElementById('start-menu');
    if (show === undefined) {
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    } else {
        menu.style.display = show ? 'block' : 'none';
    }
}

// Update taskbar with open/minimized apps
function updateTaskbar() {
    const taskbarApps = document.getElementById('taskbar-apps');
    taskbarApps.innerHTML = '';

    openWindows.forEach(appName => {
        const button = document.createElement('div');
        button.className = 'taskbar-app' + (minimizedWindows.has(appName) ? '' : ' active');
        
        // Add icon
        const iconSrc = getAppIconSrc(appName);
        if (iconSrc) {
            const img = document.createElement('img');
            img.src = iconSrc;
            img.alt = getAppDisplayName(appName);
            button.appendChild(img);
        }
        
        // Add text
        const text = document.createElement('span');
        text.textContent = getAppDisplayName(appName);
        button.appendChild(text);
        
        button.onclick = () => {
            if (minimizedWindows.has(appName)) {
                // Restore
                const windowEl = document.getElementById(appName + '-window');
                windowEl.style.display = 'block';
                minimizedWindows.delete(appName);
                focusWindow(windowEl);
                updateTaskbar();
            } else {
                // Minimize
                minimizeWindow(appName + '-window');
            }
        };
        taskbarApps.appendChild(button);
    });
}

// Get display name for app
function getAppDisplayName(appName) {
    const names = {
        'my-computer': 'My Computer',
        'my-documents': 'My Documents',
        'recycle-bin': 'Recycle Bin',
        'internet-explorer': 'Internet Explorer',
        'calculator': 'Calculator',
        'notepad': 'Notepad',
        'paint': 'Paint'
    };
    return names[appName] || appName;
}

// Get icon src for app
function getAppIconSrc(appName) {
    const iconEl = document.querySelector(`#${appName} img`);
    return iconEl ? iconEl.src : null;
}

// Calculator functions
function calcPress(value) {
    const display = document.getElementById('calc-display');

    if (value === '=') {
        try {
            calcResult = eval(calcExpression.replace(/×/g, '*').replace(/÷/g, '/'));
            display.textContent = calcResult;
            calcExpression = calcResult.toString();
        } catch (e) {
            display.textContent = 'Error';
            calcExpression = '';
            console.log('Calc error:', e);
        }
    } else if (value === 'C') {
        calcExpression = '';
        calcResult = 0;
        display.textContent = '0';
    } else {
        if (display.textContent === '0' || display.textContent === 'Error') {
            display.textContent = value;
        } else {
            display.textContent += value;
        }
        calcExpression = display.textContent;
    }
}

function calcClear() {
    calcPress('C');
}

// Paint app functions
function setupPaintApp() {
    paintCanvas = document.getElementById('paint-canvas');
    if (!paintCanvas) return;

    paintCtx = paintCanvas.getContext('2d');
    paintCtx.fillStyle = 'white';
    paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);

    paintCanvas.addEventListener('mousedown', startDrawing);
    paintCanvas.addEventListener('mousemove', draw);
    paintCanvas.addEventListener('mouseup', stopDrawing);
    paintCanvas.addEventListener('mouseout', stopDrawing);
}

function setPaintTool(tool) {
    currentPaintTool = tool;
    paintCanvas.style.cursor = tool === 'eraser' ? 'grab' : 'crosshair';
}

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;

    const rect = paintCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    paintCtx.lineWidth = currentPaintTool === 'eraser' ? 20 : 2;
    paintCtx.lineCap = 'round';
    paintCtx.strokeStyle = currentPaintTool === 'eraser' ? 'white' : 'black';

    if (currentPaintTool === 'eraser') {
        paintCtx.globalCompositeOperation = 'destination-out';
    } else {
        paintCtx.globalCompositeOperation = 'source-over';
    }

    paintCtx.beginPath();
    paintCtx.moveTo(x, y);
    paintCtx.lineTo(x, y);
    paintCtx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function clearCanvas() {
    paintCtx.fillStyle = 'white';
    paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
}

// Setup window dragging
function setupWindowDragging() {
    document.querySelectorAll('.window').forEach(windowEl => {
        const titlebar = windowEl.querySelector('.window-titlebar');
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        titlebar.addEventListener('mousedown', function(e) {
            if (windowEl.classList.contains('maximized')) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(windowEl.style.left || 0);
            startTop = parseInt(windowEl.style.top || 0);
            focusWindow(windowEl);
        });

        document.addEventListener('mousemove', function(e) {
            if (isDragging && !windowEl.classList.contains('maximized')) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                windowEl.style.left = Math.max(0, startLeft + dx) + 'px';
                windowEl.style.top = Math.max(0, startTop + dy) + 'px';
            }
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
    });
}

// Update the clock
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: '2-digit'
    });
    document.getElementById('taskbar-time').textContent = timeString;
}

// Shutdown function
function shutdown() {
    if (confirm('Are you sure you want to shut down?')) {
        // In a real simulation, maybe fade out or something
        alert('Shutting down... Thanks for using Windows 95!');
        // Could reload the page or something
        // location.reload();
    }
    toggleStartMenu(false);
}

// Some debug helpers (commented out)
// console.log('Debug: Windows open:', openWindows);
// console.log('Debug: Windows minimized:', minimizedWindows);
