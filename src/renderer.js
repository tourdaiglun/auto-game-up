document.addEventListener('DOMContentLoaded', () => {
    // --- SÉLECTION DES ÉLÉMENTS DU DOM ---
    const mainForm = document.getElementById('main-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusText = document.getElementById('status-text');
    const progressBar = document.getElementById('progress-bar');
    const resultContainer = document.getElementById('result-container');
    const publicLinkInput = document.getElementById('public_link');
    const copyBtn = document.getElementById('copy-btn');
    const signatureDisplay = document.getElementById('signature-display');
    
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const settingsForm = document.getElementById('settings-form');

    // --- LOGIQUE PRINCIPALE ---
    mainForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            gameName: document.getElementById('game_name').value,
            version: document.getElementById('version').value,
            repacker: document.getElementById('repacker').value,
            inputRarPath: document.getElementById('input_rar').files[0]?.path,
            selectedApiKeyIndex: document.getElementById('api_key_selection').value,
            password: document.getElementById('archive_password').value,
            archiveNameOverride: document.getElementById('archive_name_override').value
        };

        if (!data.inputRarPath) {
            alert("Veuillez sélectionner un fichier .rar à traiter !");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Traitement en cours...';
        resultContainer.classList.add('hidden');
        progressBar.style.width = '0%';
        statusText.textContent = 'Initialisation...';
        progressBar.style.backgroundColor = 'var(--success)';

        window.api.startProcess(data);
    });

    window.api.onUpdateStatus(({ message, progress }) => {
        statusText.textContent = message;
        if (progress !== undefined) progressBar.style.width = `${progress}%`;
    });

    window.api.onProcessComplete(({ success, link, error }) => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Lancer le Traitement';
        if (success) {
            statusText.textContent = 'Terminé !';
            progressBar.style.width = '100%';
            publicLinkInput.value = link;
            resultContainer.classList.remove('hidden');
        } else {
            statusText.textContent = `Erreur : ${error}`;
            progressBar.style.width = '100%';
            progressBar.style.backgroundColor = 'var(--error)';
        }
    });

    copyBtn.addEventListener('click', () => {
        publicLinkInput.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copié !';
        setTimeout(() => { copyBtn.textContent = 'Copier'; }, 2000);
    });

    // --- LOGIQUE DES PARAMÈTRES ---
    async function loadInitialSettings() {
        const settings = await window.api.getSettings();
        signatureDisplay.textContent = settings.signature ? `par ${settings.signature}` : '';
    }

    settingsBtn.addEventListener('click', async () => {
        const settings = await window.api.getSettings();
        document.getElementById('winrar_path').value = settings.winrarPath || '';
        document.getElementById('destination').value = settings.destination || '';
        document.getElementById('signature').value = settings.signature || '';
        document.getElementById('pixeldrain_api_key_1').value = settings.apiKey1 || '';
        document.getElementById('pixeldrain_api_key_2').value = settings.apiKey2 || '';
        document.getElementById('pixeldrain_api_key_3').value = settings.apiKey3 || '';
        settingsModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const settings = {
            winrarPath: document.getElementById('winrar_path').value,
            destination: document.getElementById('destination').value,
            signature: document.getElementById('signature').value,
            apiKey1: document.getElementById('pixeldrain_api_key_1').value,
            apiKey2: document.getElementById('pixeldrain_api_key_2').value,
            apiKey3: document.getElementById('pixeldrain_api_key_3').value,
            templatePath: document.getElementById('template').files[0]?.path,
            logoPath: document.getElementById('logo').files[0]?.path,
        };
        window.api.saveSettings(settings);
        settingsModal.classList.add('hidden');
        loadInitialSettings();
        alert('Paramètres sauvegardés !');
    });
    
    loadInitialSettings();
});