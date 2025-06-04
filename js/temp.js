document.addEventListener("DOMContentLoaded", function () {
    function fetchTemperature() {
        fetch("backend/temp.php") // Henter temperaturen fra serveren
            .then(response => response.json())
            .then(data => {
                const temp = data.temperature; // Henter temperaturverdien
                document.getElementById("temp-display").innerText = `${temp}°C`;

                // Oppdater fargen på temperaturstolpen
                const tempBar = document.getElementById("temp-bar");
                let percent = Math.min(Math.max((temp + 20) / 60, 0), 1); // Normaliserer verdi (-20°C til 40°C)
                tempBar.style.height = `${percent * 100}%`;
                tempBar.style.background = `rgb(${255 * percent}, ${50 * (1 - percent)}, ${255 * (1 - percent)})`;
            })
            .catch(error => {
                console.error("Feil ved henting av temperatur:", error);
                document.getElementById("temp-display").innerText = "Feil ved henting av temperatur.";
            });
    }

    fetchTemperature();
    setInterval(fetchTemperature, 5000); // Oppdaterer hvert 5. sekund
});
