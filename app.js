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
const modalCloseBtn = document.getElementById('export-modal-close-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalDownloadBtn = document.getElementById('modal-download-btn');
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const helpModalCloseBtn = document.getElementById('help-modal-close-btn');
const helpModalOkBtn = document.getElementById('help-modal-ok-btn');

let rowIdCounter = 0;
let currentWaterfall = [];
let toastTimeout;
let imageTimeout;

const thirdPartyNetworks = [
    'AdLook', 'Kinostream', 'MoeVideo', 'DaoAd', 'AdPlay', 
    'Adiam', 'VideoHead', 'BetweenDigital', 'Buzzoola', 
    'MediaSniper', 'BidVol', 'Ne Media', 'Traffaret', 'Otclick'
];

const networkInstructions = {
    'AdLook': 'вставить площадку в таблицу https://docs.google.com/spreadsheets/d/1SKqQKxWwynNrZxdqJfecURWYv8_mFSaVtMC-FIYCeWs/edit?gid=0#gid=0 и не забудь оповестить в чате',
    'Kinostream': 'https://a.suprion.ru/vast/625281/vpaid',
    'MoeVideo': 'вставить площадку в таблицу https://ad.moe.video/vast?pid=11425&vpt=sticky&advertCount=1&vt=vpaid&vl=0 и не забудь оповестить в чате',
    'DaoAd': 'вставить площадку в таблицу https://docs.google.com/spreadsheets/d/12QCCJQ2ETPxMwqMKh_6SnT3wqm9WIQz95Dpqwbo36Z0/edit?gid=1321294382#gid=1321294382 и не забудь оповестить в чате',
    'AdPlay': 'вставить площадку в таблицу https://docs.google.com/spreadsheets/d/1Xesc72asLfTi1L52FSNrIKsOhG5foU1MQogtwS1Tbm8/edit?gid=0#gid=0 и не забудь оповестить в чате',
    'Adiam': 'вставить площадку в таблицу https://docs.google.com/spreadsheets/d/1Q6fFizKDr3Q0EzsxcPGbwzr7L4R2Zl8v4F5KHGjNQxI/edit?gid=0#gid=0 и не забудь оповестить в чате',
    'VideoHead': 'вставить площадку в таблицу https://docs.google.com/spreadsheets/d/1H_StW94zP0XnFraR1qfTs2aPtDFO0sEKVfFho9C9PPo/edit?gid=0#gid=0 и не забудь оповестить в чате',
    'BetweenDigital': 'Создать в кабинете https://cp.betweendigital.com/users/43559/sites',
    'Buzzoola': 'Создаем в кабинете https://pub.buzzoola.com/en/sites',
    'MediaSniper': 'вставить площадку в таблицу https://docs.google.com/spreadsheets/d/1TEq4sx_5f_eVsMNKbINw9dsjVelcNjNNqJ8T2g3qZcY/edit?gid=1821556884#gid=1821556884 и не забудь оповестить в чате',
    'BidVol': 'Создаем в кабинете https://ad.bidvol.com/statistics',
    'Ne Media': 'вставить площадку в таблицу https://docs.google.com/spreadsheets/d/1KA0seRVZaOdgWt1lK4FBwdosZY-pf0sAP9cCxGfaywg/edit?gid=0#gid=0 и не забудь оповестить в чате, с личного кабинета получаем васт',
    'Traffaret': 'Запрашиваем в тг',
    'Otclick': 'вставить площадку в таблицу https://docs.google.com/spreadsheets/d/1fMhbQkAXziaEYHbrGSyNBM9oVyDr0aTmv9_mxLuHdqM/edit?gid=1393807201#gid=1393807201 и не забудь оповестить в чате'
};

const successImages = [
    'success-image-1.png',
    'success-image-2.png',
    'success-image-3.png',
    'success-image-4.png',
    'success-image-5.png'
];

const showToast = (message, type = 'success') => {
    clearTimeout(toastTimeout);
    clearTimeout(imageTimeout);
    let iconHTML = '';
    if (type === 'success') {
        const randomIndex = Math.floor(Math.random() * successImages.length);
        const imageUrl = successImages[randomIndex];
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

const addRow = (cpm = '', fillRate = '', isAuto = false, currency = 'USD', networkName = 'MyTarget') => {
    rowIdCounter++;
    const rowId = `row-${rowIdCounter}`;
    const rowElement = document.createElement('div');
    rowElement.id = rowId;
    rowElement.className = 'form-row';
    
    rowElement.dataset.network = networkName;

    const networkLabel = networkName === 'MyTarget' ? 'MT' : networkName;

    let networkOptions = `
        <option value="MyTarget" ${networkName === 'MyTarget' ? 'selected' : ''}>MyTarget</option>
        <option value="Yandex" ${networkName === 'Yandex' ? 'selected' : ''}>Yandex</option>
    `;
    thirdPartyNetworks.forEach(net => {
        networkOptions += `<option value="${net}" ${networkName === net ? 'selected' : ''}>${net}</option>`;
    });

    rowElement.innerHTML = `
        <div class="form-group cpm-group">
            <select name="network" class="select-field" style="flex: 2;">
                ${networkOptions}
            </select>
            <input type="number" name="cpm" id="cpm-${rowId}" class="input-field" placeholder="CPM" value="${cpm}" style="flex: 1;">
            <select name="currency" class="select-field" style="width: 80px; flex: 0 0 auto;">
                <option value="USD" ${currency === 'USD' ? 'selected' : ''}>USD</option>
                <option value="RUB" ${currency === 'RUB' ? 'selected' : ''}>RUB</option>
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
        delimiter: ";", 
        skipEmptyLines: true,
        complete: (results) => {
            rowsContainer.innerHTML = '';
            results.data.forEach(row => {
                const adSystemRaw = row['Ad system'] || '';
                let adSystem = adSystemRaw.trim();

                if (adSystem === 'YD') adSystem = 'Yandex';

                const isMyTarget = adSystem === 'MyTarget';
                const isYandex = adSystem === 'Yandex';
                const isThirdParty = thirdPartyNetworks.includes(adSystem);

                if (!isMyTarget && !isThirdParty && !isYandex) return;

                const adUnitName = row['Ad Unit Name'] || '';
                const lowerCaseAdUnitName = adUnitName.toLowerCase();
                const sizePattern = /\d+x\d+/;
                
                if (lowerCaseAdUnitName.includes('_pvw_hb_b_b_1') || lowerCaseAdUnitName.includes('_pvw_hb_b_b_2') || lowerCaseAdUnitName.includes('_pvw_hb_waterfall') || lowerCaseAdUnitName.includes('_pvw_hb_b_m_1') || lowerCaseAdUnitName.includes('_pvw_hb_b_m_2') || lowerCaseAdUnitName.includes('_pvw_hb_b_pc_1') || lowerCaseAdUnitName.includes('_pvw_hb_b_pc_2') || (sizePattern.test(lowerCaseAdUnitName) && (isMyTarget || isYandex))) {
                    return;
                }

                const fillRateRaw = row['Fill Rate'] || '0';
                const fillRateFixed = fillRateRaw.replace(',', '.');
                const cpmVRaw = row['CPM(v) Ad system'] || '0';
                
                const parts = lowerCaseAdUnitName.split('_');
                let cpm = '';
                let isAuto = false;
                let currency = isYandex ? 'RUB' : 'USD';

                if (parts.includes('auto') || lowerCaseAdUnitName.includes('_auto_')) {
                    isAuto = true;
                    cpm = parseFloat(cpmVRaw.replace(',', '.'));
                    currency = 'USD'; // FORCE USD for all auto rows as requested
                } else {
                    const cpmPart = parts.find(p => !isNaN(parseInt(p, 10)) && !p.includes('x'));
                    if (cpmPart) {
                        if (isMyTarget) {
                            cpm = parseInt(cpmPart, 10) / 100;
                        } else {
                            cpm = parseInt(cpmPart, 10);
                        }
                    } else {
                        cpm = parseFloat(cpmVRaw.replace(',', '.'));
                    }
                }
                
                if (cpm !== '' && !isNaN(cpm)) cpm = cpm.toFixed(2);

                const fillRate = parseFloat(fillRateFixed).toFixed(2);
                
                if ((cpm !== '' && !isNaN(cpm)) || isAuto) {
                    addRow(cpm, fillRate, isAuto, currency, adSystem);
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
        
        const networkSelect = rowEl.querySelector('select[name="network"]');
        const networkName = networkSelect ? networkSelect.value : 'MyTarget';

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
            network: networkName,
            cpmValue: cpmValue,
            currency: currency,
            cpmRub: cpmRub,
            cpmUsd: cpmUsd,
            fill: fill,
            auto: isAuto,
            isPlaceholder: false 
        });
    });
    return rows;
};

const generateFullWaterfall = (initialRows, rate) => {
    const mtRows = initialRows.filter(r => r.network === 'MyTarget' && !r.auto);
    const mtAutoRows = initialRows.filter(r => r.network === 'MyTarget' && r.auto);
    const ydRows = initialRows.filter(r => r.network === 'Yandex' && !r.auto);
    const ydAutoRows = initialRows.filter(r => r.network === 'Yandex' && r.auto);
    
    const existingNetworks = new Set(initialRows.map(r => r.network).filter(n => n !== 'MyTarget' && n !== 'Yandex'));
    const thirdPartyRows = initialRows.filter(r => r.network !== 'MyTarget' && r.network !== 'Yandex');

    const generatedThirdParty = [];

    const addPlaceholderNetwork = (name, rubThreshold) => {
        if (!existingNetworks.has(name)) {
            const cpmUsdVirtual = (rubThreshold / rate) - 0.0001; 
            
            generatedThirdParty.push({
                network: name,
                cpmUsd: cpmUsdVirtual, 
                cpmRub: rubThreshold, 
                fill: null,
                auto: false,
                isNew: true,
                isPlaceholder: true 
            });
        }
    };

    addPlaceholderNetwork('AdLook', 80.00);
    addPlaceholderNetwork('Kinostream', 79.99); 
    addPlaceholderNetwork('MoeVideo', 79.98);
    addPlaceholderNetwork('DaoAd', 79.97);
    addPlaceholderNetwork('AdPlay', 79.96);

    addPlaceholderNetwork('Adiam', 60.00);
    addPlaceholderNetwork('VideoHead', 59.99);
    addPlaceholderNetwork('BetweenDigital', 59.98);

    addPlaceholderNetwork('Buzzoola', 50.00);
    addPlaceholderNetwork('MediaSniper', 49.99);
    addPlaceholderNetwork('BidVol', 49.98);

    addPlaceholderNetwork('Ne Media', 40.00);
    addPlaceholderNetwork('Traffaret', 39.99);
    addPlaceholderNetwork('Otclick', 39.98);

    const generateNetworkThresholds = (rows, isRub, networkName) => {
        const generated = [];
        const processedCpms = new Set(rows.map(r => isRub ? r.cpmRub.toFixed(2) : r.cpmUsd.toFixed(2)));
        const queue = [...rows];
        
        const highLimit = isRub ? 150 : 1.50;
        const midLimit = isRub ? 50 : 0.50;
        const midCap = isRub ? 150 : 1.50;
        const highStep = isRub ? 25 : 0.25;
        const midStep = isRub ? 10 : 0.10;

        while(queue.length > 0) {
            const row = queue.shift();
            if (row.fill === null) continue;

            const val = isRub ? row.cpmRub : row.cpmUsd;

            if (val >= highLimit) {
                let numThresholds = 0;
                if (row.fill > 9) numThresholds = Math.floor(row.fill / 2);
                else if (row.fill > 1.5) numThresholds = Math.floor(row.fill / 1.5);
                else if (row.fill >= 0.5) numThresholds = Math.floor(row.fill / 0.5);
                
                for (let i = 1; i <= numThresholds; i++) {
                    const newCpm = val + (highStep * i);
                    const newCpmStr = newCpm.toFixed(2);
                    if (processedCpms.has(newCpmStr)) continue;
                    
                    const newRow = {
                        network: networkName,
                        cpmUsd: isRub ? newCpm / rate : newCpm,
                        cpmRub: isRub ? newCpm : newCpm * rate,
                        fill: null,
                        auto: false,
                        isNew: true
                    };
                    generated.push(newRow);
                    processedCpms.add(newCpmStr);
                }
            } else if (val >= midLimit) {
                const requiredFill = (val >= (isRub ? 100 : 1.00)) ? 2 : 5;
                if (row.fill > requiredFill) {
                    const numThresholds = Math.floor(row.fill / requiredFill);
                    for (let i = 1; i <= numThresholds; i++) {
                        const newCpm = val + (midStep * i);
                        if (newCpm >= midCap) break;

                        const newCpmStr = newCpm.toFixed(2);
                        if (processedCpms.has(newCpmStr)) continue;
                        
                        const newRow = {
                            network: networkName,
                            cpmUsd: isRub ? newCpm / rate : newCpm,
                            cpmRub: isRub ? newCpm : newCpm * rate,
                            fill: null,
                            auto: false,
                            isNew: true
                        };
                        generated.push(newRow);
                        processedCpms.add(newCpmStr);
                        queue.push(newRow);
                    }
                }
            }
        }
        return generated;
    };

    const mtThresholds = generateNetworkThresholds(mtRows, false, 'MyTarget');
    const ydThresholds = generateNetworkThresholds(ydRows, true, 'Yandex');

    const mtAutoThresholds = [];
    const processedMt = new Set([...mtRows, ...mtThresholds].map(r => r.cpmUsd.toFixed(2)));
    mtAutoRows.forEach(row => {
        const autoUsd = row.cpmUsd;
        const nextMultiple = Math.ceil((autoUsd + 0.0001) / 0.05) * 0.05;
        const start = Math.max(0.15, nextMultiple);
        if (start <= 0.50) {
            for (let cpm = start; cpm <= 0.50001; cpm += 0.05) {
                const cpmStr = cpm.toFixed(2);
                if (processedMt.has(cpmStr)) continue;
                mtAutoThresholds.push({ network: 'MyTarget', cpmUsd: cpm, cpmRub: cpm * rate, fill: null, auto: false, isNew: true });
                processedMt.add(cpmStr);
            }
        }
    });

    const ydAutoThresholds = [];
    const processedYd = new Set([...ydRows, ...ydThresholds].map(r => r.cpmRub.toFixed(2)));
    ydAutoRows.forEach(row => {
        const autoRub = row.cpmRub;
        const nextMultiple = Math.ceil((autoRub + 0.0001) / 5) * 5;
        const start = Math.max(15, nextMultiple);
        if (start <= 50) {
            for (let cpm = start; cpm <= 50; cpm += 5) {
                const cpmStr = cpm.toFixed(2);
                if (processedYd.has(cpmStr)) continue;
                ydAutoThresholds.push({ network: 'Yandex', cpmUsd: cpm / rate, cpmRub: cpm, fill: null, auto: false, isNew: true });
                processedYd.add(cpmStr);
            }
        }
    });

    let allRows = [
        ...mtRows, ...mtThresholds, ...mtAutoThresholds,
        ...ydRows, ...ydThresholds, ...ydAutoThresholds,
        ...thirdPartyRows, ...generatedThirdParty
    ];

    allRows.sort((a, b) => b.cpmUsd - a.cpmUsd);

    const uniqueWaterfall = allRows.filter((item, index, self) => 
        index === self.findIndex((t) => (
            t.network === item.network && 
            Math.abs(t.cpmUsd - item.cpmUsd) < 0.001
        ))
    );
    
    mtAutoRows.forEach(autoRow => uniqueWaterfall.push({...autoRow, fill: null, auto: true, isNew: false }));
    ydAutoRows.forEach(autoRow => uniqueWaterfall.push({...autoRow, fill: null, auto: true, isNew: false }));

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
        const fillDisplay = row.fill !== null ? `${parseFloat(row.fill).toFixed(2)}%` : '—';
        
        let networkDisplay = row.network;
        if (row.network === 'MyTarget') {
            networkDisplay = `<span class="network-m">M</span><span class="network-t">T</span>`;
        } else if (row.network === 'Yandex') {
            networkDisplay = `<span class="network-y">Y</span><span class="network-d">D</span>`;
        }
        
        let cpmRubDisplay = row.cpmRub.toFixed(2);
        let cpmUsdDisplay = `$${row.cpmUsd.toFixed(2)}`;

        if (row.isPlaceholder) {
            cpmRubDisplay = '—';
            cpmUsdDisplay = '—';
        } else if (row.auto) {
            cpmRubDisplay = 'auto';
            cpmUsdDisplay = 'auto';
        } else if (row.network === 'Yandex') {
            cpmUsdDisplay = '—';
        }

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
    const headers = ['Ad Network', 'CPM (rubles)', 'CPM (usd)', 'Status'];
    
    const escapeCsv = (field) => {
        if (field === null || field === undefined) return '';
        const stringField = String(field);
        if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
            return `"${stringField.replace(/"/g, '""')}"`;
        }
        return stringField;
    };

    const csvRows = [headers.map(escapeCsv).join(',')];

    data.forEach(row => {
        let status = row.isNew ? 'new' : '';

        if (row.isNew && networkInstructions[row.network]) {
            const originalText = networkInstructions[row.network];
            const urlMatch = originalText.match(/https?:\/\/[^\s]+/);
            
            if (urlMatch) {
                const url = urlMatch[0];
                const safeText = originalText.replace(/"/g, '""');
                status = `=HYPERLINK("${url}"; "${safeText}")`;
            } else {
                status = originalText;
            }
        }
        
        let cpmRubValue = row.cpmRub.toFixed(2);
        let cpmUsdValue = row.cpmUsd.toFixed(2);

        if (row.isPlaceholder) {
            cpmRubValue = '-';
            cpmUsdValue = '-';
        } else if (row.auto) {
            cpmRubValue = 'auto';
            cpmUsdValue = 'auto';
        } else if (row.network === 'Yandex') {
            cpmUsdValue = '';
        }

        const netName = row.network === 'MyTarget' ? 'MT' : (row.network === 'Yandex' ? 'YD' : row.network);

        const values = [
            netName,
            cpmRubValue,
            cpmUsdValue,
            status
        ];
        csvRows.push(values.map(escapeCsv).join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], {
        type: 'text/csv;charset=utf-8;'
    });
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
    setTimeout(() => {
        exportModal.style.opacity = '1';
        exportModal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
};

const hideModal = () => {
    exportModal.style.opacity = '0';
    exportModal.querySelector('.modal-content').style.transform = 'scale(0.95)';
    setTimeout(() => exportModal.classList.add('hidden'), 300);
};

const showHelpModal = () => {
    helpModal.classList.remove('hidden');
    setTimeout(() => {
        helpModal.style.opacity = '1';
        helpModal.querySelector('.modal-content').style.transform = 'scale(1)';
    }, 10);
};

const hideHelpModal = () => {
    helpModal.style.opacity = '0';
    helpModal.querySelector('.modal-content').style.transform = 'scale(0.95)';
    setTimeout(() => helpModal.classList.add('hidden'), 300);
};


manualAddBtn.addEventListener('click', showManualInputView);
csvUploadInput.addEventListener('change', handleCsvUpload);
addRowBtn.addEventListener('click', () => addRow());
buildWaterfallBtn.addEventListener('click', () => {
    const initialRows = readRows();
    if (!initialRows) return;
    if (initialRows.length < 1) {
        showToast("Please add at least 1 row.", "error");
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
helpBtn.addEventListener('click', showHelpModal);
helpModalCloseBtn.addEventListener('click', hideHelpModal);
helpModalOkBtn.addEventListener('click', hideHelpModal);

document.addEventListener('DOMContentLoaded', () => {
    getRate();
});
