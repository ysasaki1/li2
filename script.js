const CLIENT_ID = 'lip_90ovreZ04dkicgFOSguY'; // 発行されたクライアントIDを入力
const REDIRECT_URI = 'https://ysasaki1.github.io/li2/'; // 正確なリダイレクトURIを入力

async function generateCodeChallenge() {
    const codeVerifier = generateRandomString(128);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64urlEncode(hashed);
    
    sessionStorage.setItem('code_verifier', codeVerifier);
    return codeChallenge;
}

document.getElementById('login-button').addEventListener('click', async function() {
    const codeChallenge = await generateCodeChallenge();
    const state = generateRandomString(16); // 状態を生成

    const authUrl = `https://lichess.org/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code_challenge_method=S256&code_challenge=${codeChallenge}&state=${state}`;
    
    window.location.href = authUrl; // 認証リクエストを送信
});

// アクセストークンを取得するための関数
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
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
            code_verifier: codeVerifier
        })
    });
    
    const data = await response.json();
    return data.access_token; // アクセストークンを返す
}

// ユーザー情報を取得するための関数
async function fetchUserData(token) {
    const response = await fetch('https://lichess.org/api/account', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data;
}

// リダイレクト後の処理
window.onload = async function() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
        const token = await fetchAccessToken(code);
        const userData = await fetchUserData(token);

        // ユーザー情報を表示
        document.getElementById('username').innerText = userData.id;
        document.getElementById('profile-pic').src = userData.profile?.image || 'default-image-url.jpg';
        document.getElementById('user-info').style.display = 'block';
    }
};

// ランダムな文字列を生成する関数
function generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
}

// SHA256ハッシュを生成する関数
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return new Uint8Array(hashBuffer);
}

// BASE64URLエンコードを行う関数
function base64urlEncode(buffer) {
    const binary = String.fromCharCode(...buffer);
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
