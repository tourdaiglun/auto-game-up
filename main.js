const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const { execFile } = require('child_process');
const util = require('util');
const axios = require('axios');
const FormData = require('form-data');
const Store = require('electron-store');

const execFilePromise = util.promisify(execFile);
const store = new Store();

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// --- GESTION DES PARAMÈTRES ---
ipcMain.handle('get-settings', () => {
    return {
        winrarPath: store.get('winrarPath'),
        destination: store.get('destination'),
        signature: store.get('signature'),
        apiKey1: store.get('apiKey1'),
        apiKey2: store.get('apiKey2'),
        apiKey3: store.get('apiKey3'),
    };
});

ipcMain.on('save-settings', (event, settings) => {
    if (settings.winrarPath) store.set('winrarPath', settings.winrarPath);
    if (settings.destination) store.set('destination', settings.destination);
    if (settings.signature) store.set('signature', settings.signature);
    if (settings.templatePath) store.set('templatePath', settings.templatePath);
    if (settings.logoPath) store.set('logoPath', settings.logoPath);
    store.set('apiKey1', settings.apiKey1);
    store.set('apiKey2', settings.apiKey2);
    store.set('apiKey3', settings.apiKey3);
});

// --- GESTION DE LA FILE D'ATTENTE ---
ipcMain.handle('start-queue', async (event, queue) => {
    const win = BrowserWindow.getFocusedWindow();
    const settings = {
        winrarPath: store.get('winrarPath'),
        destination: store.get('destination', 'Archives'),
        signature: store.get('signature', '{cFinder}'),
        templatePath: store.get('templatePath'),
        logoPath: store.get('logoPath'),
        apiKey1: store.get('apiKey1'),
        apiKey2: store.get('apiKey2'),
        apiKey3: store.get('apiKey3'),
    };

    for (const job of queue) {
        const tempFolder = path.join(app.getPath('temp'), `repack-temp-${job.id}`);
        const commentaireFile = path.join(tempFolder, 'commentaire.txt');
        const apiKeyToUse = settings[`apiKey${job.selectedApiKeyIndex}`];

        if (!settings.winrarPath || !settings.templatePath || !settings.logoPath || !apiKeyToUse) {
            win.webContents.send('process-complete', { jobId: job.id, success: false, error: "Paramètres manquants (WinRAR, template, logo ou clé API)." });
            continue;
        }

        try {
            await fs.rm(tempFolder, { recursive: true, force: true });
            await fs.mkdir(tempFolder, { recursive: true });

            win.webContents.send('update-status', { jobId: job.id, message: 'Préparation du commentaire...', progress: 5 });
            const templateContent = await fs.readFile(settings.templatePath, 'utf8');
            const finalComment = templateContent.replace(/%%REPACKER%%/g, job.repacker);
            await fs.writeFile(commentaireFile, finalComment, 'utf8');
            
            win.webContents.send('update-status', { jobId: job.id, message: 'Extraction...', progress: 15 });
            await execFilePromise(settings.winrarPath, ['x', '-o+', job.inputRarPath, `${tempFolder}\\`]);

            win.webContents.send('update-status', { jobId: job.id, message: 'Nettoyage...', progress: 40 });
            const files = await fs.readdir(tempFolder, { withFileTypes: true, recursive: true });
            for (const file of files) {
                if (file.name.endsWith('.url')) await fs.rm(path.join(file.path, file.name));
            }
            await fs.copyFile(settings.logoPath, path.join(tempFolder, 'logo.png'));
            
            const archiveNameFormat = `by ${settings.signature}`;
            const defaultArchiveName = `${job.gameName} ${job.version} -${job.repacker} ${archiveNameFormat}`;
            const finalArchivePath = path.join(settings.destination, `${defaultArchiveName}.rar`);

            win.webContents.send('update-status', { jobId: job.id, message: 'Compression...', progress: 60 });
            await fs.mkdir(settings.destination, { recursive: true });
            const args = ['a', '-r', '-ep1', '-m3', '-c-', `-z${commentaireFile}`];
            if (job.password) args.push(`-p${job.password}`);
            args.push(finalArchivePath, `${tempFolder}\\*`);
            await execFilePromise(settings.winrarPath, args);

            win.webContents.send('update-status', { jobId: job.id, message: 'Upload en cours...', progress: 80 });
            const form = new FormData();
            form.append('file', require('fs').createReadStream(finalArchivePath));
            
            const response = await axios.post('https://pixeldrain.com/api/file', form, {
                headers: { ...form.getHeaders(), 'Authorization': `Basic ${Buffer.from(':' + apiKeyToUse).toString('base64')}` },
                maxContentLength: Infinity, maxBodyLength: Infinity,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    win.webContents.send('update-status', { 
                        jobId: job.id, 
                        message: `Upload... ${percentCompleted}%`, 
                        progress: 80 + (percentCompleted / 5)
                    });
                }
            });

            if (!response.data.success) throw new Error(response.data.message || 'Échec de l-upload');
            
            const publicLink = `https://pixeldrain.com/u/${response.data.id}`;
            win.webContents.send('process-complete', { jobId: job.id, success: true, link: publicLink });

        } catch (error) {
            console.error(`Erreur pour le job ${job.id}:`, error);
            win.webContents.send('process-complete', { jobId: job.id, success: false, error: error.message });
        } finally {
            await fs.rm(tempFolder, { recursive: true, force: true }).catch(err => console.error(`Failed to remove temp folder: ${err.message}`));
        }
    }
});