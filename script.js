const CLIENT_ID = 'YOUR_LICHESS_CLIENT_ID'; // ここにLichessのクライアントIDを入力
const REDIRECT_URI = 'YOUR_REDIRECT_URI'; // ここにリダイレクトURIを入力

// Lichessでログインする関数
document.getElementById('login-button').addEventListener('click', function() {
    const authUrl = `https://lichess.org/oauth/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location.href = authUrl;
});

// URLからアクセストークンを取得する関数
function getAccessToken() {
    const hash = window.location.hash;
    const tokenMatch = hash.match(/access_token=([^&]*)/);
    return tokenMatch ? tokenMatch[1] : null;
}

// ユーザーデータを取得して表示する関数
async function fetchUserData(token) {
    try {
        const response = await fetch('https://lichess.org/api/account', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('ユーザーが見つかりません。');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

// ユーザーデータを表示する関数
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

// ページ読み込み時にトークンを取得してユーザーデータを表示
window.onload = function() {
    const token = getAccessToken();
    if (token) {
        displayUserData(token);
    }
};

// 寄付ボタンの機能
document.getElementById('donate-button').addEventListener('click', function() {
    window.open('https://www.paypal.com/donate?hosted_button_id=寄付ボタンIDをここに', '_blank');
});
