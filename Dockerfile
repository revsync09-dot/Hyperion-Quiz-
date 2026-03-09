# Verwende ein leichtes Node.js-Image (Alpine ist sehr klein und schnell)
FROM node:20-alpine

# Arbeitsverzeichnis im Container festlegen
WORKDIR /app

# Nur die package.json & package-lock.json kopieren 
# (Damit Docker Caching effizient nutzen kann)
COPY package*.json ./

# Nur produktive Abhängigkeiten installieren (ohne Dev-Abhängigkeiten wie 'concurrently')
RUN npm ci --omit=dev

# Den restlichen Code des Bots kopieren (ohne den 'website' Ordner)
COPY src/ ./src/

# Keine Ports nach außen öffnen, da der Bot nur Websockets nutzt (Northflank braucht hier keine Ports)

# Den Startbefehl festlegen
CMD ["npm", "run", "bot"]
