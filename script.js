// Lichess APIからデータを取得する関数
async function fetchUserData(username) {
    try {
        const response = await fetch(`https://lichess.org/api/user/${username}`);
        if (!response.ok) throw new Error('ユーザーが見つかりません。');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}

// ユーザーデータを表示する関数
async function displayUserData(username) {
    const userData = await fetchUserData(username);

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
    }
}

// Lichessと連携するボタンの機能
document.getElementById('link-button').addEventListener('click', function() {
    const username = prompt('Lichessのユーザー名を入力してください:');
    if (username) {
        displayUserData(username);
    }
});

// 寄付ボタンの機能
document.getElementById('donate-button').addEventListener('click', function() {
    window.open('https://www.paypal.com/donate?hosted_button_id=寄付ボタンIDをここに', '_blank');
});
