const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const AdmZip = require('adm-zip');
const { exec } = require('child_process');

function createWindow() {
    const win = new BrowserWindow({
        width: 1000, height: 700,
        icon: path.join(__dirname, 'icon.png'), // FIXED ICON
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.setMenuBarVisibility(false);
    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Listen for Install/Play
ipcMain.on('install-game', async (event, url) => {
    const zipPath = path.join(__dirname, 'temp.zip');
    const extractPath = path.join(__dirname, 'AmongUsGame');

    try {
        event.reply('log', "Connecting to HQ...");
        const response = await axios({ url, method: 'GET', responseType: 'stream' });
        
        const writer = fs.createWriteStream(zipPath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            event.reply('log', "Unpacking assets...");
            const zip = new AdmZip(zipPath);
            zip.extractAllTo(extractPath, true);
            fs.unlinkSync(zipPath);
            event.reply('install-finished');
        });
    } catch (e) {
        event.reply('log', "SABOTAGE: " + e.message);
    }
});

ipcMain.on('launch-game', () => {
    const exePath = path.join(__dirname, 'AmongUsGame', 'Among Us.exe');
    exec(`"${exePath}"`, { cwd: path.dirname(exePath) });
});

ipcMain.on('open-folder', () => {
    shell.openPath(path.join(__dirname, 'AmongUsGame'));
});
