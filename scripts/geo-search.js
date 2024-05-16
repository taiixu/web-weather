let cities = document.getElementById('cities');

let x = 0;
let y = 0;

document.addEventListener('mousemove', mouseUpdate, false);
document.addEventListener('mouseenter', mouseUpdate, false);

input.addEventListener("focus", (event) => {
    if (cities.innerHTML != '') {
        cities.style.display = "block";
    }
    cities.style.top = input.offsetTop + input.offsetHeight + 'px';
    cities.style.left = input.offsetLeft + 'px';
    cities.style.width = input.offsetWidth - 10 + 'px';
});

input.addEventListener("blur", (event) => { 
    if (!((x >= (cities.offsetLeft) && x <= (cities.offsetLeft + cities.offsetWidth)) && (y >= (cities.offsetTop) && y <= (cities.offsetTop + cities.offsetHeight)))) {
        cities.style.display = "none";
    }
});

input.addEventListener("input", updateValue);

function mouseUpdate(e) {
    x = e.pageX;
    y = e.pageY;
}

async function updateValue(e) {
    let json = await search(e.target.value);
    cities.innerHTML = '';
    if (json.results == undefined) {
        cities.style.display = "none";
        return;
    } else {
        cities.style.display = "block";
    }

    for (c of json.results.values()) {
        let div = document.createElement('div');
        div.className = "city";
        if (c.admin1 != undefined)
            div.innerHTML = `${c.name}, ${c.admin1}`;
        else
            div.innerText = `${c.name}`;
        div.setAttribute('onclick', `setCoord(${c.latitude}, ${c.longitude}, "${c.name}", "${c.timezone}");cities.style.display = "none"`);
        cities.appendChild(div);
    }
}

async function search(name) {
    let response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${name}&count=10&language=ru&format=json`);
    let ret = await response.json();
    return ret;
}