const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');

const token = process.env.TOKEN || 'Bearer test';

// Middleware für die Authentifizierung
const authenticate = (req, res, next) => {
  const receivedToken = req.headers.authorization;

  if (receivedToken === token) {
    next(); // Token ist korrekt, setze den Request fort
  } else {
    res.status(401).send('Unauthorized'); // Fehler: Nicht autorisiert
  }
};

// GET /entries - Alle Einträge aus der JSON-Datei ausgeben
app.get('/entries', (req, res) => {
    fs.readFile('urlData.json', 'utf8')
      .then((data) => {
        const urlData = JSON.parse(data);
        res.json(urlData);
      })
      .catch((err) => {
        console.error('Fehler beim Lesen der Datei:', err);
        res.status(500).send('Fehler beim Laden der Daten');
      });
  });

// GET /:slug - Umleiten zur entsprechenden Domain
app.get('/:slug', (req, res) => {
  const { slug } = req.params;
  // Lade die Daten aus der JSON-Datei
  fs.readFile('urlData.json', 'utf8')
    .then((data) => {
      const urlData = JSON.parse(data);
      if (urlData[slug]) {
        res.redirect(urlData[slug]);
      } else {
        res.status(404).send('URL-Slug nicht gefunden');
      }
    })
    .catch((err) => {
      console.error('Fehler beim Lesen der Datei:', err);
      res.status(500).send('Fehler beim Laden der Daten');
    });
});

// DELETE /entry/:slug - Eintrag mit der gegebenen Slug aus der Datei entfernen
app.delete('/entry/:slug', authenticate, (req, res) => {
  const { slug } = req.params;
  fs.readFile('urlData.json', 'utf8')
    .then((data) => {
      const urlData = JSON.parse(data);
      if (urlData[slug]) {
        delete urlData[slug];
        fs.writeFile('urlData.json', JSON.stringify(urlData, null, 2))
          .then(() => res.send(`Eintrag mit Slug ${slug} gelöscht`))
          .catch((err) => {
            console.error('Fehler beim Schreiben der Datei:', err);
            res.status(500).send('Fehler beim Speichern der Daten');
          });
      } else {
        res.status(404).send('URL-Slug nicht gefunden');
      }
    })
    .catch((err) => {
      console.error('Fehler beim Lesen der Datei:', err);
      res.status(500).send('Fehler beim Laden der Daten');
    });
});

// POST /entry - URL und Slug zum Speichern entgegennehmen, mit Authentifizierung
app.post('/entry', authenticate, express.json(), (req, res) => {
  const { url, slug } = req.body;
  if (!url) {
    return res.status(400).send('URL fehlt');
  }

  fs.readFile('urlData.json', 'utf8')
    .then((data) => {
      const urlData = JSON.parse(data);
      const newSlug = slug || uuidv4();
      urlData[newSlug] = url;
      return fs.writeFile('urlData.json', JSON.stringify(urlData, null, 2))
        .then(() => res.send(`URL-Slug ${newSlug} erfolgreich hinzugefügt`))
        .catch((err) => {
          console.error('Fehler beim Schreiben der Datei:', err);
          res.status(500).send('Fehler beim Speichern der Daten');
        });
    })
    .catch((err) => {
      console.error('Fehler beim Lesen der Datei:', err);
      res.status(500).send('Fehler beim Laden der Daten');
    });
});

app.listen(PORT, () => {
  console.log(`Der Server läuft auf Port ${PORT}`);
});