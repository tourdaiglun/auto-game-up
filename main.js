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
        width: 700,
        height: 850,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Assurez-vous d'avoir un fichier preload.js
        },
    });
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Le preload est nécessaire pour la communication sécurisée
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

ipcMain.handle('start-process', async (event, data) => {
    const win = BrowserWindow.getFocusedWindow();
    const tempFolder = path.join(app.getPath('temp'), 'pro-repack-uploader');
    const commentaireFile = path.join(tempFolder, 'commentaire.txt');
    
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

    const apiKeyToUse = settings[`apiKey${data.selectedApiKeyIndex}`];

    if (!settings.winrarPath || !settings.templatePath || !settings.logoPath || !apiKeyToUse) {
        win.webContents.send('process-complete', { success: false, error: "Vérifiez les paramètres ! Un chemin (WinRAR, template, logo) ou la clé API est manquant." });
        return;
    }

    const archiveNameFormat = `by ${settings.signature}`;
    const defaultArchiveName = `${data.gameName} ${data.version} -${data.repacker} ${archiveNameFormat}`;
    const archiveName = data.archiveNameOverride ? data.archiveNameOverride.trim() : defaultArchiveName;
    const finalArchivePath = path.join(settings.destination, `${archiveName}.rar`);

    try {
        await fs.rm(tempFolder, { recursive: true, force: true });
        await fs.mkdir(tempFolder, { recursive: true });

        win.webContents.send('update-status', { message: 'Préparation du commentaire...', progress: 10 });
        const templateContent = await fs.readFile(settings.templatePath, 'utf8');
        const finalComment = templateContent.replace(/%%REPACKER%%/g, data.repacker);
        await fs.writeFile(commentaireFile, finalComment, 'utf8');
        
        win.webContents.send('update-status', { message: 'Extraction de l\'archive source...', progress: 20 });
        await execFilePromise(settings.winrarPath, ['x', '-o+', data.inputRarPath, `${tempFolder}\\`]);

        win.webContents.send('update-status', { message: 'Nettoyage des fichiers...', progress: 50 });
        const files = await fs.readdir(tempFolder, { withFileTypes: true, recursive: true });
        for (const file of files) {
            if(file.name.endsWith('.url')) {
                await fs.rm(path.join(file.path, file.name));
            }
        }
        await fs.copyFile(settings.logoPath, path.join(tempFolder, 'logo.png'));

        win.webContents.send('update-status', { message: 'Création de la nouvelle archive...', progress: 60 });
        await fs.mkdir(settings.destination, { recursive: true });
        const args = ['a', '-r', '-ep1', '-m3', '-c-', `-z${commentaireFile}`];
        if (data.password) args.push(`-p${data.password}`);
        args.push(finalArchivePath, `${tempFolder}\\*`);
        await execFilePromise(settings.winrarPath, args);

        win.webContents.send('update-status', { message: 'Upload sur PixelDrain...', progress: 80 });
        const form = new FormData();
        form.append('file', require('fs').createReadStream(finalArchivePath));
        
        const response = await axios.post('https://pixeldrain.com/api/file', form, {
            headers: { ...form.getHeaders(), 'Authorization': `Basic ${Buffer.from(':' + apiKeyToUse).toString('base64')}` },
            maxContentLength: Infinity, maxBodyLength: Infinity
        });

        if (!response.data.success || !response.data.id) {
            throw new Error(`Échec de l'upload: ${response.data.message || 'Réponse invalide'}`);
        }
        
        const publicLink = `https://pixeldrain.com/u/${response.data.id}`;
        win.webContents.send('update-status', { message: 'Upload terminé !', progress: 100 });
        win.webContents.send('process-complete', { success: true, link: publicLink });

    } catch (error) {
        console.error(error);
        win.webContents.send('process-complete', { success: false, error: error.message });
    } finally {
        await fs.rm(tempFolder, { recursive: true, force: true });
    }
});