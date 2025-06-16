// JavaScript for kalenderen
const currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

const monthYearElement = document.getElementById('month-year');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const calendarGrid = document.querySelector('.calendar-grid');

console.log("🚀 kalender.js er lastet!");

// Turnuser
let shifts = [];
let userShift = null;
const predefinedShifts = [
    '1-1', '1-2', '1-3', '1-4', '2-2', '2-3', '2-4', '2-6', 
    '3-3', '3-4', '4-4', '4-5', '4-8', '5-5'
]; 

const redDays = [
    { name: '1.Nyttårsdag', date: '01-01' },
    { name: 'Skjærtorsdag', calculate: (year) => calculateEaster(year, -3) },
    { name: 'Langfredag', calculate: (year) => calculateEaster(year, -2) },
    { name: '1. Påskedag', calculate: (year) => calculateEaster(year, 0) },
    { name: '2. Påskedag', calculate: (year) => calculateEaster(year, 1) },
    { name: 'Arbeidernes dag', date: '05-01' },
    { name: '17. mai', date: '05-17' },
    { name: 'Kristi himmelfartsdag', calculate: (year) => calculateEaster(year, 39) },
    { name: '1. Pinsedag', calculate: (year) => calculateEaster(year, 49) },
    { name: '2. Pinsedag', calculate: (year) => calculateEaster(year, 50) },
    { name: '1. Juledag', date: '12-25' },
    { name: '2. Juledag', date: '12-26' },
];

const specialDays = [
    { name: 'Julaften', date: '12-24' }, // Julaften
    { name: 'Nyttårsaften', date: '12-31' }, // Nyttårsaften
    { name: 'Påskeaften', calculate: (year) => calculateEaster(year, -1) }, // Påskeaften
    { name: 'Palmesøndag', calculate: (year) => calculateEaster(year, -7) }, // Palmesøndag
    { name: 'Bursdag Thomas', date: '06-28' } // Bursdag Thomas
];


// Funksjon for å beregne påsken
function calculateEaster(year, offset = 0) {
    const f = Math.floor,
        G = year % 19,
        C = f(year / 100),
        H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
        I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
        J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
        L = I - J,
        month = 3 + f((L + 40) / 44),
        day = L + 28 - 31 * f(month / 4);
    return new Date(year, month - 1, day + offset).toISOString().slice(0, 10);
}

// Funksjon for å hente informasjon om røde dager
function getRedDayInfo(date) {
    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const redDay = redDays.find((day) => {
        if (day.date) {
            return formattedDate === day.date; // Faste helligdager
        } else if (day.calculate) {
            return date.toISOString().slice(0, 10) === day.calculate(date.getFullYear());
        }
        return false;
    });
    return redDay ? { name: redDay.name } : null; // Returner navn eller null
}

function getSpecialDayInfo(date) {
    const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const specialDay = specialDays.find((day) => {
        if (day.date) {
            return formattedDate === day.date; // Faste spesielle dager
        } else if (day.calculate) {
            return date.toISOString().slice(0, 10) === day.calculate(date.getFullYear());
        }
        return false;
    });
    return specialDay ? { name: specialDay.name } : null;
}



const months = [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
];

document.addEventListener('DOMContentLoaded', function () {
    renderWeekdayRow();
    initializeEventListeners();
    loadShiftsFromLocalStorage();
    loadUserShift();
    renderCalendar(currentMonth, currentYear);
    renderShiftList();
});

function initializeEventListeners() {
    prevMonthButton.addEventListener('click', () => {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        renderCalendar(currentMonth, currentYear);
    });

    nextMonthButton.addEventListener('click', () => {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        renderCalendar(currentMonth, currentYear);
    });

    // Event Listener for adding new shift
    const addShiftButton = document.getElementById('add-shift');
    addShiftButton.addEventListener('click', addNewShift);

    // Event Listener for reset button
    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', resetShifts);
}


let resetPending = false;
let resetTimeout;

function resetShifts() {
    if (!resetPending) {
        showMessage("Trykk på 'T\u00f8m skjema' igjen innen 10 sekunder for \u00e5 t\u00f8mme alle turnusene.");
        resetPending = true;
        resetTimeout = setTimeout(() => {
            resetPending = false;
        }, 10000);
        return;
    }

    resetPending = false;
    clearTimeout(resetTimeout);

    shifts = []; // Tømmer turnuslisten
    saveShiftsToLocalStorage(); // Oppdaterer local storage med den tomme listen
    // Tilbakestill tilgjengelige farger slik at alle farger blir synlige igjen
    saveAvailableColors(Object.keys(colorLabels));
    updateColorDropdown();
    renderCalendar(currentMonth, currentYear); // Oppdaterer kalenderen
    renderShiftList(); // Oppdaterer listen som viser turnuser

    // Tøm oversikten under kalenderen
    const oversiktContainer = document.getElementById('turnus-oversikt');
    oversiktContainer.innerHTML = ''; // Fjern alt innhold
    showMessage('Skjemaet ble t\u00f8mt.', 'success');
}

// Definer alle farger og deres etiketter
const colorLabels = {
    "#FF6666": "Rød",
    "#FFB266": "Oransje",
    "#FFFF66": "Gul",
    "#B2FF66": "Lys Grønn",
    "#66FFB2": "Turkis",
    "#66B2FF": "Lys Blå",
    "#FF66B2": "Rosa",
    "#CC66FF": "Fiolett",
    "#66FF66": "Grønn",
    "#CCCCCC": "Lys Grå"
};

// Laste tilgjengelige farger fra localStorage eller bruke standard
function loadAvailableColors() {
    const storedColors = localStorage.getItem('availableColors');
    if (storedColors) {
        return JSON.parse(storedColors);
    }
    return Object.keys(colorLabels);
}

// Lagre tilgjengelige farger til localStorage
function saveAvailableColors(colors) {
    localStorage.setItem('availableColors', JSON.stringify(colors));
}

// Oppdater fargevelgeren basert på tilgjengelige farger
function updateColorDropdown() {
    const colorSelect = document.getElementById('shift-color');
    colorSelect.innerHTML = ''; // Tøm fargevelgeren

    const availableColors = loadAvailableColors();
    availableColors.forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = colorLabels[color];
        colorSelect.appendChild(option);
    });

    if (availableColors.length > 0) {
        colorSelect.selectedIndex = 0; // Velg første tilgjengelige farge
    }
}

// Fjern farge fra dropdown og oppdater localStorage
function removeColorFromDropdown(color) {
    let availableColors = loadAvailableColors();
    availableColors = availableColors.filter(c => c !== color);
    saveAvailableColors(availableColors);
    updateColorDropdown();
}

// Legg til farge tilbake i dropdown
function addColorToDropdown(color) {
    let availableColors = loadAvailableColors();
    if (!availableColors.includes(color)) {
        availableColors.push(color);
        saveAvailableColors(availableColors);
        updateColorDropdown();
    }
}

// Funksjon for å legge til ny turnus
function addNewShift() {
    if (shifts.length >= maxShifts) {
        showMessage(`Maksimum antall turnuser er nådd. Slett en turnus for å legge til en ny.`, 'error');
        return;
    }

    const name = document.getElementById('shift-name').value.trim();
    let durationInput = document.getElementById('shift-duration').value;
    let inputDate = document.getElementById('shift-start').value;
    let startDate = new Date(inputDate + "T00:00:00"); // Sørger for at det starter ved midnatt
    const colorSelect = document.getElementById('shift-color');
    const color = colorSelect.value;


    
    if (!name || !durationInput || isNaN(startDate.getTime())) {
        showMessage('Vennligst fyll inn alle feltene riktig.', 'error');
        return;
    }

    // Håndter tilpasset turnus hvis "custom" er valgt
    if (durationInput === 'custom') {
        durationInput = prompt('Angi ønsket turnus i formatet "X-Y" for uker eller "D5-2" for dager:', '');
        if (!durationInput || !/^(\d+-\d+|D\d+-\d+)$/.test(durationInput)) {
            showMessage('Ugyldig format. Bruk formatet "2-4" eller "D5-2".', 'error');
            return;
        }
    }

    // Identifiser om det er en dagbasert turnus
    const isDayBased = durationInput.startsWith('D');
    let workPeriod, offPeriod;

    if (isDayBased) {
        [workPeriod, offPeriod] = durationInput.substring(1).split('-').map(Number);
    } else {
        [workPeriod, offPeriod] = durationInput.split('-').map(Number);
    }

    if (!workPeriod || !offPeriod || workPeriod <= 0 || offPeriod <= 0) {
        showMessage('Ugyldig turnuslengde. Bruk formatet "2-4" eller "D5-2".', 'error');
        return;
    }

    // Sjekk om turnusen allerede finnes
    const isDuplicate = shifts.some(shift =>
        shift.name === name &&
        shift.workWeeks === workPeriod &&
        shift.offWeeks === offPeriod &&
        shift.startDate.getTime() === startDate.getTime()
    );

    if (isDuplicate) {
        showMessage('Denne turnusen er allerede lagt til!', 'error');
        return;
    }

    // Opprett turnusobjektet
    const shift = {
        name,
        workWeeks: isDayBased ? workPeriod / 7 : workPeriod, // Konverter dagbasert til uker om nødvendig
        offWeeks: isDayBased ? offPeriod / 7 : offPeriod,
        startDate,
        color,
        visible: true,
        type: isDayBased ? 'dagbasert' : 'ukebasert'
    };

    shifts.push(shift);

    // Fjern valgt farge fra dropdown
    removeColorFromDropdown(color);

    saveShiftsToLocalStorage();
    renderShiftList();
    renderCalendar(currentMonth, currentYear);
    updateTurnusOversikt();

    // Nullstill skjemaet etterpå
    document.getElementById('shift-name').value = '';
    document.getElementById('shift-start').value = '';

    // Velg neste tilgjengelige farge automatisk
    if (colorSelect.options.length > 0) {
        colorSelect.selectedIndex = 0;
    }
}


// Funksjon for å slette en turnus
function deleteShift(index) {
    const deletedShift = shifts.splice(index, 1)[0];

    if (deletedShift && deletedShift.color) {
        addColorToDropdown(deletedShift.color);
    }

    saveShiftsToLocalStorage();
    renderShiftList();
    renderCalendar(currentMonth, currentYear);
    updateTurnusOversikt();
}

// Laste eksisterende turnuser fra localStorage
function loadShiftsFromLocalStorage() {
    const storedShifts = localStorage.getItem('shifts');
    if (storedShifts) {
        shifts = JSON.parse(storedShifts);
        shifts.forEach(shift => {
            shift.startDate = new Date(shift.startDate);
        });
        // Fjern eventuelle duplikater
        const seen = new Set();
        shifts = shifts.filter(shift => {
            const key = [shift.name, shift.workWeeks, shift.offWeeks,
                shift.startDate.toISOString(), shift.color, shift.isUserShift ? 1 : 0].join('|');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        saveShiftsToLocalStorage();
    }
    updateTurnusOversikt(); // Kall funksjonen her for å oppdatere visningen ved lasting

    // Oppdater fargevalg ved innlasting
    const usedColors = shifts.map(shift => shift.color);
    let availableColors = Object.keys(colorLabels).filter(color => !usedColors.includes(color));
    saveAvailableColors(availableColors);
    updateColorDropdown();
}

// Lagre turnuser til localStorage
function saveShiftsToLocalStorage() {
    localStorage.setItem('shifts', JSON.stringify(shifts));
}

function loadUserShift() {
    fetch('backend/get_user_data.php', { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (!data || data.status !== 'success') return;
            if (!data.user.shift || !data.user.shift_date) return;

            const label = document.getElementById('user-shift-label');
            const checkbox = document.getElementById('show-user-shift');
            const toggleDiv = document.getElementById('user-shift-toggle');

            const [work, off] = data.user.shift.split('-').map(Number);
            const startDate = new Date(data.user.shift_date + 'T00:00:00');
            userShift = {
                name: `${data.user.firstname} ${data.user.lastname}`.trim(),
                workWeeks: work,
                offWeeks: off,
                startDate,
                color: '#66B2FF',
                visible: localStorage.getItem('showUserShift') !== '0',
                isUserShift: true
            };
            // Fjern tidligere lagret brukerskift og legg til den nye
            shifts = shifts.filter(s => !s.isUserShift);
            shifts.push(userShift);
            saveShiftsToLocalStorage();
            updateTurnusOversikt();

            if (label && checkbox && toggleDiv) {
                label.textContent = `${userShift.name} (${data.user.shift})`;
                checkbox.checked = userShift.visible;
                toggleDiv.style.display = 'block';
                checkbox.addEventListener('change', () => {
                    userShift.visible = checkbox.checked;
                    localStorage.setItem('showUserShift', checkbox.checked ? '1' : '0');
                    renderCalendar(currentMonth, currentYear);
                });
            }

            renderCalendar(currentMonth, currentYear);
        })
        .catch(() => {});
}

function updateTurnusOversikt() {
    const oversiktContainer = document.getElementById('turnus-oversikt');
    oversiktContainer.innerHTML = ''; 

    shifts.forEach(shift => {
        const turnusItem = document.createElement('div');
        turnusItem.classList.add('turnus-item');

        const colorBox = document.createElement('div');
        colorBox.classList.add('color-box');
        colorBox.style.backgroundColor = shift.color;

        const nameText = document.createElement('span');
        nameText.textContent = `${shift.name} (${shift.workWeeks}-${shift.offWeeks})`;

        turnusItem.appendChild(colorBox);
        turnusItem.appendChild(nameText);

        oversiktContainer.appendChild(turnusItem);
    });
}


function updateShiftCounts() {
    document.querySelectorAll('.day').forEach(day => {
        const shiftMarks = day.querySelectorAll('.shift-mark');
        day.style.setProperty('--shift-count', shiftMarks.length);
        shiftMarks.forEach((mark, index) => {
            mark.style.left = `calc(${index} * (100% / var(--shift-count)))`;
        });
    });
}

function toggleShiftVisibility(index) {
    shifts[index].visible = !shifts[index].visible;
    saveShiftsToLocalStorage();
    renderCalendar(currentMonth, currentYear);
}

function renderCalendar(month, year) {
    calendarGrid.innerHTML = ''; // Tøm kalenderen

    monthYearElement.textContent = `${months[month]} ${year}`;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

    let weekNumber = getWeekNumber(new Date(year, month, 1)); // Start med korrekt uke 1

    // Legg til ukenummer for den første uken
    const firstWeekRow = document.createElement('div');
    firstWeekRow.classList.add('week-number');
    firstWeekRow.textContent = weekNumber;
    calendarGrid.appendChild(firstWeekRow);

    // Fyll inn tomme celler før første dag i måneden
    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day');
        calendarGrid.appendChild(emptyCell);
    }

    // Fyll inn dagene i måneden
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        

        // Legg til datotekst
        const dateText = document.createElement('span');
        dateText.classList.add('day-text');
        dateText.textContent = day;
        dayElement.appendChild(dateText);

        // Opprett shiftContainer for skift
        const shiftContainer = document.createElement('div');
        shiftContainer.classList.add('shift-container');
        dayElement.appendChild(shiftContainer);

        const date = new Date(year, month, day);

        if (
            date.getFullYear() === currentDate.getFullYear() &&
            date.getMonth() === currentDate.getMonth() &&
            date.getDate() === currentDate.getDate()
        ) {
            dayElement.classList.add('today');
        }
        
        // Sjekk om dagen er en rød dag
        const redDay = getRedDayInfo(date);
        if (redDay) {
            dayElement.classList.add('red-day'); // Marker dagen som rød
            const holidayText = document.createElement('span');
            holidayText.classList.add('holiday-text');
            holidayText.textContent = redDay.name; // Legg til navnet på den røde dagen
            dayElement.appendChild(holidayText);
        }
        
        const specialDay = getSpecialDayInfo(date);
        if (specialDay) {
            const specialText = document.createElement('span');
            specialText.classList.add('special-text'); // Bruk samme stil som røde dager, men ingen fargeendring
            specialText.textContent = specialDay.name;
            dayElement.appendChild(specialText);
        }        

        // Sjekk om denne dagen passer med noe skift
        shifts.forEach((shift) => {
            if (!shift.visible) return;

            const daysSinceStart = Math.floor((date - shift.startDate) / (1000 * 60 * 60 * 24));
            const cycleLength = (shift.workWeeks + shift.offWeeks) * 7;

            let cyclePosition = ((daysSinceStart % cycleLength) + cycleLength) % cycleLength;
            if (cyclePosition < (shift.workWeeks * 7)) {
                const shiftBox = document.createElement('div');
                shiftBox.classList.add('shift-box');
                shiftBox.style.backgroundColor = shift.color; // Sørg for riktig farge
                shiftContainer.appendChild(shiftBox);
            }
        });

        calendarGrid.appendChild(dayElement);

        // Sjekk om vi skal starte en ny uke
        if ((day + firstDay) % 7 === 0 && day !== daysInMonth) {
            weekNumber++;
            const weekRow = document.createElement('div');
            weekRow.classList.add('week-number');
            weekRow.textContent = weekNumber;
            calendarGrid.appendChild(weekRow);
        }
    }
}

// Funksjon for å beregne ukenummer
function getWeekNumber(date) {
    const firstThursday = new Date(date.getFullYear(), 0, 4); // 4. januar er alltid i uke 1
    const firstWeekStart = new Date(firstThursday.getTime() - ((firstThursday.getDay() + 6) % 7) * 86400000); // Første mandag
    const diff = date - firstWeekStart;
    return Math.ceil((diff / (7 * 24 * 60 * 60 * 1000)));
}

function renderWeekdayRow() {
    const weekdayRow = document.querySelector('.weekday-row');
    weekdayRow.innerHTML = ''; // Fjern eksisterende innhold

    // Legg til "Uke"-overskrift
    const weekHeader = document.createElement('div');
    weekHeader.classList.add('weekday');
    weekHeader.textContent = 'Uke';
    weekdayRow.appendChild(weekHeader);

    // Legg til resten av ukedagene
    ['MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR', 'SØN'].forEach((day) => {
        const dayElement = document.createElement('div');
        dayElement.classList.add('weekday');
        dayElement.textContent = day;
        weekdayRow.appendChild(dayElement);
    });
}

function renderShiftList() {
    const shiftList = document.getElementById('shift-list');
    shiftList.innerHTML = '';

    shifts.forEach((shift, index) => {
        if (shift.isUserShift) return;
        const listItem = document.createElement('div');
        listItem.className = 'shift-item';

        listItem.innerHTML = `
            <input type="checkbox" ${shift.visible ? 'checked' : ''} onclick="toggleShiftVisibility(${index})">
            <span style="color:${shift.color}; font-weight: bold;">${shift.name}</span>
            <span>(${shift.workWeeks}-${shift.offWeeks})</span>
            <button onclick="deleteShift(${index})">Slett</button>
        `;
        
        shiftList.appendChild(listItem);
    });
    saveShiftsToLocalStorage(); // Husk å lagre etter hver endring
}

// Legg til ny turnus
const maxShifts = 10; // Sett maksgrensen her

// Initialiser kalenderen
renderCalendar(currentMonth, currentYear);
