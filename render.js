const { ipcRenderer } = require('electron');

let isInstalled = false;

function addLog(msg) {
    const box = document.getElementById('log-box');
    box.value += `[${new Date().toLocaleTimeString()}] ${msg}\n`;
    box.scrollTop = box.scrollHeight;
}

function showTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
}

async function fetchNews() {
    const res = await fetch('https://raw.githubusercontent.com/reallytyler/au-cracked/refs/heads/main/announcements.json');
    const data = await res.json();
    const container = document.getElementById('news-container');
    container.innerHTML = data.announcements.map(a => `
        <div class="news-card">
            <h3 style="color:#00FFEE; margin:0">${a.title}</h3>
            <small>${a.date}</small>
            <p>${a.content}</p>
        </div>
    `).join('');
}

function handleAction() {
    if (isInstalled) {
        ipcRenderer.send('launch-game');
        addLog("Launching game...");
    } else {
        const url = "https://www.dropbox.com/scl/fi/kqrelqy01qcd3pii3mba2/Among-Us.zip?rlkey=acbasg5hj3z5i6cgnqmq2n72c&st=sftf0ktb&dl=1";
        ipcRenderer.send('install-game', url);
        document.getElementById('action-btn').disabled = true;
    }
}

ipcRenderer.on('log', (event, msg) => addLog(msg));
ipcRenderer.on('install-finished', () => {
    isInstalled = true;
    document.getElementById('status-text').innerText = "SYSTEM: OPERATIONAL";
    document.getElementById('status-text').style.color = "#50EF39";
    document.getElementById('action-btn').innerText = "PLAY NOW";
    document.getElementById('action-btn').disabled = false;
    document.getElementById('progress-bar').style.width = "100%";
    addLog("Task Complete: Game ready.");
});

function openFolder() { ipcRenderer.send('open-folder'); }

fetchNews();
