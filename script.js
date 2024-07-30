window.addEventListener('load', function() {
    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('show');
        }, index * 200); 
    });
});
document.addEventListener('keydown', function(event) {
    var searchInput = document.getElementById('search-input');
    if (document.activeElement !== searchInput) {
        searchInput.focus();
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

    Object.keys(shortcuts).slice(0, 6).forEach(url => {
        let element = document.createElement('div');
        element.classList.add('shortcut');
        element.setAttribute('data-url', url);
        element.setAttribute('data-old-url', url); 
        element.innerHTML = `<img src="${shortcuts[url]}" alt="favicon" width="32" height="32">`;
        
        container.appendChild(element);
        
        element.addEventListener('click', function(event) {
            handleShortcutClick(event, element);
        });
    });

    for (let i = Object.keys(shortcuts).length; i < 6; i++) {
        let placeholder = document.createElement('div');
        placeholder.classList.add('shortcut');
        placeholder.innerHTML = `<span class="material-icons">add</span>`;
        placeholder.addEventListener('click', function(event) {
            handleShortcutClick(event, placeholder);
        });
        container.appendChild(placeholder);
    }
}

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

window.addEventListener('load', function() {
    loadShortcuts();
    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('show');
        }, index * 200); 
    });
});

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
    loadShortcuts();
    setupTooltips();
});

function setupTooltips() {
    const container = document.querySelector('.shortcuts');
    container.addEventListener('mouseover', function(event) {
        const shortcut = event.target.closest('.shortcut');
        if (shortcut) {
            const url = shortcut.getAttribute('data-url');
            if (url) {
                // Remove any existing tooltip
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
    const offset = 10; // Fixed offset from the element

    tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2)}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + offset}px`;
}

window.addEventListener('resize', function() {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        tooltip.style.display = 'none';
    });
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
                document.body.style.background = 'radial-gradient(circle, #0b3d0b, #1e5631, #345b63)';
                break;
            case 'mystic':
                document.body.style.background = 'linear-gradient(to right, #1a2a6c, #b21f1f, #fdbb2d)';
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
            document.getElementById('weather-icon').innerText = getWeatherIcon(data.current.condition.text);
            showWeatherData();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function getWeatherIcon(weather) {
    const iconMap = {
        'Clear': { icon: 'wb_sunny', color: '#FFD700' }, 
        'Partly cloudy': { icon: 'wb_cloudy', color: '#B0C4DE' }, 
        'Cloudy': { icon: 'cloud', color: '#A9A9A9' }, 
        'Overcast': { icon: 'cloud', color: '#808080' }, 
        'Mist': { icon: 'blur_on', color: '#D3D3D3' }, 
        'Patchy rain possible': { icon: 'umbrella', color: '#4682B4' }, 
        'Rain': { icon: 'umbrella', color: '#0000FF' }, 
        'Thunderstorm': { icon: 'flash_on', color: '#FF4500' }, 
        'Snow': { icon: 'ac_unit', color: '#FFFFFF' }, 
        'Sleet': { icon: 'ac_unit', color: '#FFFFFF' }, 
        'Hail': { icon: 'grain', color: '#708090' }, 
        'Fog': { icon: 'blur_on', color: '#C0C0C0' }, 
        'Other': { icon: 'wb_sunny', color: '#FFD700' } 
    };

    const weatherData = iconMap[weather] || iconMap['Other'];
    const weatherIconElement = document.getElementById('weather-icon');

    weatherIconElement.textContent = weatherData.icon;
    weatherIconElement.style.color = weatherData.color;
    weatherIconElement.style.display = 'inline-block'; 
    return weatherData.icon; 
}

function getConditionDescription(condition) {
    const conditionMap = {
        'Sunny': 'It will be sunny',
        'Clear': 'It will be clear',
        'Partly cloudy': 'It will be partly cloudy',
        'Cloudy': 'It will be cloudy',
        'Overcast': 'It will be overcast',
        'Mist': 'It will be misty',
        'Patchy rain possible': 'It might rain',
        'Light rain': 'It will rain lightly',
        'Moderate rain': 'It will rain moderately',
        'Heavy rain': 'It will rain heavily',
        'Thunderstorm': 'There will be thunderstorms',
        'Snow': 'It will snow',
        'Sleet': 'It will sleet',
        'Hail': 'There may be hail',
        'Fog': 'It will be foggy',
        'Blizzard': 'It will be blizzard conditions',
        'Ice pellets': 'There may be ice pellets',
        'Other': 'The weather is unpredictable'
    };
    return conditionMap[condition] || 'Weather condition unknown';
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

getLocation();