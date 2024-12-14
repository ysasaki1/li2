const CLIENT_ID = 'YOUR_LICHESS_CLIENT_ID'; // ここにLichessのクライアントIDを入力
const REDIRECT_URI = 'https://<username>.github.io/<repository-name>/'; // ここにリダイレクトURIを入力

async function generateCodeChallenge() {
    const codeVerifier = generateRandomString(128);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64urlEncode(hashed);
    
    sessionStorage.setItem('code_verifier', codeVerifier);
    sessionStorage.setItem('state', generateRandomString(16)); // Stateも生成
    
    return codeChallenge;
}

function generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
}

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return new Uint8Array(hashBuffer);
}

function base64urlEncode(buffer) {
    const binary = String.fromCharCode(...buffer);
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

document.getElementById('login-button').addEventListener('click', async function() {
    const codeChallenge = await generateCodeChallenge();
    const state = sessionStorage.getItem('state');
    
    const authUrl = `https://lichess.org/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code_challenge_method=S256&code_challenge=${codeChallenge}&state=${state}`;
    
    window.location.href = authUrl;
});

function getAccessToken() {
    const hash = window.location.hash;
    const tokenMatch = hash.match(/code=([^&]*)/);
    return tokenMatch ? tokenMatch[1] : null;
}

async function fetchAccessToken(code) {
    const codeVerifier = sessionStorage.getItem('code_verifier');
    const response = await fetch('https://lichess.org/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            code_verifier: codeVerifier,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID
        })
    });
    
    const data = await response.json();
    return data.access_token;
}

async function fetchUserData(token) {
    const response = await fetch('https://lichess.org/api/account', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data;
}

async function displayUserData(token) {
    const userData = await fetchUserData(token);

    if (userData) {
        document.getElementById('profile-pic').src = userData.profile?.image || 'default-image-url.jpg';
        document.getElementById('username').innerText = userData.id;
        document.getElementById('bio').innerText = userData.profile?.bio || '自己紹介がありません';

        const gameStats = document.getElementById('game-stats');
        gameStats.innerHTML = `
            <ul>
                <li>レーティング: ${userData.perfs.blitz.rating || 'N/A'}</li>
                <li>ゲーム数: ${userData.nbGames || 'N/A'}</li>
                <li>勝利数: ${userData.perfs.blitz.wins || 'N/A'}</li>
            </ul>
        `;
        
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('user-info').style.display = 'block';
    }
}

window.onload = function() {
    const code = getAccessToken();
    if (code) {
        fetchAccessToken(code).then(token => {
            displayUserData(token);
        });
    }
};

document.getElementById('donate-button').addEventListener('click', function() {
    window.open('https://www.paypal.com/donate?hosted_button_id=寄付ボタンIDをここに', '_blank');
});
