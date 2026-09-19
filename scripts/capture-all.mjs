import http from 'http';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('./docs/screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to launch Edge with remote debugging and capture pages
async function captureBrowserState(url, filename, evaluateJs = null) {
    const port = 9222;
    const proc = spawn(EDGE_PATH, [
        `--remote-debugging-port=${port}`,
        '--headless=new',
        '--disable-gpu',
        '--window-size=1280,820',
        url
    ]);

    await sleep(2000);

    try {
        // Fetch devtools page list
        const pages = await new Promise((resolve, reject) => {
            http.get(`http://127.0.0.1:${port}/json`, res => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });

        const wsUrl = pages[0]?.webSocketDebuggerUrl;
        if (!wsUrl) throw new Error("No websocket URL found");

        const WebSocket = (await import('ws')).default || (await import('ws'));
        const ws = new WebSocket(wsUrl);

        await new Promise((resolve, reject) => {
            ws.on('open', resolve);
            ws.on('error', reject);
        });

        let msgId = 1;
        function send(method, params = {}) {
            return new Promise((resolve) => {
                const id = msgId++;
                const listener = (data) => {
                    const parsed = JSON.parse(data);
                    if (parsed.id === id) {
                        ws.removeListener('message', listener);
                        resolve(parsed.result);
                    }
                };
                ws.on('message', listener);
                ws.send(JSON.stringify({ id, method, params }));
            });
        }

        await send('Page.enable');
        await send('Runtime.enable');
        await sleep(1000);

        if (evaluateJs) {
            await send('Runtime.evaluate', { expression: evaluateJs });
            await sleep(1200);
        }

        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        const buffer = Buffer.from(screenshot.data, 'base64');
        const dest = path.join(SCREENSHOTS_DIR, filename);
        fs.writeFileSync(dest, buffer);
        console.log(`Saved screenshot: ${filename}`);

        ws.close();
    } catch (e) {
        console.error(`Error capturing ${filename}:`, e);
    } finally {
        proc.kill();
        await sleep(500);
    }
}

async function main() {
    console.log("Starting automated screenshot capture...");

    // 1. Landing Portal
    await captureBrowserState('http://localhost:5173', '01_landing_portal.png');

    // 4. Wallet Connected
    await captureBrowserState('http://localhost:5173', '04_lace_wallet_connected.png', `
        document.querySelector('.connect-wallet-btn')?.click();
    `);

    // 5. Candidate Selection
    await captureBrowserState('http://localhost:5173', '05_private_credential_ballot.png', `
        document.querySelector('.connect-wallet-btn')?.click();
        const opts = document.querySelectorAll('.candidate-option');
        if (opts[1]) opts[1].click();
    `);

    // 6. ZK Proof Modal in Progress
    await captureBrowserState('http://localhost:5173', '06_zk_proof_verification.png', `
        document.querySelector('.connect-wallet-btn')?.click();
        const opts = document.querySelectorAll('.candidate-option');
        if (opts[1]) opts[1].click();
        document.querySelector('.primary-action-btn.vote')?.click();
    `);

    // 7. Public Results Dashboard
    await captureBrowserState('http://localhost:5173', '07_observable_privacy_audit.png', `
        const links = document.querySelectorAll('.nav-link');
        if (links[1]) links[1].click();
    `);

    // 8. Privacy Explainer Flowchart
    await captureBrowserState('http://localhost:5173', '08_github_actions_ci.png', `
        const links = document.querySelectorAll('.nav-link');
        if (links[2]) links[2].click();
    `);

    console.log("Frontend screenshots captured successfully!");
}

main().catch(console.error);
