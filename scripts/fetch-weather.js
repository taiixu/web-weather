// let response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.6844&longitude=39.3703&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=Europe%2FMoscow');
// let json = await response.json();

let url = 'https://api.open-meteo.com/v1/forecast?latitude=51.6844&longitude=39.3703&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&wind_speed_unit=ms&timezone=Europe%2FMoscow';

let body = document.querySelector('body');
let input = document.querySelector('.search > input');

let lat = 0;
let long = 0;
let tz = "GMT";

let default_tz = "GMT";

// weather
let city_name = document.getElementById('name');
let weather_icon = document.getElementById('weather-icon');
let weather_name = document.getElementById('weather-name');
let temp = document.getElementById('temp-in');
let low_temp = document.getElementById('low-temp-in');
let high_temp = document.getElementById('high-temp-in');
let apparent_temp = document.getElementById('apparent-temp-in');
let humidity = document.getElementById('humidity-in');
let wind_speed = document.getElementById('wind-speed-in');
let wind_direction = document.getElementById('wind-direction-in');
let pressure = document.getElementById('pressure-in');
let sunset = document.getElementById('sunset-in');
let sunrise = document.getElementById('sunrise-in');

// daily weather
let daily_date = document.querySelector('.daily .date');
let daily_weather_icon = document.querySelector('.daily .weather-icon');
let daily_weather_name = document.querySelector('.daily .weather-name');
let daily_low_high = document.querySelector('.daily .low-high');
let daily_precipitation = document.querySelector('.daily .precipitation');

// hourly weather
let hourly_hours = document.querySelector('.hourly .hours');
let hourly_weather_icon = document.querySelector('.hourly .weather-icon');
let hourly_weather_name = document.querySelector('.hourly .weather-name');
let hourly_temp = document.querySelector('.hourly .temp');
let hourly_precipitation = document.querySelector('.hourly .precipitation');

let weather_containers = document.querySelector('.weather');
let title = document.querySelector('title');
let bg_paths = ['backgrounds/night', 'backgrounds/day']
let colors = ['#1d1d1d', '#ffffff'];
let text_colors = ['#ffffff', '#000000'];

let temp_sign = "";
let hpa_to_mmhg = (n) => Math.ceil(n / 1.333333);

let directions = [
    [0, 45, "С"],
    [45, 90, "СВ"],
    [90, 135, "В"],
    [135, 180, "ЮВ"],
    [180, 225, "Ю"],
    [225, 270, "ЮЗ"],
    [270, 315, "З"],
    [315, 360, "СЗ"]
]

function get_wind_direction(deg) {
    for (c of directions.values()) {
        if (deg >= c[0] && deg <= c[1]) {
            return c[2];
        }
    }
}

async function getIP() {
    let response = await fetch('https://ifconfig.me/ip');
    let ret = await response.text();
    return ret;
}

async function ipinfo(ip) {
    let response = await fetch(`https://ipinfo.io/${ip}/json`);
    let ret = await response.json();
    return ret;
}

async function getWeather(la, lo, timezone) {
    if (timezone == 'undefined')
        weather_url = `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weather_code,precipitation_probability_max&hourly=temperature_2m,precipitation_probability,weather_code&wind_speed_unit=ms&timezone=${default_tz}`;
    else
        weather_url = `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,weather_code,precipitation_probability_max&hourly=temperature_2m,precipitation_probability,weather_code&wind_speed_unit=ms&timezone=${timezone}`;
    let response = await fetch(weather_url);
    let ret = await response.json()
    console.log(weather_url);
    return ret;
}

async function getHoursNow(timezone) {
    let response = null;
    if (timezone == 'undefined')
        response = await fetch(`http://worldtimeapi.org/api/timezone/${default_tz}`);
    else
        response = await fetch(`http://worldtimeapi.org/api/timezone/${timezone}`);
    let ret = await response.json();
    return Number(ret.datetime.split('T')[1].split(':')[0])
}

function clearDailyTable() {
    daily_date.innerHTML = '';
    daily_weather_icon.innerHTML = '';
    daily_weather_name.innerHTML = '';
    daily_low_high.innerHTML = '';
    daily_precipitation.innerHTML = '';
}

function getIcon(i_sunset, i_sunrise, i_current, i_id) {
    let sunset_min = Number(i_sunset.split(':')[0]) * 60 + Number(i_sunset.split(':')[1]);
    let sunrise_min = Number(i_sunrise.split(':')[0]) * 60 + Number(i_sunrise.split(':')[1]);
    let current_min = Number(i_current.split(':')[0]) * 60 + Number(i_current.split(':')[1]);
    if ((current_min >= sunset_min && current_min <= 1440) || current_min >= 0 && current_min <= sunrise_min) {
        return wmo_codes[i_id][0][0];
    } else {
        return wmo_codes[i_id][0][1];
    }
}

function addDailyTableElement(d_date, d_weather_icon, d_weather_name, d_low, d_high, d_precipitation) {
    let th_date = document.createElement('th');
    th_date.innerText = `${d_date.split('-')[2]}.${d_date.split('-')[1]}`;

    let td_weather_icon = document.createElement('td');
    td_weather_icon.innerHTML = `<span class="icon">${d_weather_icon}</span>`

    let td_weather_name = document.createElement('td');
    td_weather_name.innerText = d_weather_name;

    let td_low_high = document.createElement('td');
    td_low_high.innerHTML = `<span class="icon"></span> ${Math.round(d_high)}${temp_sign}<br><span class="icon"></span> ${Math.round(d_low)}${temp_sign}`;

    let td_precipitation = document.createElement('td');
    td_precipitation.innerHTML = `<span class="icon"></span> ${d_precipitation}%`

    daily_date.appendChild(th_date);
    daily_weather_icon.appendChild(td_weather_icon);
    daily_weather_name.appendChild(td_weather_name);
    daily_low_high.appendChild(td_low_high);
    daily_precipitation.appendChild(td_precipitation);
}

function clearHourlyTable() {
    hourly_hours.innerHTML = '';
    hourly_weather_icon.innerHTML = '';
    hourly_weather_name.innerHTML = '';
    hourly_temp.innerHTML = '';
    hourly_precipitation.innerHTML = '';
}

function addHourlyTableElement(h_hour, h_weather_icon, h_weather_name, h_temp, h_precipitation) {
    let th_hour = document.createElement('th');
    th_hour.innerText = h_hour;

    let td_weather_icon = document.createElement('td');
    td_weather_icon.innerHTML = `<span class="icon">${h_weather_icon}</span>`;

    let td_weather_name = document.createElement('td');
    td_weather_name.innerText = h_weather_name;
    
    let td_temp = document.createElement('td');
    td_temp.innerText = Math.round(h_temp) + temp_sign;

    let td_precipitation = document.createElement('td');
    td_precipitation.innerHTML = `<span class="icon"></span> ${h_precipitation}%`

    hourly_hours.appendChild(th_hour);
    hourly_weather_icon.appendChild(td_weather_icon);
    hourly_weather_name.appendChild(td_weather_name);
    hourly_temp.appendChild(td_temp);
    hourly_precipitation.appendChild(td_precipitation);
}

async function update() {
    json = await getWeather(lat, long, tz);
    temp_sign = json.current_units.temperature_2m;
    weather_icon.innerText = wmo_codes[json.current.weather_code][0][json.current.is_day];
    weather_name.innerText = wmo_codes[json.current.weather_code][1];
    body.style.backgroundImage = `url('${bg_paths[json.current.is_day]}/${wmo_codes[json.current.weather_code][2][json.current.is_day]}')`
    input.style.backgroundColor = colors[json.current.is_day];
    input.style.color = text_colors[json.current.is_day];
    cities.style.backgroundColor = colors[json.current.is_day];
    cities.style.color = text_colors[json.current.is_day];
    temp.innerText = Math.round(json.current.temperature_2m) + temp_sign;
    low_temp.innerText = Math.round(json.daily.temperature_2m_min[0]) + temp_sign;
    high_temp.innerText = Math.round(json.daily.temperature_2m_max[0]) + temp_sign;
    apparent_temp.innerText = Math.round(json.current.apparent_temperature) + temp_sign;
    humidity.innerText = json.current.relative_humidity_2m;
    wind_speed.innerText = Math.round(json.current.wind_speed_10m);
    wind_direction.innerText = get_wind_direction(json.current.wind_direction_10m);
    pressure.innerText = hpa_to_mmhg(json.current.pressure_msl);
    sunrise.innerText = json.daily.sunrise[0].split('T')[1];
    sunset.innerText = json.daily.sunset[0].split('T')[1];
    clearDailyTable();
    for (i = 0; i < json.daily.time.length; i++) {
        addDailyTableElement(
            json.daily.time[i],
            wmo_codes[json.daily.weather_code[i]][0][1],
            wmo_codes[json.daily.weather_code[i]][1],
            json.daily.temperature_2m_min[i],
            json.daily.temperature_2m_max[i],
            json.daily.precipitation_probability_max[i]
        )
    }
    let hour_now = await getHoursNow(tz);
    clearHourlyTable();
    for (i = hour_now; i < hour_now + 24; i++) {
        addHourlyTableElement(
            json.hourly.time[i].split('T')[1],
            getIcon(json.daily.sunset[0].split('T')[1], json.daily.sunrise[0].split('T')[1], json.hourly.time[i].split('T')[1], json.hourly.weather_code[i]),
            wmo_codes[json.hourly.weather_code[i]][1],
            json.hourly.temperature_2m[i],
            json.hourly.precipitation_probability[i]
        )
    }
    title.innerText = `${city_name.innerText}: ${Math.round(json.current.temperature_2m)}${temp_sign}`
}

async function setCoord(la, lo, cname, timezone) {
    lat = la;
    long = lo;
    city_name.innerText = cname;
    input.value = cname;
    tz = timezone;
    await update();
}

async function load() {
    let date = new Date();
    let h = date.getUTCHours();
    if (h >= 7 && h <= 18){ 
        body.style.backgroundColor = '#8eb1d4';
        input.style.backgroundColor = colors[1];
    } else {
        body.style.backgroundColor = '#385479';
        input.style.backgroundColor = colors[0];
    }
    let ip = await getIP();
    let city = await ipinfo(ip);
    let city_info = await search(city.city);
    city_name.innerText = city_info.results[0].name;
    lat = city_info.results[0].latitude;
    long = city_info.results[0].longitude;
    tz = city_info.results[0].timezone;
    await update();
    weather_containers.style.display = 'block';
}
setInterval(update, 1000 * 60);
load();
