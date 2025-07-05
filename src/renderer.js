document.addEventListener('DOMContentLoaded', () => {
    const addGameForm = document.getElementById('add-game-form');
    const queueList = document.getElementById('queue-list');
    const startQueueBtn = document.getElementById('start-queue-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const settingsForm = document.getElementById('settings-form');

    let jobQueue = [];

    addGameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const job = {
            id: Date.now(),
            gameName: document.getElementById('game_name').value,
            version: document.getElementById('version').value,
            repacker: document.getElementById('repacker').value,
            inputRarPath: document.getElementById('input_rar').files[0]?.path,
            selectedApiKeyIndex: document.getElementById('api_key_selection').value,
            password: document.getElementById('archive_password').value,
        };
        if (!job.inputRarPath) { alert("Veuillez sélectionner un fichier .rar !"); return; }
        jobQueue.push(job);
        renderQueue();
        addGameForm.reset();
    });

    function renderQueue() {
        queueList.innerHTML = '';
        if (jobQueue.length === 0) {
            queueList.innerHTML = '<p style="text-align:center;color:var(--text-dark);">La file est vide.</p>';
            startQueueBtn.disabled = true;
        } else {
            jobQueue.forEach(job => {
                const item = document.createElement('div');
                item.className = 'queue-item';
                item.id = `job-${job.id}`;
                item.innerHTML = `
                    <div class="queue-item-header">${job.gameName} - ${job.version}</div>
                    <div class="queue-item-status">Statut : En attente...</div>
                    <div class="queue-item-progress-bar-container">
                        <div class="queue-item-progress-bar"></div>
                    </div>
                `;
                queueList.appendChild(item);
            });
            startQueueBtn.disabled = false;
        }
    }
    
    startQueueBtn.addEventListener('click', () => {
        startQueueBtn.disabled = true;
        document.querySelectorAll('.queue-item').forEach(item => item.style.opacity = '0.5');
        window.api.startQueue(jobQueue);
    });
    
    window.api.onUpdateStatus(({ jobId, message, progress }) => {
        const item = document.getElementById(`job-${jobId}`);
        if (item) {
            item.style.opacity = '1';
            item.querySelector('.queue-item-status').textContent = `Statut : ${message}`;
            item.querySelector('.queue-item-progress-bar').style.width = `${progress}%`;
        }
    });

    window.api.onProcessComplete(({ jobId, success, link, error }) => {
        const item = document.getElementById(`job-${jobId}`);
        if (item) {
            item.style.opacity = '1';
            const statusBar = item.querySelector('.queue-item-progress-bar');
            if (success) {
                item.querySelector('.queue-item-status').innerHTML = `✅ Terminé !<br><input type="text" value="${link}" onclick="this.select()" readonly>`;
                statusBar.style.backgroundColor = 'var(--success)';
                statusBar.style.width = '100%';
            } else {
                item.querySelector('.queue-item-status').textContent = `❌ Erreur : ${error}`;
                statusBar.style.backgroundColor = 'var(--error)';
                statusBar.style.width = '100%';
            }
        }
    });
    
    // --- GESTION DU MODAL PARAMÈTRES ---
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
        alert('Paramètres sauvegardés !');
    });

    renderQueue();
});