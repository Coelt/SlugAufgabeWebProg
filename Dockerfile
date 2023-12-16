# Verwende das offizielle Node.js-Image als Basis
FROM node:alpine

# Setze das Arbeitsverzeichnis im Container
WORKDIR /usr/src/app

# Kopiere die Dateien vom Host in das Arbeitsverzeichnis im Container
COPY package*.json ./
COPY . .

# Installiere Abhängigkeiten
RUN npm install

# Setze Umgebungsvariable für den Port
ENV PORT=3000

# Öffne den Port, der für die Anwendung verwendet wird
EXPOSE $PORT

# Starte die Anwendung
CMD [ "npm", "start" ]
