// config.js
// ⚠️ IMPORTANTE: Publica tu Google Sheet como 'Publicar en la Web' (Archivo → Compartir → Publicar en la web)
// Luego usa esta URL CSV (reemplaza 'Hoja1' si cambia el nombre de la pestaña)
const CONFIG = {
  SHEET_URL: "https://docs.google.com/spreadsheets/d/1cUd239eUP5Hj3WJnH3_cS6AOhTzzCG8hqU-ZKvuElDY/gviz/tq?tqx=out:csv&sheet=Hoja1",
  // Formato de fecha que llega desde la hoja (ej: '7/09/2025 12:23:01' o '20/01/2025 21:34:26')
  DATE_FORMATS: ["D/M/YYYY H:mm:ss", "DD/MM/YYYY H:mm:ss", "D/M/YYYY HH:mm:ss", "DD/MM/YYYY HH:mm:ss"]
};
