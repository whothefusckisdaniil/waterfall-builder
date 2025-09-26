const rowsContainer = document.getElementById('rows-container');
const addRowBtn = document.getElementById('add-row-btn');
const buildWaterfallBtn = document.getElementById('build-waterfall-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const refreshRateBtn = document.getElementById('refresh-rate-btn');
const usdRateInput = document.getElementById('usd-rate');
const rateStatus = document.getElementById('rate-status');
const waterfallOutput = document.getElementById('waterfall-output');
const rowCounterEl = document.getElementById('row-counter');
const rateErrorEl = document.getElementById('rate-error');

const exportModal = document.getElementById('export-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalDownloadBtn = document.getElementById('modal-download-btn');


let rowCounter = 0;
let currentWaterfall = [];

const updateRowCount = () => {
    const count = rowsContainer.children.length;
    rowCounterEl.textContent = `${count} ${count === 1 ? 'row' : 'rows'}`;
};

const addRow = () => {
    rowCounter++;
    const rowId = `row-${rowCounter}`;

    const rowElement = document.createElement('div');
    rowElement.id = rowId;
    rowElement.className = 'form-row';
    
    rowElement.innerHTML = `
        <div class="form-group cpm-group">
            <label for="cpm-${rowId}">CPM</label>
            <input type="number" name="cpm" id="cpm-${rowId}" class="input-field" placeholder="50">
            <select name="currency" class="select-field">
                <option>RUB</option>
                <option>USD</option>
            </select>
        </div>

        <div class="form-group fill-rate-group">
            <label for="fill-rate-${rowId}">Fill</label>
            <input type="number" name="fill-rate" id="fill-rate-${rowId}" class="input-field" placeholder="%">
        </div>

        <div class="form-group auto-group">
            <input type="checkbox" name="auto" id="auto-${rowId}">
            <label for="auto-${rowId}">Auto</label>
        </div>

        <div class="form-group remove-group">
            <button class="btn btn--remove btn--icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
    `;

    rowsContainer.appendChild(rowElement);

    const autoCheckbox = rowElement.querySelector('input[name="auto"]');
    const fillRateContainer = rowElement.querySelector('.fill-rate-group');
    const removeButton = rowElement.querySelector('.btn--remove');

    autoCheckbox.addEventListener('change', (event) => {
        fillRateContainer.style.visibility = event.target.checked ? 'hidden' : 'visible';
    });

    removeButton.addEventListener('click', () => {
        rowElement.remove();
        updateRowCount();
    });

    updateRowCount();
};

const getRate = async () => {
    rateStatus.textContent = 'Updating...';
    rateStatus.classList.remove('text-red-500');
    rateErrorEl.textContent = '';
    usdRateInput.classList.remove('error');

    try {
        const response = await fetch(`https://open.er-api.com/v6/latest/USD?_=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const data = await response.json();
        
        if (data && data.rates && data.rates.RUB) {
            const rate = data.rates.RUB;
            usdRateInput.value = rate.toFixed(2);
            const updateDate = new Date(data.time_last_update_utc).toLocaleDateString();
            rateStatus.textContent = `Updated on ${updateDate}`;
        } else {
            throw new Error('Could not find RUB rate in the API response.');
        }
    } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        rateStatus.textContent = 'API error. Enter rate manually.';
        rateStatus.classList.add('text-red-500');
    }
};

const readRows = () => {
    const rows = [];
    
    usdRateInput.classList.remove('error');
    rateErrorEl.textContent = '';
    
    const rate = parseFloat(usdRateInput.value);
    if (isNaN(rate) || rate <= 0) {
        usdRateInput.classList.add('error');
        rateErrorEl.textContent = 'Please set a valid rate.';
        return null;
    }

    const rowElements = rowsContainer.querySelectorAll('.form-row');
    
    rowElements.forEach(rowEl => {
        const id = rowEl.id;
        const cpmInput = rowEl.querySelector('input[name="cpm"]');
        const currencySelect = rowEl.querySelector('select[name="currency"]');
        const fillRateInput = rowEl.querySelector('input[name="fill-rate"]');
        const autoCheckbox = rowEl.querySelector('input[name="auto"]');

        const cpmValue = parseFloat(cpmInput.value) || 0;
        const currency = currencySelect.value;
        const isAuto = autoCheckbox.checked;
        const fill = isAuto ? null : (parseFloat(fillRateInput.value) || null);
        
        let cpmRub, cpmUsd;

        if (currency === 'RUB') {
            cpmRub = cpmValue;
            cpmUsd = cpmValue / rate;
        } else { // USD
            cpmUsd = cpmValue;
            cpmRub = cpmValue * rate;
        }

        rows.push({
            id: id,
            cpmValue: cpmValue,
            currency: currency,
            cpmRub: cpmRub,
            cpmUsd: cpmUsd,
            fill: fill,
            auto: isAuto
        });
    });

    return rows;
};

const generateFullWaterfall = (initialRows, rate) => {
    let baseYdRows = [];
    const generatedAutoThresholds = new Set();

    initialRows.forEach(row => {
        if (row.auto) {
            const autoRub = row.cpmRub;
            const nextMultipleOf5 = Math.ceil((autoRub + 0.0001) / 5) * 5;
            const start = Math.max(15, nextMultipleOf5);

            if (start <= 50) {
                for (let cpm = start; cpm <= 50; cpm += 5) {
                    if (generatedAutoThresholds.has(cpm)) continue;
                    generatedAutoThresholds.add(cpm);
                    
                    baseYdRows.push({
                        network: 'YD',
                        cpmRub: cpm,
                        cpmUsd: cpm / rate,
                        fill: null,
                        auto: false,
                    });
                }
            }
        } else {
            baseYdRows.push({ ...row, network: 'YD' });
        }
    });

    const fillRateThresholds = [];
    const processingQueue = [...baseYdRows];
    const processedCpms = new Set(baseYdRows.map(r => r.cpmRub.toFixed(2)));

    while(processingQueue.length > 0) {
        const row = processingQueue.shift(); 

        if (row.fill === null) continue; 

        if (row.cpmRub >= 150) {
            let numThresholds = 0;
            
            if (row.fill > 9) {
                numThresholds = Math.floor(row.fill / 2);
            }
            else if (row.fill > 1.5 && row.fill <= 9) {
                numThresholds = Math.floor(row.fill / 1.5);
            }
            else if (row.fill >= 0.5 && row.fill <= 1.5) {
                numThresholds = Math.floor(row.fill / 0.5);
            }
            
            if (numThresholds > 0) {
                for (let i = 1; i <= numThresholds; i++) {
                    const newCpm = row.cpmRub + (25 * i);
                    const newCpmStr = newCpm.toFixed(2);
                    if (processedCpms.has(newCpmStr)) continue;

                    const newThreshold = { network: 'YD', cpmRub: newCpm, cpmUsd: newCpm / rate, fill: null, auto: false };
                    fillRateThresholds.push(newThreshold);
                    processedCpms.add(newCpmStr);
                }
            }
        } 
        else if (row.cpmRub > 100 && row.cpmRub < 150 && row.fill > 2) {
             const newCpm = row.cpmRub + 10;
             const newCpmStr = newCpm.toFixed(2);
             if (!processedCpms.has(newCpmStr)) {
                const newThreshold = { network: 'YD', cpmRub: newCpm, cpmUsd: newCpm / rate, fill: row.fill, auto: false };
                fillRateThresholds.push(newThreshold);
                processedCpms.add(newCpmStr);
                if (newCpm < 150) {
                    processingQueue.push(newThreshold); 
                }
             }
        }
        else if (row.cpmRub >= 50 && row.cpmRub <= 100 && row.fill > 5) {
             const newCpm = row.cpmRub + 10;
             const newCpmStr = newCpm.toFixed(2);
             if (!processedCpms.has(newCpmStr)) {
                const newThreshold = { network: 'YD', cpmRub: newCpm, cpmUsd: newCpm / rate, fill: row.fill, auto: false };
                fillRateThresholds.push(newThreshold);
                processedCpms.add(newCpmStr);
                if (newCpm < 150) {
                   processingQueue.push(newThreshold);
                }
             }
        }
    }


    const allYdRows = [...baseYdRows, ...fillRateThresholds];

    const mtRows = allYdRows.map(ydRow => {
        const fillForMt = ydRow.id ? ydRow.fill : null; 
        const cpmUsdForMt = ydRow.cpmRub / 100;
        const cpmRubForMt = cpmUsdForMt * rate;

        return {
            network: 'MT',
            cpmUsd: cpmUsdForMt,
            cpmRub: cpmRubForMt,
            fill: fillForMt,
            auto: false,
        };
    });

    let finalWaterfall = [...allYdRows, ...mtRows];
    finalWaterfall.sort((a, b) => b.cpmRub - a.cpmRub);

    const uniqueWaterfall = finalWaterfall.filter((item, index, self) =>
        index === self.findIndex((t) => (
            t.network === item.network && t.cpmRub.toFixed(4) === item.cpmRub.toFixed(4)
        ))
    );

    return uniqueWaterfall.map(row => {
        if(row.network === 'YD' && !row.id) { 
            return {...row, fill: null};
        }
        return row;
    });
};

const renderTable = (waterfall) => {
    waterfallOutput.innerHTML = '';

    if (!waterfall || waterfall.length === 0) {
        waterfallOutput.innerHTML = '<p class="placeholder-text">Your generated waterfall will appear here.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'results-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Ad Network</th>
                <th>CPM (rubles)</th>
                <th>CPM (usd)</th>
                <th>Fill rate (%)</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');

    waterfall.forEach(row => {
        const tr = document.createElement('tr');
        const fillDisplay = row.fill !== null ? `${row.fill}%` : '—';
        
        let networkDisplay;
        if (row.network === 'YD') {
            networkDisplay = `<span class="network-y">Y</span><span class="network-d">D</span>`;
        } else {
            networkDisplay = `<span class="network-m">M</span><span class="network-t">T</span>`;
        }

        tr.innerHTML = `
            <td class="network-cell">${networkDisplay}</td>
            <td>${row.cpmRub.toFixed(2)}</td>
            <td>$${row.cpmUsd.toFixed(2)}</td>
            <td>${fillDisplay}</td>
        `;
        tbody.appendChild(tr);
    });

    waterfallOutput.appendChild(table);
};

const downloadCSV = (data) => {
    const headers = ['Ad Network', 'CPM (rubles)', 'CPM (usd)'];
    const csvRows = [headers.join(',')];

    data.forEach(row => {
        const values = [
            row.network,
            row.cpmRub.toFixed(2),
            row.cpmUsd.toFixed(2)
        ];
        csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'waterfall.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const showModal = () => {
    exportModal.classList.remove('hidden');
    exportModal.style.opacity = '1';
    exportModal.querySelector('.modal-content').style.transform = 'scale(1)';
};
const hideModal = () => {
    exportModal.style.opacity = '0';
    exportModal.querySelector('.modal-content').style.transform = 'scale(0.95)';
    setTimeout(() => {
        exportModal.classList.add('hidden');
    }, 300);
};

addRowBtn.addEventListener('click', addRow);

buildWaterfallBtn.addEventListener('click', () => {
    const initialRows = readRows();
    if (!initialRows) return; 
    
    const rate = parseFloat(usdRateInput.value);
    const waterfall = generateFullWaterfall(initialRows, rate);
    currentWaterfall = waterfall;
    renderTable(waterfall);
});

exportCsvBtn.addEventListener('click', () => {
    if (currentWaterfall.length === 0) {
        alert('Please build a waterfall first before exporting.');
        return;
    }
    showModal();
});

refreshRateBtn.addEventListener('click', getRate);

modalCloseBtn.addEventListener('click', hideModal);
modalCancelBtn.addEventListener('click', hideModal);
modalDownloadBtn.addEventListener('click', () => {
    downloadCSV(currentWaterfall);
    hideModal();
});

document.addEventListener('DOMContentLoaded', () => {
    addRow(); 
    getRate(); 
});

