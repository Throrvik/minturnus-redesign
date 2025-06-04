document.addEventListener('DOMContentLoaded', function () {
    const wageClassElement = document.getElementById('wage-class');
    const wageLevelElement = document.getElementById('wage-level');
    const hoursRegularElement = document.getElementById('hours-regular');
    const hoursOvertimeElement = document.getElementById('hours-overtime');
    const hoursShiftElement = document.getElementById('hours-shift');
    const hoursNightElement = document.getElementById('hours-night');
    const positionSupplementElement = document.getElementById('position-supplement');
    const holidayDaysElement = document.getElementById('holiday-days');
    const taxPercentageElement = document.getElementById('tax-percentage');

    const totalBruttoElement = document.getElementById('total-brutto');
    const totalTaxElement = document.getElementById('total-tax');
    const netPayElement = document.getElementById('net-pay');
    const grossIncludingHolidayElement = document.getElementById('gross-including-holiday');

    // Definér lønnsdata
    const salaryData = {
        "A1": [61200, 62600, 64013, 65471, 67010, 68548, 70090],
        "A": [60931, 62329, 63727, 65141, 66547, 67958, 69444],
        "B": [58862, 60246, 61630, 63038, 64400, 65801, 67228],
        "C": [57288, 58630, 59982, 61358, 62733, 64123, 65514],
        "D": [55288, 56538, 57802, 59084, 60367, 61651, 62953],
        "E": [52888, 54150, 55418, 56692, 57967, 59243, 60522]
    };

    function calculate() {
        const wageClass = wageClassElement.value;
        const wageLevel = parseInt(wageLevelElement.value, 10);
        const hoursRegular = parseFloat(hoursRegularElement.value) || 0;
        const hoursOvertime = parseFloat(hoursOvertimeElement.value) || 0;
        const hoursShift = parseFloat(hoursShiftElement.value) || 0;
        const hoursNight = parseFloat(hoursNightElement.value) || 0;
        const positionSupplement = parseFloat(positionSupplementElement.value) || 0;
        const holidayDays = parseFloat(holidayDaysElement.value) || 0;
        const taxPercentage = parseFloat(taxPercentageElement.value) / 100;

        // Få månedslønn basert på klasse og trinn
        const monthlySalary = salaryData[wageClass][wageLevel];
        const hourlyRate = monthlySalary / 160;

        // Beregninger
        const regularPay = hourlyRate * hoursRegular;
        const overtimePay = hourlyRate * 1.5 * hoursOvertime;
        const shiftPay = hoursShift * 50;  // Eksempel på tillegg
        const nightPay = hoursNight * 75;  // Eksempel på tillegg

        const totalBrutto = regularPay + overtimePay + shiftPay + nightPay + positionSupplement;

        // Skatt og netto lønn
        const tax = totalBrutto * taxPercentage;
        const netPay = totalBrutto - tax;

        // Brutto inkludert feriepenger (antatt 12%)
        const grossIncludingHoliday = totalBrutto * 1.12;

        // Oppdater HTML med resultater
        totalBruttoElement.textContent = `${totalBrutto.toFixed(2)} kr`;
        totalTaxElement.textContent = `${tax.toFixed(2)} kr`;
        netPayElement.textContent = `${netPay.toFixed(2)} kr`;
        grossIncludingHolidayElement.textContent = `${grossIncludingHoliday.toFixed(2)} kr`;
    }

    // Event listeners for inputfelter
    wageClassElement.addEventListener('change', calculate);
    wageLevelElement.addEventListener('change', calculate);
    hoursRegularElement.addEventListener('input', calculate);
    hoursOvertimeElement.addEventListener('input', calculate);
    hoursShiftElement.addEventListener('input', calculate);
    hoursNightElement.addEventListener('input', calculate);
    positionSupplementElement.addEventListener('input', calculate);
    holidayDaysElement.addEventListener('input', calculate);
    taxPercentageElement.addEventListener('input', calculate);

    // Kjør første beregning
    calculate();
});