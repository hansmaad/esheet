import { createChart } from './chart';

function query(selector, element) {
    element = element || document;
    return element.querySelector(selector);
}

function queryAll(selector, element) {
    element = element || document;
    return element.querySelectorAll(selector);
}

function render(html) {
    const e = document.createElement('div');
    e.innerHTML = html;
    return e.childNodes[0];
}


async function run() {
    const app = query('#app');
    const csv = await fetchData();
    const values = toValues(csv);
    console.log(values);
    app.appendChild(chart(toValues(csv)));
    app.appendChild(table(csv));
    
};

run();


function sum(values) {
    return values.reduce((r, c) => r + c, 0);
}

function avg(values) {
    return (values ?? values.length) ? sum(values) / values.length : 0;
}

function toNumber(valueStr) {
    return +valueStr.replace(',', '.');
}

async function fetchData() {

    const sheetUrl = `https://docs.google.com/spreadsheets/d/10mNONjabuUK7rrx4WqMF6eaScXfTsH6yEO2Lfg-p2qE/gviz/tq?tqx=out:csv&sheet=sheet1`;
    const res = await fetch(sheetUrl);
    const csv = await res.text();
    const rows = csv
        .split('\n')
        .map(parseCSVLine)
        .map(row => row.slice(0, 8))
        .filter(row => row[0]);
    return rows;
}

function toValues(csv) {
    return csv.slice(1).map(row => ({
        date: parseDate(row[0]),
        current: toNumber(row[1]),
        gas: toNumber(row[2]),
        water: toNumber(row[3]),
    }))
}

function parseDate(value) {
    // 26.09.2022 07:10:00
    const d = value.slice(0, 2);
    const m = value.slice(3, 5);
    const y = value.slice(6, 10);
    const time = value.slice(value.indexOf(' ') + 1);
    const h = time.slice(0, 2);
    const min = time.slice(3, 5);
    const sec = time.slice(6, 8);
    return new Date(y, m - 1, d, h, min, sec);
}

function table(csv) {
    const html = `<div class="table-responsive">
        <table>
            <thead>
                <tr>
                ${ csv[0].map(c => `<th>${ c }</th>`).join('') }
                </tr>
            </thead>
            <tbody>
                ${ csv.map(row => `<tr>${ row.map(c => `<td>${c}</td>`).join('') }</tr>`).join('') }
            </tbody>
        </table>
    </div>`;
    return render(html);
}

function chart(csv) {
    const chartElement = createChart(csv);
    const html = `<div class="chart-container">
        <div class="chart"></div>
        <div class="info">${info(csv)}</div>
    </div>`;
    const e = render(html);
    query('.chart', e).appendChild(chartElement);
    return e;
}



function info(values) {

    const avgGas = avg(values.map(row => row.gas)).toFixed(1);
    const avgCurrent = avg(values.map(row => row.current)).toFixed(1);
    const avgWater = avg(values.map(row => row.water)).toFixed(1);
    return `
    <div><strong>Gas avg: </strong> ${avgGas} m³</div>
    <div><strong>Current avg: </strong> ${avgCurrent} kWh</div>
    <div><strong>Water avg: </strong> ${avgWater} m³</div>
    `
}


function parseCSVLine(line) {
    let quoted = false;
    let values = [''];
    for (let i = 0; i < line.length; ++i) {
        
        const c = line[i];
        if (quoted) {
            if (c === '"') {
                quoted = false;
            }
            else {
                values[values.length - 1] += c;
            }
        }
        else {
            if (c === '"') {
                quoted = true;
            }
            else if (c === ',') {
                values.push('');
            }
        }
    }
    return values;
}