const inputChoiceSection = document.getElementById('input-choice');
const manualInputSection = document.getElementById('manual-input-section');
const manualAddBtn = document.getElementById('manual-add-btn');
const csvUploadInput = document.getElementById('csv-upload-input');

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
const toastNotification = document.getElementById('toast-notification');
const imagePopup = document.getElementById('image-popup');

const exportModal = document.getElementById('export-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalDownloadBtn = document.getElementById('modal-download-btn');


let rowIdCounter = 0;
let currentWaterfall = [];
let toastTimeout;
let imageTimeout;


const showToast = (message, type = 'success') => {
    clearTimeout(toastTimeout);
    clearTimeout(imageTimeout);

    let iconHTML = '';
    if (type === 'success') {
        const imageUrl = 'success-image.png';
        const imageElement = imagePopup.querySelector('img');
        imageElement.src = imageUrl;
        imagePopup.classList.add('show');
        imageTimeout = setTimeout(() => imagePopup.classList.remove('show'), 3000);
        
        iconHTML = `
            <div class="toast-icon">
                <svg class="success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle class="success-checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="success-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
            </div>`;
    } else {
        iconHTML = `
            <div class="toast-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
            </div>`;
    }
    
    toastNotification.innerHTML = `${iconHTML}<span>${message}</span>`;
    
    toastNotification.classList.remove('toast--success', 'toast--error');
    toastNotification.classList.add(`toast--${type}`);

    toastNotification.classList.add('show');

    toastTimeout = setTimeout(() => {
        toastNotification.classList.remove('show');
    }, 3000);
};

const showManualInputView = () => {
    inputChoiceSection.classList.add('hidden');
    manualInputSection.classList.remove('hidden');
    if (rowsContainer.children.length === 0) {
        addRow();
    }
};

const updateRowCount = () => {
    const count = rowsContainer.children.length;
    rowCounterEl.textContent = `${count} ${count === 1 ? 'row' : 'rows'}`;
};

const addRow = (cpm = '', fillRate = '', isAuto = false, currency = 'RUB') => {
    rowIdCounter++;
    const rowId = `row-${rowIdCounter}`;

    const rowElement = document.createElement('div');
    rowElement.id = rowId;
    rowElement.className = 'form-row';
    
    rowElement.innerHTML = `
        <div class="form-group cpm-group">
            <label for="cpm-${rowId}">CPM</label>
            <input type="number" name="cpm" id="cpm-${rowId}" class="input-field" placeholder="50" value="${cpm}">
            <select name="currency" class="select-field">
                <option value="RUB">RUB</option>
                <option value="USD">USD</option>
            </select>
        </div>

        <div class="form-group fill-rate-group" style="${isAuto ? 'visibility: hidden;' : ''}">
            <label for="fill-rate-${rowId}">Fill</label>
            <input type="number" name="fill-rate" id="fill-rate-${rowId}" class="input-field" placeholder="%" value="${fillRate}">
        </div>

        <div class="form-group auto-group">
            <input type="checkbox" name="auto" id="auto-${rowId}" ${isAuto ? 'checked' : ''}>
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
    
    const currencySelect = rowElement.querySelector('select[name="currency"]');
    currencySelect.value = currency;

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
    return rowElement;
};

const handleCsvUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            rowsContainer.innerHTML = '';
            results.data.forEach(row => {
                const adUnitName = row['Ad Unit Name'] || '';
                const lowerCaseAdUnitName = adUnitName.toLowerCase();

                const sizePattern = /\d+x\d+/;

                if (
                    lowerCaseAdUnitName.includes('_pvw_hb_b_b_1') ||
                    lowerCaseAdUnitName.includes('_pvw_hb_b_b_2') ||
                    lowerCaseAdUnitName.includes('_pvw_hb_waterfall') ||
                    lowerCaseAdUnitName.includes('_pvw_hb_b_m_1') ||
                    lowerCaseAdUnitName.includes('_pvw_hb_b_m_2') ||
                    lowerCaseAdUnitName.includes('_pvw_hb_b_pc_1') ||
                    lowerCaseAdUnitName.includes('_pvw_hb_b_pc_2') ||
                    sizePattern.test(lowerCaseAdUnitName) 
                ) {
                    return;
                }

                const fillRateRaw = row['Fill Rate'] || '0';
                const cpmVRaw = row['CPM(v) Ad system'] || '0';
                
                const parts = lowerCaseAdUnitName.split('_');
                let cpm = '';
                let isAuto = false;
                let currency = 'RUB';

                if (parts.includes('auto')) {
                    isAuto = true;
                    cpm = parseFloat(cpmVRaw).toFixed(4);
                    currency = 'USD';
                } else {
                    const cpmPart = parts.find(p => !isNaN(parseInt(p, 10)) && !p.includes('x'));
                    if (cpmPart) {
                        cpm = parseInt(cpmPart, 10);
                    }
                }

                const fillRate = parseFloat(fillRateRaw).toFixed(2);
                
                if (cpm || isAuto) {
                    addRow(cpm, fillRate, isAuto, currency);
                }
            });
            showManualInputView();
        },
        error: (error) => {
            console.error("CSV Parsing Error:", error);
            alert("Failed to parse CSV file. Please check the file format.");
        }
    });
    
    event.target.value = null;
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
        } else {
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
    const autoRows = initialRows.filter(r => r.auto);
    const manualRows = initialRows.filter(r => !r.auto);

    let baseYdRows = [...manualRows.map(r => ({ ...r, network: 'YD' }))];
    
    const fillRateThresholds = [];
    const processingQueue = [...baseYdRows];
    const processedCpms = new Set(baseYdRows.map(r => r.cpmRub.toFixed(2)));

    while(processingQueue.length > 0) {
        const row = processingQueue.shift();
        if (row.fill === null) continue;

        if (row.cpmRub >= 150) {
            let numThresholds = 0;
            if (row.fill > 9) numThresholds = Math.floor(row.fill / 2);
            else if (row.fill > 1.5) numThresholds = Math.floor(row.fill / 1.5);
            else if (row.fill >= 0.5) numThresholds = Math.floor(row.fill / 0.5);
            
            for (let i = 1; i <= numThresholds; i++) {
                const newCpm = row.cpmRub + (25 * i);
                const newCpmStr = newCpm.toFixed(2);
                if (processedCpms.has(newCpmStr)) continue;
                fillRateThresholds.push({ network: 'YD', cpmRub: newCpm, cpmUsd: newCpm / rate, fill: null, auto: false });
                processedCpms.add(newCpmStr);
            }
        } 
        else if (row.cpmRub >= 50 && row.fill > (row.cpmRub >= 100 ? 2 : 5)) {
             const newCpm = row.cpmRub + 10;
             const newCpmStr = newCpm.toFixed(2);
             if (!processedCpms.has(newCpmStr) && newCpm < 150) {
                const newThreshold = { network: 'YD', cpmRub: newCpm, cpmUsd: newCpm / rate, fill: row.fill, auto: false };
                fillRateThresholds.push(newThreshold);
                processedCpms.add(newCpmStr);
                processingQueue.push(newThreshold); 
             }
        }
    }

    const allYdRows = [...baseYdRows, ...fillRateThresholds];
    const mtRows = allYdRows.map(ydRow => ({
        network: 'MT',
        cpmUsd: ydRow.cpmRub / 100,
        cpmRub: (ydRow.cpmRub / 100) * rate,
        fill: ydRow.id ? ydRow.fill : null,
        auto: false,
    }));

    let mainWaterfall = [...allYdRows, ...mtRows].sort((a, b) => b.cpmRub - a.cpmRub);

    const uniqueWaterfall = mainWaterfall.filter((item, index, self) =>
        index === self.findIndex((t) => (t.network === item.network && t.cpmRub.toFixed(4) === item.cpmRub.toFixed(4)))
    ).map(row => (row.network === 'YD' && !row.id) ? {...row, fill: null} : row);
    
    autoRows.forEach(autoRow => {
        const ydAuto = { ...autoRow, network: 'YD' };
        const mtAuto = {
            ...autoRow,
            network: 'MT',
            cpmUsd: ydAuto.cpmRub / 100,
            cpmRub: (ydAuto.cpmRub / 100) * rate,
        };
        uniqueWaterfall.push(ydAuto);
        uniqueWaterfall.push(mtAuto);
    });

    return uniqueWaterfall;
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
        const fillDisplay = row.fill !== null ? `${row.fill.toFixed(2)}%` : '—';
        
        let networkDisplay;
        if (row.network === 'YD') {
            networkDisplay = `<span class="network-y">Y</span><span class="network-d">D</span>`;
        } else {
            networkDisplay = `<span class="network-m">M</span><span class="network-t">T</span>`;
        }
        
        const cpmRubDisplay = row.auto ? 'auto' : row.cpmRub.toFixed(2);
        const cpmUsdDisplay = row.auto ? 'auto' : `$${row.cpmUsd.toFixed(2)}`;

        tr.innerHTML = `
            <td class="network-cell">${networkDisplay}</td>
            <td>${cpmRubDisplay}</td>
            <td>${cpmUsdDisplay}</td>
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
        const values = [row.network, row.cpmRub.toFixed(2), row.cpmUsd.toFixed(2)];
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
    setTimeout(() => exportModal.classList.add('hidden'), 300);
};

manualAddBtn.addEventListener('click', showManualInputView);
csvUploadInput.addEventListener('change', handleCsvUpload);
addRowBtn.addEventListener('click', () => addRow());

buildWaterfallBtn.addEventListener('click', () => {
    const initialRows = readRows();
    if (!initialRows) return; 

    if (initialRows.length < 3) {
        showToast("Please fill in at least 3 rows first.", "error");
        return;
    }
    
    const rate = parseFloat(usdRateInput.value);
    const waterfall = generateFullWaterfall(initialRows, rate);
    currentWaterfall = waterfall;
    renderTable(waterfall);
    showToast("Now you have the best waterfall!");
});

exportCsvBtn.addEventListener('click', () => {
    if (currentWaterfall.length === 0) {
        showToast("Please build a waterfall first.", "error");
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
    getRate(); 
});

