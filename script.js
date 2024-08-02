window.addEventListener('load', function() {
    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('show');
        }, index * 200); 
    });
    loadSettings();
});

document.addEventListener('keydown', function(event) {
    var searchInput = document.getElementById('search-input');

    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        searchInput.focus();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const clockToggle = document.getElementById('clock-toggle');
    const secondsToggle = document.getElementById('seconds-toggle');
    const clockWidget = document.getElementById('clock-widget');
    const timeElement = document.getElementById('time');

    function updateClock() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const showSeconds = secondsToggle.checked;
        timeElement.textContent = showSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
    }

    let clockInterval;

    function toggleClockWidget(isVisible) {
        if (isVisible) {
            clockWidget.style.display = 'block';
            updateClock();
            clockInterval = setInterval(updateClock, 1000);
        } else {
            clockWidget.style.display = 'none';
            clearInterval(clockInterval);
        }
    }

    clockToggle.addEventListener('change', () => {
        const isChecked = clockToggle.checked;
        localStorage.setItem('clockWidgetVisible', isChecked);
        toggleClockWidget(isChecked);
    });

    secondsToggle.addEventListener('change', () => {
        localStorage.setItem('clockShowSeconds', secondsToggle.checked);
        updateClock();
    });

    const savedClockWidgetState = localStorage.getItem('clockWidgetVisible');
    if (savedClockWidgetState !== null) {
        const isVisible = JSON.parse(savedClockWidgetState);
        clockToggle.checked = isVisible;
        toggleClockWidget(isVisible);
    }

    const savedClockShowSeconds = localStorage.getItem('clockShowSeconds');
    if (savedClockShowSeconds !== null) {
        secondsToggle.checked = JSON.parse(savedClockShowSeconds);
    }
});

document.querySelector('.weather-widget').addEventListener('mouseenter', function (e) {
    const weatherWidget = e.currentTarget;
    const maxTilt = 10;

    function tilt(event) {
        const rect = weatherWidget.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        const tiltX = (-maxTilt * y) / (rect.height / 2);
        const tiltY = (maxTilt * x) / (rect.width / 2);

        weatherWidget.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }

    function resetTilt() {
        weatherWidget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        weatherWidget.removeEventListener('mousemove', tilt);
    }

    weatherWidget.addEventListener('mousemove', tilt);
    weatherWidget.addEventListener('mouseleave', resetTilt);
});

function saveShortcut(element) {
    let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || {};
    let oldUrl = element.getAttribute('data-old-url');
    if (oldUrl && shortcuts[oldUrl]) {
        delete shortcuts[oldUrl];
    }
    let newUrl = element.getAttribute('data-url');
    newUrl = normalizeUrl(newUrl); 
    let favicon = element.querySelector('img').src;
    shortcuts[newUrl] = favicon;
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
}

function normalizeUrl(url) {
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    return url;
}

function loadShortcuts() {
    let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || {};
    let container = document.querySelector('.shortcuts');
    
    container.innerHTML = ''; 

    let shortcutRows = parseInt(localStorage.getItem('shortcutRows') || '1');
    let maxShortcuts = shortcutRows * 6;

    let rowCount = 0;
    let rowContainer = document.createElement('div');
    rowContainer.classList.add('shortcut-row');
    container.appendChild(rowContainer);

    Object.keys(shortcuts).slice(0, maxShortcuts).forEach((url, index) => {
        if (index % 6 === 0 && index !== 0) {
            rowContainer = document.createElement('div');
            rowContainer.classList.add('shortcut-row');
            container.appendChild(rowContainer);
            rowCount++;
        }
        let element = document.createElement('div');
        element.classList.add('shortcut');
        element.setAttribute('data-url', url);
        element.setAttribute('data-old-url', url); 
        element.innerHTML = `<img src="${shortcuts[url]}" alt="favicon" width="32" height="32">`;
        
        rowContainer.appendChild(element);
        
        element.addEventListener('click', function(event) {
            handleShortcutClick(event, element);
        });
    });

    for (let i = Object.keys(shortcuts).length; i < maxShortcuts; i++) {
        if (i % 6 === 0 && i !== 0) {
            rowContainer = document.createElement('div');
            rowContainer.classList.add('shortcut-row');
            container.appendChild(rowContainer);
            rowCount++;
        }
        let placeholder = document.createElement('div');
        placeholder.classList.add('shortcut');
        placeholder.innerHTML = `<span class="material-icons">add</span>`;
        placeholder.addEventListener('click', function(event) {
            handleShortcutClick(event, placeholder);
        });
        rowContainer.appendChild(placeholder);
    }
}

document.getElementById('shortcut-rows').addEventListener('change', function() {
    const rows = this.value;
    localStorage.setItem('shortcutRows', rows);
    loadShortcuts();
});

function handleShortcutClick(event, element) {
    let url = element.getAttribute('data-url');
    if (url && event.shiftKey) {
        let newUrl = prompt("Enter the new URL:", url);
        if (newUrl) {
            newUrl = normalizeUrl(newUrl); 
            let faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${newUrl}`;
            element.innerHTML = `<img src="${faviconUrl}" alt="favicon" width="32" height="32">`;
            element.setAttribute('data-old-url', url); 
            element.setAttribute('data-url', newUrl);
            saveShortcut(element);
        }
    } else if (url) {
        window.location.href = url;
    } else {
        let newUrl = prompt("Enter the URL:");
        if (newUrl) {
            newUrl = normalizeUrl(newUrl); 
            let faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${newUrl}`;
            element.innerHTML = `<img src="${faviconUrl}" alt="favicon" width="32" height="32">`;
            element.setAttribute('data-url', newUrl); 
            saveShortcut(element);  
        }
    }
}

document.querySelector('.settings-icon').addEventListener('click', function() {
    document.querySelector('.settings-modal').classList.toggle('show');
});

document.querySelector('.close-modal').addEventListener('click', function() {
    document.querySelector('.settings-modal').classList.remove('show');
});

document.getElementById('dot-color-option').addEventListener('change', function() {
    const customColorInput = document.getElementById('dot-color');
    if (this.value === 'custom') {
        customColorInput.classList.add('show');
    } else {
        customColorInput.classList.remove('show');
    }
});

document.getElementById('color-scheme').addEventListener('change', function() {
    const selectedScheme = this.value;
    switch (selectedScheme) {
        case 'dark':
            document.body.style.backgroundColor = 'linear-gradient(to right, #000000, #000000)';
            break;
        case 'light':
            document.body.style.backgroundColor = 'linear-gradient(to right, #fcfcfc, #fcfcfc)';
            break;
        case 'midnight':
            document.body.style.backgroundColor = 'linear-gradient(to right, #270761, #270761)';
            break;
        case 'sunset':
            document.body.style.background = 'linear-gradient(to right, #ff7e5f, #feb47b)';
            break;
        case 'ocean':
            document.body.style.background = 'linear-gradient(to right, #0f2027, #203a43, #2c5364)'; 
            break;
        default:
            document.body.style.backgroundColor = '';
            break;
    }
    localStorage.setItem('colorScheme', selectedScheme);
});

document.addEventListener('DOMContentLoaded', function() {
    loadSettings();

    document.getElementById('color-scheme').addEventListener('change', function() {
        const selectedScheme = this.value;
        setColorScheme(selectedScheme);
        localStorage.setItem('colorScheme', selectedScheme);
    });

    document.getElementById('dot-color-option').addEventListener('change', function() {
        const customColorInput = document.getElementById('dot-color');
        if (this.value === 'custom') {
            customColorInput.classList.add('show');
        } else {
            customColorInput.classList.remove('show');
            resetCircleColors(); 
            localStorage.removeItem('dotColor');
        }
        localStorage.setItem('dotColorOption', this.value);
    });

    document.getElementById('dot-color').addEventListener('input', function() {
        const color = this.value;
        if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
            setCircleColors(color);
            localStorage.setItem('dotColor', color);
        }
    });

    document.getElementById('city').addEventListener('input', function() {
        const city = this.value;
        localStorage.setItem('city', city);
        updateWeatherDataByCity(city);
    });

    document.getElementById('shortcut-rows').addEventListener('change', function() {
        const rows = this.value;
        localStorage.setItem('shortcutRows', rows);
        loadShortcuts();
    });

    function setColorScheme(scheme) {
        switch (scheme) {
            case 'dark':
                document.body.style.background = 'black';
                break;
            case 'light':
                document.body.style.background = '#fcfcfc';
                break;
            case 'midnight':
                document.body.style.background = '#270761';
                break;
            case 'sunset':
                document.body.style.background = 'linear-gradient(to right, #ff7e5f, #feb47b)';
                break;
            case 'forest':
                document.body.style.background = 'linear-gradient(to bottom, #2c5d3f, #97bc62)';

                break;
            case 'mystic':
                document.body.style.background = 'linear-gradient(to right, #2e3d82, #633974, #e94560)';
                break;
            default:
                document.body.style.background = '';
                break;
        }
    }

    function setCircleColors(color) {
        document.querySelectorAll('.background-circle').forEach(circle => {
            circle.style.background = color;
        });
    }

    function resetCircleColors() {
        const defaultColors = [
            'linear-gradient(135deg, #31f30a, #0219e9)',
            'linear-gradient(135deg, #005bb5, #0083cc)',
            'linear-gradient(135deg, #6e21a2, #923fba)',
            'linear-gradient(135deg, #cc4230, #cc3700)',
            'linear-gradient(135deg, #fe4500, #fe4500)'
        ];
        document.querySelectorAll('.background-circle').forEach((circle, index) => {
            circle.style.background = defaultColors[index];
        });
    }

    function loadSettings() {
        const savedScheme = localStorage.getItem('colorScheme');
        if (savedScheme) {
            document.getElementById('color-scheme').value = savedScheme;
            setColorScheme(savedScheme);
        }

        const savedDotColorOption = localStorage.getItem('dotColorOption');
        if (savedDotColorOption) {
            document.getElementById('dot-color-option').value = savedDotColorOption;
            if (savedDotColorOption === 'custom') {
                document.getElementById('dot-color').classList.add('show');
                const savedDotColor = localStorage.getItem('dotColor');
                if (savedDotColor) {
                    document.getElementById('dot-color').value = savedDotColor;
                    setCircleColors(savedDotColor);
                }
            }
        }

        const savedCity = localStorage.getItem('city');
        if (savedCity) {
            document.getElementById('city').value = savedCity;
            updateWeatherDataByCity(savedCity);
        }

        const savedShortcutRows = localStorage.getItem('shortcutRows');
        if (savedShortcutRows) {
            document.getElementById('shortcut-rows').value = savedShortcutRows;
            loadShortcuts();
        }
    }
});

function updateWeatherData(latitude, longitude) {
    const apiKey = '61894ea1f7464ad581e144615242807';
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}&aqi=no`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('temperature').innerText = `${data.current.temp_c}°C`;
            document.getElementById('condition').innerText = getConditionDescription(data.current.condition.text);
            document.getElementById('location').innerText = data.location.name;
            getWeatherIcon(data.current.condition.text);
            showWeatherData();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function updateWeatherDataByCity(city) {
    const apiKey = '61894ea1f7464ad581e144615242807';
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('temperature').innerText = `${data.current.temp_c}°C`;
            document.getElementById('condition').innerText = getConditionDescription(data.current.condition.text);
            document.getElementById('location').innerText = data.location.name;
            getWeatherIcon(data.current.condition.text);
            showWeatherData();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function getWeatherIcon(weather) {
    const iconMap = {
        'Sunny': { day: 'clear-day.svg', night: 'clear-night.svg' },
        'Clear': { day: 'clear-day.svg', night: 'clear-night.svg' },
        'Partly Cloudy': { day: 'partly-cloudy-day.svg', night: 'partly-cloudy-night.svg' },
        'Cloudy': { day: 'cloudy.svg', night: 'cloudy.svg' },
        'Overcast': { day: 'overcast-day.svg', night: 'overcast-night.svg' },
        'Mist': { day: 'mist.svg', night: 'mist.svg' },
        'Light rain shower': { day: 'partly-cloudy-day-rain.svg', night: 'partly-cloudy-night-rain.svg' },
        'Patchy rain nearby': { day: 'partly-cloudy-day-drizzle.svg', night: 'partly-cloudy-night-drizzle.svg' },
        'Light drizzle': { day: 'partly-cloudy-day-drizzle.svg', night: 'partly-cloudy-night-drizzle.svg' },
        'Rain': { day: 'rain.svg', night: 'rain.svg' },
        'Moderate or heavy rain shower': { day: 'rain.svg', night: 'rain.svg' },
        'Thunderstorm': { day: 'thunderstorms-day-extreme-rain.svg', night: 'thunderstorms-night-extreme-rain.svg' },
        'Thundery outbreaks in nearby': { day: 'thunderstorms-day.svg', night: 'thunderstorms-night.svg' },
        'Patchy light rain in area with thunder': { day: 'thunderstorms-day-rain.svg', night: 'thunderstorms-night-rain.svg' },
        'Snow': { day: 'snow.svg', night: 'snow.svg' },
        'Sleet': { day: 'sleet.svg', night: 'sleet.svg' },
        'Hail': { day: 'hail.svg', night: 'hail.svg' },
        'Fog': { day: 'fog-day.svg', night: 'fog-night.svg' },
        'Blizzard': { day: 'snow.svg', night: 'snow.svg' },
        'Ice Pellets': { day: 'sleet.svg', night: 'sleet.svg' },
        'Other': { day: 'star.svg', night: 'star.svg' }
    };

    const hour = new Date().getHours();
    const isNight = hour >= 21 || hour < 6;
    const variant = isNight ? 'night' : 'day';

    const weatherIconFile = iconMap[weather] ? iconMap[weather][variant] : iconMap['Other'][variant];
    const weatherIconElement = document.getElementById('weather-icon');

    if (weatherIconElement) {
        weatherIconElement.innerHTML = `<img src="svg/${weatherIconFile}" alt="${weather}" style="width: 90px; height: 90px;">`;
    } else {
        console.error('Element with id "weather-icon" not found.');
    }
}

function getConditionDescription(condition) {
    const conditionMap = {
        'Sunny': 'Bright and sunny',
        'Clear': 'Clear skies',
        'Partly Cloudy': 'Partly cloudy skies',
        'Cloudy': 'Cloudy skies',
        'Overcast': 'Overcast conditions',
        'Mist': 'Misty conditions',
        'Light rain shower': 'Light rain showers',
        'Patchy rain nearby': 'Intermittent rain in the vicinity',
        'Light Rain': 'Light rain',
        'Light drizzle': 'Light drizzle',
        'Moderate Rain': 'Moderate rain',
        'Heavy Rain': 'Heavy rain',
        'Moderate or heavy rain shower': 'Moderate to heavy rain showers',
        'Thunderstorm': 'Thunderstorms in the area',
        'Thundery outbreaks in nearby': 'Thunderstorms nearby',
        'Patchy light rain in area with thunder': 'Light rain and thunder nearby',
        'Snow': 'Snowfall',
        'Sleet': 'Sleet showers',
        'Hail': 'Hail showers',
        'Fog': 'Foggy conditions',
        'Blizzard': 'Blizzard conditions',
        'Ice Pellets': 'Ice pellets falling',
        'Other': 'Unpredictable weather'
    };    
    return conditionMap[condition] || `Weather condition unknown: ${condition}`;
}

function showWeatherData() {
    document.getElementById('skeleton-weather-icon').style.display = 'none';
    document.getElementById('skeleton-temperature').style.display = 'none';
    document.getElementById('skeleton-condition').style.display = 'none';
    document.getElementById('skeleton-location').style.display = 'none';

    const weatherIconElement = document.getElementById('weather-icon');
    weatherIconElement.style.display = 'inline-block'; 
    weatherIconElement.offsetWidth; 
    weatherIconElement.style.opacity = '1'; 
    weatherIconElement.style.transform = 'scale(1)'; 

    document.getElementById('temperature').style.display = 'inline-block';
    document.getElementById('condition').style.display = 'inline-block';
    document.getElementById('location').style.display = 'inline-block';
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                updateWeatherData(latitude, longitude);
                setInterval(() => updateWeatherData(latitude, longitude), 300000); 
            },
            error => {
                console.error('Error occurred while fetching location:', error);
                showNoLocationData();  
            }
        );
    } else {
        console.log("Geolocation is not supported by this browser.");
        showNoLocationData();  
    }
}

function showNoLocationData() {
    document.getElementById('temperature').style.display = 'none';
    document.getElementById('condition').style.display = 'none';
    document.getElementById('location').innerText = 'no location';
    document.getElementById('weather-icon').textContent = 'location_off';
    document.getElementById('weather-icon').style.color = '#f22c3d';  
    showWeatherData();
}

document.addEventListener('DOMContentLoaded', function() {
    loadShortcuts();
    setupTooltips();
    const savedCity = localStorage.getItem('city');
    if (savedCity) {
        updateWeatherDataByCity(savedCity);
    } else {
        getLocation();
    }
});

function setupTooltips() {
    const container = document.querySelector('.shortcuts');
    container.addEventListener('mouseover', function(event) {
        const shortcut = event.target.closest('.shortcut');
        if (shortcut) {
            const url = shortcut.getAttribute('data-url');
            if (url) {
                const existingTooltip = document.querySelector('.tooltip');
                if (existingTooltip) {
                    existingTooltip.remove();
                }

                const tooltip = document.createElement('div');
                tooltip.classList.add('tooltip');
                tooltip.textContent = url;
                document.body.appendChild(tooltip);

                shortcut.addEventListener('mousemove', (event) => {
                    updateTooltipPosition(event, tooltip, shortcut);
                });

                shortcut.addEventListener('mouseleave', () => {
                    tooltip.remove();
                });
            }
        }
    });
}

function updateTooltipPosition(event, tooltip, shortcut) {
    const rect = shortcut.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const offset = 10;

    tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2)}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + offset}px`;
}

window.addEventListener('resize', function() {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        tooltip.style.display = 'none';
    });
});
