// app.js
let rawRows = [];
let filteredRows = [];
let chart;
let showTemp = true;
let showHum = true;
let averagePerHour = false;

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  bindUI();
  document.querySelector('.year')?.setAttribute('data-year', new Date().getFullYear());
});

function bindUI(){
  $('#btnShowTemp').addEventListener('click', () => { showTemp = !showTemp; renderChart(); toggleActive('#btnShowTemp', showTemp); });
  $('#btnShowHum').addEventListener('click', () => { showHum = !showHum; renderChart(); toggleActive('#btnShowHum', showHum); });
  $('#btnAvgHour').addEventListener('click', () => { averagePerHour = !averagePerHour; renderChart(); toggleActive('#btnAvgHour', averagePerHour); });

  $('#applyFilters').addEventListener('click', () => applyFilters());
  $('#resetFilters').addEventListener('click', () => { resetFilters(); filteredRows = rawRows.slice(); render(); });
  $('#showAll').addEventListener('click', () => { resetFilters(); filteredRows = rawRows.slice(); render(); });
  $('#last24').addEventListener('click', () => quickLast24h());
  $('#today').addEventListener('click', () => quickToday());
}

function toggleActive(selector, isActive){
  const el = document.querySelector(selector);
  if(!el) return;
  el.style.filter = isActive ? 'none' : 'grayscale(100%) brightness(0.85)';
  el.style.opacity = isActive ? '1' : '0.7';
}

function getSheetUrl(){ try { return CONFIG.SHEET_URL + (CONFIG.SHEET_URL.includes('?') ? '&' : '?') + '_ts=' + Date.now(); } catch(e){ return CONFIG.SHEET_URL; } }
function loadData(){
  Papa.parse(getSheetUrl(), {
    download:true, header:true, dynamicTyping:false, skipEmptyLines:true,
    complete: (res)=>{
      rawRows = res.data.map(cleanRow).filter(r => r && !isNaN(r.temp) && !isNaN(r.hum));
      // ordenar por fecha asc
      rawRows.sort((a,b)=> a.date - b.date);
      filteredRows = rawRows.slice();
      hydrateFilters(rawRows);
      render();
    },
    error: (err)=>{
      alert("No se pudo leer datos. ¿Publicaste la hoja como 'Publicar en la web'?\n" + err);
    }
  });
}

function cleanRow(row){
  // columnas esperadas
  // 'Fecha / Hora', 'Temperatura Ambiente (ºC)', 'Humedad Ambiente  (%)', 'DIA','MES','AÑO','HORA','MINUTOS'
  const dateStr = (row['Fecha / Hora'] || '').trim();
  const tempStr = (row['Temperatura Ambiente (ºC)'] || '').toString().replace(',', '.').trim();
  const humStr  = (row['Humedad Ambiente  (%)'] || '').toString().replace(',', '.').trim();

  const date = parseDate(dateStr);
  if(!date.isValid()) return null;

  const obj = {
    date: date.toDate(),
    label: date.format('DD/MM/YYYY HH:mm:ss'),
    temp: parseFloat(tempStr),
    hum: parseFloat(humStr),
    year: parseInt(row['AÑO'] || date.year()),
    month: parseInt(row['MES'] || date.month()+1),
    day: parseInt(row['DIA'] || date.date()),
    hour: parseInt(row['HORA'] || date.hour()),
    minute: parseInt(row['MINUTOS'] || date.minute())
  };
  return obj;
}

function parseDate(s){
  // Probar múltiples formatos definidos en CONFIG
  for(const f of CONFIG.DATE_FORMATS){
    const d = dayjs(s, f, true);
    if(d.isValid()) return d;
  }
  // fallback parse nativo
  return dayjs(s);
}

function hydrateFilters(rows){
  const uniq = (arr)=> [...new Set(arr)].sort((a,b)=> a-b);
  fillSelect('#fYear',   uniq(rows.map(r=>r.year)));
  fillSelect('#fMonth',  uniq(rows.map(r=>r.month)));
  fillSelect('#fDay',    uniq(rows.map(r=>r.day)));
  fillSelect('#fHour',   uniq(rows.map(r=>r.hour)));
  fillSelect('#fMinute', uniq(rows.map(r=>r.minute)));
}

function fillSelect(sel, values){
  const el = $(sel);
  const current = el.value;
  // limpiar excepto opción 0
  el.options.length = 1;
  values.forEach(v=>{
    const op = document.createElement('option');
    op.value = v;
    op.textContent = v;
    el.appendChild(op);
  });
  el.value = current;
}

function applyFilters(){
  const y = $('#fYear').value;
  const m = $('#fMonth').value;
  const d = $('#fDay').value;
  const h = $('#fHour').value;
  const mi = $('#fMinute').value;

  filteredRows = rawRows.filter(r =>
    (y? r.year==y : true) &&
    (m? r.month==m : true) &&
    (d? r.day==d : true) &&
    (h? r.hour==h : true) &&
    (mi? r.minute==mi : true)
  );
  render();
}

function resetFilters(){
  $$('#fYear, #fMonth, #fDay, #fHour, #fMinute').forEach(el=> el.value = '');
}

function quickToday(){
  const now = dayjs();
  $('#fYear').value = now.year();
  $('#fMonth').value = now.month()+1;
  $('#fDay').value = now.date();
  $('#fHour').value = '';
  $('#fMinute').value = '';
  applyFilters();
}

function quickLast24h(){
  const limit = dayjs().subtract(24, 'hour');
  filteredRows = rawRows.filter(r => dayjs(r.date).isAfter(limit));
  render();
}

function render(){
  // KPIs
  if(filteredRows.length){
    const last = filteredRows[filteredRows.length-1];
    $('#kpiTemp').textContent = `${last.temp.toFixed(1)} °C`;
    $('#kpiHum').textContent  = `${last.hum.toFixed(0)} %`;
    $('#kpiTime').textContent = last.label;
  }else{
    $('#kpiTemp').textContent = '--';
    $('#kpiHum').textContent  = '--';
    $('#kpiTime').textContent = '--';
  }
  renderChart();
}

function renderChart(){
  const rows = averagePerHour ? groupByHour(filteredRows) : filteredRows;

  const labels = rows.map(r=>r.label);
  const temps = rows.map(r=>r.temp);
  const hums  = rows.map(r=>r.hum);

  const ctx = document.getElementById('chart').getContext('2d');
  if(chart) chart.destroy();

  const datasets = [];
  if(showTemp){
    datasets.push({
      label:'Temperatura (°C)',
      data: temps,
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, .15)',
      tension:.25,
      yAxisID:'y'
    });
  }
  if(showHum){
    datasets.push({
      label:'Humedad (%)',
      data: hums,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, .15)',
      tension:.25,
      yAxisID:'y1'
    });
  }

  chart = new Chart(ctx, {
    type:'line',
    data:{ labels, datasets },
    options:{
      responsive:true,
      interaction:{ mode:'index', intersect:false },
      plugins:{
        legend:{ labels:{ color:'#dbeafe' } },
        title:{ display:true, text: averagePerHour ? 'Temperatura y Humedad (Promedio por hora)' : 'Temperatura y Humedad', color:'#e5e7eb' },
        tooltip:{
          callbacks:{
            title:(ctx)=> ctx[0]?.label || '',
          }
        }
      },
      scales:{
        x:{ ticks:{ color:'#cbd5e1' } },
        y:{ position:'left', grid:{ color:'#ffffff15' }, ticks:{ color:'#fde68a' } },
        y1:{ position:'right', grid:{ drawOnChartArea:false, color:'#ffffff15' }, ticks:{ color:'#bfdbfe' } }
      }
    }
  });
}


function groupByHour(rows){
  const map = new Map();
  rows.forEach(r=>{
    const hourKey = dayjs(r.date).format('YYYY-MM-DD HH:00');
    if(!map.has(hourKey)) map.set(hourKey, {temps:[], hums:[], first: dayjs(r.date).startOf('hour'), last: dayjs(r.date)});
    const obj = map.get(hourKey);
    obj.temps.push(r.temp);
    obj.hums.push(r.hum);
    // guarda la hora real del último dato visto en ese bucket
    obj.last = dayjs(r.date);
  });
  const out = [];
  for(const [key, v] of map){
    const tavg = v.temps.reduce((a,b)=>a+b,0)/v.temps.length;
    const havg = v.hums.reduce((a,b)=>a+b,0)/v.hums.length;
    // etiqueta usando la hora/min del último dato del bucket (más intuitivo)
    const labelTime = v.last.format('DD/MM/YYYY HH:mm');
    out.push({label: labelTime, temp: tavg, hum: havg, date: v.last.toDate()});
  }
  out.sort((a,b)=> a.date - b.date);
  return out;
}

  out.sort((a,b)=> a.date - b.date);
  return out;
}
