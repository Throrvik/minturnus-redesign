// JavaScript for kalenderen
const currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

const monthYearElement = document.getElementById('month-year');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const calendarGrid = document.querySelector('.calendar-grid');
const container = document.querySelector('.container');
const yearContainer = document.getElementById('year-container');
const todayButton = document.getElementById('today-button');
const toggleYearButton = document.getElementById('toggle-year');
let isYearView = false;

console.log("🚀 kalender.js er lastet!");

// Turnuser
let shifts = [];
let userShift = null;
let colleagues = [];
let selectedColleagues = [];
let colleagueColorPref = {};
let currentUserFirstName = '';
const allColors = [
  "#FF6666", "#FFB266", "#FFFF66", "#B2FF66", "#66FFB2",
  "#66B2FF", "#CC66FF", "#FF66B2", "#66FF66", "#CCCCCC",
  "#FF8C00", "#FFD700", "#7CFC00", "#40E0D0", "#1E90FF",
  "#BA55D3", "#FF1493", "#32CD32", "#D3D3D3", "#8B0000",
  "#A52A2A", "#2E8B57", "#4682B4", "#FF4500", "#DA70D6",
  "#B0C4DE", "#8A2BE2", "#20B2AA", "#FF6347", "#9ACD32"
];

function getNextAvailableColor() {
  const usedColors = shifts.map(s => s.color);
  if (userShift) usedColors.push(userShift.color);
  selectedColleagues.forEach(c => c.color && usedColors.push(c.color));
  return allColors.find(c => !usedColors.includes(c));
}

function loadColleagueColorPrefs() {
  const s = localStorage.getItem('colleagueColorPref');
  colleagueColorPref = s ? JSON.parse(s) : {};
}

function saveColleagueColorPrefs() {
  localStorage.setItem('colleagueColorPref', JSON.stringify(colleagueColorPref));
}
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

function parseShiftString(str) {
    if (!str) return [null, null];
    if (str === 'mandag-fredag') {
        return [5 / 7, 2 / 7];
    }
    if (str.startsWith('D')) {
        const parts = str.substring(1).split('-').map(Number);
        if (parts.length === 2 && !parts.some(isNaN)) {
            return [parts[0] / 7, parts[1] / 7];
        }
    }
    const parts = str.split('-').map(Number);
    if (parts.length === 2 && !parts.some(isNaN)) {
        return parts;
    }
    return [null, null];
}


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
    loadSelectedColleagues();
    loadColleagueColorPrefs();
    loadColleaguesList();
    loadUserShift();
    renderCalendar(currentMonth, currentYear);
    renderShiftList();
});

function initializeEventListeners() {
    prevMonthButton.addEventListener('click', () => {
        if (isYearView) {
            currentYear--;
            renderYearCalendar(currentYear);
        } else {
            if (currentMonth === 0) {
                currentMonth = 11;
                currentYear--;
            } else {
                currentMonth--;
            }
            renderCalendar(currentMonth, currentYear);
        }
    });

    nextMonthButton.addEventListener('click', () => {
        if (isYearView) {
            currentYear++;
            renderYearCalendar(currentYear);
        } else {
            if (currentMonth === 11) {
                currentMonth = 0;
                currentYear++;
            } else {
                currentMonth++;
            }
            renderCalendar(currentMonth, currentYear);
        }
    });

    if (todayButton) {
        todayButton.addEventListener('click', () => {
            currentMonth = currentDate.getMonth();
            currentYear = currentDate.getFullYear();
            isYearView = false;
            updateView();
        });
    }

    if (toggleYearButton) {
        toggleYearButton.addEventListener('click', () => {
            isYearView = !isYearView;
            updateView();
        });
    }

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

    shifts = shifts.filter(s => s.isUserShift || s.isColleagueShift);
    saveShiftsToLocalStorage();
    updateView(); // Oppdater kalenderen
    renderShiftList(); // Oppdaterer listen som viser turnuser

    // Tøm oversikten under kalenderen
    const oversiktContainer = document.getElementById('turnus-oversikt');
    oversiktContainer.innerHTML = ''; // Fjern alt innhold
    showMessage('Skjemaet ble t\u00f8mt.', 'success');
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
    const color = getNextAvailableColor();


    
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
        type: isDayBased ? 'dagbasert' : 'ukebasert',
        raw: isDayBased ? `D${workPeriod}-${offPeriod}` : `${workPeriod}-${offPeriod}`
    };

    shifts.push(shift);


    saveShiftsToLocalStorage();
    renderShiftList();
    updateView();
    updateTurnusOversikt();

    // Nullstill skjemaet etterpå
    document.getElementById('shift-name').value = '';
    document.getElementById('shift-start').value = '';

}


// Funksjon for å slette en turnus
function deleteShift(index) {
    if (shifts[index].isColleagueShift || shifts[index].isUserShift) return;
    shifts.splice(index, 1);

    saveShiftsToLocalStorage();
    renderShiftList();
    updateView();
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
                shift.startDate.toISOString(), shift.color].join('|');
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        saveShiftsToLocalStorage();
    }
    updateTurnusOversikt(); // Kall funksjonen her for å oppdatere visningen ved lasting

}

// Lagre turnuser til localStorage
function saveShiftsToLocalStorage() {
    const custom = shifts.filter(s => !s.isUserShift && !s.isColleagueShift);
    localStorage.setItem('shifts', JSON.stringify(custom));
}

function loadSelectedColleagues() {
    const stored = localStorage.getItem('selectedColleagues');
    if (stored) {
        selectedColleagues = JSON.parse(stored);
    }
}

function saveSelectedColleagues() {
    localStorage.setItem('selectedColleagues', JSON.stringify(selectedColleagues));
}


function loadColleaguesList() {
    fetch('api/my_colleagues.php', { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
            if (!Array.isArray(data)) return;
            colleagues = data.filter(c => !c.info_hide);
            // Fjern valgte kollegaer som ikke finnes lenger
            selectedColleagues = selectedColleagues.filter(sc =>
                colleagues.some(c => c.id === sc.id && c.shift && c.shift_date)
            );
            saveSelectedColleagues();
            renderColleagueList();
            applySelectedColleagueShifts();
        });
}

function renderColleagueList(filter = '') {
    const list = document.getElementById('colleague-list');
    if (!list) return;
    list.innerHTML = '';
    const term = filter.toLowerCase();
    colleagues
        .filter(c => (`${c.firstname} ${c.lastname}`.trim()).toLowerCase().includes(term))
        .sort((a, b) => `${a.firstname} ${a.lastname}`.localeCompare(`${b.firstname} ${b.lastname}`))
        .forEach(c => {
            const item = document.createElement('div');
            item.className = 'colleague-item';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = selectedColleagues.some(sc => sc.id === c.id);
            cb.addEventListener('change', () => toggleColleagueSelection(c.id, cb.checked));
            const label = document.createElement('label');
            label.textContent = `${c.firstname} ${c.lastname}`.trim();
            label.className = 'colleague-name';
            label.addEventListener('click', () => showColleagueCard(c.id));
            item.appendChild(cb);
            item.appendChild(label);
            list.appendChild(item);
        });
    const search = document.getElementById('colleague-search');
    if (search && !search.oninput) {
        search.addEventListener('input', e => renderColleagueList(e.target.value));
    }
}

function showColleagueCard(id) {
    fetch(`api/user_info.php?id=${id}`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
            if (!data || data.status !== 'success') return;
            const modal = document.getElementById('colleague-modal');
            const content = document.getElementById('colleague-content');
            const card = createProfileCard(data.user);
            content.innerHTML = '';
            content.appendChild(card);
            modal.style.display = 'block';
            const closeBtn = document.getElementById('colleague-close');
            if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
            window.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };
        });
}

function toggleColleagueSelection(id, checked) {
    if (checked) {
        if (!selectedColleagues.some(c => c.id === id)) {
            const pref = colleagueColorPref[id];
            selectedColleagues.push({ id, color: pref || getNextAvailableColor() });
        }
    } else {
        selectedColleagues = selectedColleagues.filter(c => c.id !== id);
    }
    saveSelectedColleagues();
    applySelectedColleagueShifts();
}

function applySelectedColleagueShifts() {
    shifts = shifts.filter(s => !s.isColleagueShift);
    selectedColleagues.forEach(sel => {
        const c = colleagues.find(col => col.id === sel.id);
        if (!c || !c.shift || !c.shift_date) return;
        const [work, off] = parseShiftString(c.shift);
        if (work === null || off === null) return;
        const startDate = new Date(c.shift_date + 'T00:00:00');
        const prefColor = colleagueColorPref[sel.id];
        const shift = {
            name: `${c.firstname} ${c.lastname}`.trim(),
            workWeeks: work,
            offWeeks: off,
            startDate,
            color: prefColor || sel.color || getNextAvailableColor(),
            visible: true,
            isColleagueShift: true,
            colleagueId: c.id,
            raw: c.shift
        };
        sel.color = shift.color;
        shifts.push(shift);
    });
    saveSelectedColleagues();
    saveShiftsToLocalStorage();
    renderShiftList();
    updateTurnusOversikt();
    updateView();
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

            const [work, off] = parseShiftString(data.user.shift);
            if (work === null || off === null) return;
            const startDate = new Date(data.user.shift_date + 'T00:00:00');
            const pref = localStorage.getItem('userColor');
            currentUserFirstName = data.user.firstname || '';
            userShift = {
                name: `${data.user.firstname} ${data.user.lastname}`.trim(),
                workWeeks: work,
                offWeeks: off,
                startDate,
                color: pref || getNextAvailableColor(),
                visible: localStorage.getItem('showUserShift') !== '0',
                isUserShift: true,
                raw: data.user.shift
            };
            // Fjern tidligere lagret brukerskift og legg til den nye
            shifts = shifts.filter(s => !s.isUserShift);
            shifts.push(userShift);
            saveShiftsToLocalStorage();
            updateTurnusOversikt();

            if (label && checkbox && toggleDiv) {
                label.textContent = `${userShift.name} (meg)`;
                checkbox.checked = userShift.visible;
                toggleDiv.style.display = 'block';
                checkbox.addEventListener('change', () => {
                    userShift.visible = checkbox.checked;
                    localStorage.setItem('showUserShift', checkbox.checked ? '1' : '0');
                    updateView();
                });
            }

            updateView();
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
        const firstName = shift.name.split(' ')[0];
        const label = shift.raw || `${shift.workWeeks}-${shift.offWeeks}`;
        nameText.textContent = `${firstName} (${label})`;

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
    updateView();
}

function renderMonthInto(targetGrid, month, year, hideText = false) {
    targetGrid.innerHTML = '';

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

    let weekNumber = getWeekNumber(new Date(year, month, 1));

    const firstWeekRow = document.createElement('div');
    firstWeekRow.classList.add('week-number');
    firstWeekRow.textContent = weekNumber;
    targetGrid.appendChild(firstWeekRow);

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day');
        targetGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');

        const dateText = document.createElement('span');
        dateText.classList.add('day-text');
        dateText.textContent = day;
        dayElement.appendChild(dateText);

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

        const redDay = getRedDayInfo(date);
        if (redDay) {
            dayElement.classList.add('red-day');
            if (!hideText) {
                const holidayText = document.createElement('span');
                holidayText.classList.add('holiday-text');
                holidayText.textContent = redDay.name;
                dayElement.appendChild(holidayText);
            }
        }

        const specialDay = getSpecialDayInfo(date);
        if (specialDay && !hideText) {
            const specialText = document.createElement('span');
            specialText.classList.add('special-text');
            specialText.textContent = specialDay.name;
            dayElement.appendChild(specialText);
        }

        shifts.forEach((shift) => {
            if (!shift.visible) return;

            const daysSinceStart = Math.floor((date - shift.startDate) / (1000 * 60 * 60 * 24));
            const cycleLength = (shift.workWeeks + shift.offWeeks) * 7;

            let cyclePosition = ((daysSinceStart % cycleLength) + cycleLength) % cycleLength;
            if (cyclePosition < (shift.workWeeks * 7)) {
                const shiftBox = document.createElement('div');
                shiftBox.classList.add('shift-box');
                shiftBox.style.backgroundColor = shift.color;
                shiftContainer.appendChild(shiftBox);
            }
        });

        targetGrid.appendChild(dayElement);

        if ((day + firstDay) % 7 === 0 && day !== daysInMonth) {
            weekNumber++;
            const weekRow = document.createElement('div');
            weekRow.classList.add('week-number');
            weekRow.textContent = weekNumber;
            targetGrid.appendChild(weekRow);
        }
    }

    // Fyll siste uke med tomme ruter om nødvendig
    const remainingDays = (7 - ((daysInMonth + firstDay) % 7)) % 7;
    for (let i = 0; i < remainingDays; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day');
        targetGrid.appendChild(emptyCell);
    }
}

function renderCalendar(month, year) {
    monthYearElement.textContent = `${months[month]} ${year}`;
    renderMonthInto(calendarGrid, month, year, false);
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

function renderYearCalendar(year) {
    yearContainer.innerHTML = '';
    monthYearElement.textContent = year;

    for (let m = 0; m < 12; m++) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('month-wrapper');

        const header = document.createElement('h3');
        header.textContent = months[m];
        wrapper.appendChild(header);

        const weekdayRow = document.createElement('div');
        weekdayRow.classList.add('weekday-row');
        const weekHeader = document.createElement('div');
        weekHeader.classList.add('weekday');
        weekHeader.textContent = 'Uke';
        weekdayRow.appendChild(weekHeader);
        ['MAN','TIR','ONS','TOR','FRE','LØR','SØN'].forEach(d => {
            const el = document.createElement('div');
            el.classList.add('weekday');
            el.textContent = d;
            weekdayRow.appendChild(el);
        });
        wrapper.appendChild(weekdayRow);

        const grid = document.createElement('div');
        grid.classList.add('calendar-grid');
        wrapper.appendChild(grid);

        renderMonthInto(grid, m, year, true);
        yearContainer.appendChild(wrapper);
    }
}

function updateView() {
    if (isYearView) {
        container.classList.add('year-view');
        calendarGrid.style.display = 'none';
        document.querySelector('.weekday-row').style.display = 'none';
        yearContainer.style.display = 'grid';
        renderYearCalendar(currentYear);
        if (toggleYearButton) toggleYearButton.textContent = 'Vis måned';
    } else {
        container.classList.remove('year-view');
        yearContainer.style.display = 'none';
        document.querySelector('.weekday-row').style.display = 'grid';
        calendarGrid.style.display = 'grid';
        renderCalendar(currentMonth, currentYear);
        if (toggleYearButton) toggleYearButton.textContent = 'Vis år';
    }
}

function renderShiftList() {
    const shiftList = document.getElementById('shift-list');
    shiftList.innerHTML = '';

    shifts.forEach((shift, index) => {
        if (shift.isUserShift || shift.isColleagueShift) return;
        const listItem = document.createElement('div');
        listItem.className = 'shift-item';

        listItem.innerHTML = `
            <input type="checkbox" ${shift.visible ? 'checked' : ''} onclick="toggleShiftVisibility(${index})">
            <span style="color:${shift.color}; font-weight: bold;">${shift.name}</span>
            <span>(${shift.raw || `${shift.workWeeks}-${shift.offWeeks}`})</span>
            <button onclick="deleteShift(${index})">Slett</button>
        `;
        
        shiftList.appendChild(listItem);
    });
    saveShiftsToLocalStorage(); // Husk å lagre etter hver endring
}

// Legg til ny turnus
const maxShifts = 10; // Sett maksgrensen her

// Initialiser kalenderen
updateView();
