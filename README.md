# AEROMON — Dashboard (Google Sheets → Gráfico)

Panel web que lee **Temperatura** y **Humedad** desde una Google Sheet (Hoja1) y permite filtrar por **Año, Mes, Día, Hora y Minuto**, además de **promediar por hora**.

## 🔗 Conectar con tu Google Sheet
1. Abre tu hoja > **Archivo → Compartir → Publicar en la web**.
2. Asegúrate de que la pestaña se llame **Hoja1** o ajusta `config.js`.
3. Usa la URL CSV en `config.js`:
   ```js
   const CONFIG = {
     SHEET_URL: "https://docs.google.com/spreadsheets/d/ID/gviz/tq?tqx=out:csv&sheet=Hoja1"
   }
   ```

## 🚀 Deploy en GitHub Pages
- Sube toda la carpeta a un repo, por ejemplo `AEROMON_Dashboard`.
- En **Settings → Pages**, publica la rama `main` con carpeta `/root`.
- Abre `https://tuusuario.github.io/AEROMON_Dashboard/`

## 🧩 Librerías
- PapaParse
- Chart.js
- Day.js (con `customParseFormat`)

## 📝 Columnas esperadas
- `Fecha / Hora`
- `Temperatura Ambiente (ºC)`
- `Humedad Ambiente  (%)`
- `DIA` `MES` `AÑO` `HORA` `MINUTOS`

