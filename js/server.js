const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Simulert database (i minne)
let users = [];

app.use(bodyParser.json());
app.use(express.static('public')); // For å serve HTML-filer som login.html og register.html

// Registrerings-API
app.post('/api/register', (req, res) => {
    const { firstname, email, password } = req.body;

    // Sjekk om e-post allerede er registrert
    if (users.find(user => user.email === email)) {
        return res.json({ success: false, message: 'E-posten er allerede registrert.' });
    }

    // Legg til ny bruker i databasen
    users.push({ firstname, email, password });
    res.json({ success: true });
});

// Innlogging-API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Ugyldig e-post eller passord.' });
    }
});

// Start serveren
app.listen(port, () => {
    console.log(`Server kjører på http://localhost:${port}`);
});

document.addEventListener("DOMContentLoaded", function() {
    fetch("backend/besok.php") // Sjekk at denne stien er riktig
        .then(response => response.json())
        .then(data => {
            console.log("Data mottatt:", data); // Debugging
            document.getElementById("besok-teller").innerText = `Antall besøk: ${data.besok}`;
        })
        .catch(error => console.error("Feil ved henting av besøkstall:", error));
});
