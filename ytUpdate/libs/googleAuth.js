const fs = require('node:fs');

module.exports = (google) => {
    let credentials = {};
    let token = {};

    //fileから読み込む
    try {
        console.log(`FILEから読み込み中...`);
        const CREDENTIALS_PATH = 'client_secret.json';
        const TOKEN_PATH = 'token.json';
        credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
        token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
        console.log(`FILEから読み込み成功`);
    } catch (error) {
        console.log('TOKEN FILE READ ERROR: ' + error);
    }

    //fileがない場合は環境変数から読み込む
    try{
        if(!credentials.hasOwnProperty('installed') || token.hasOwnProperty('access_token')) {
            console.log(`ENVから読み込み中...`);
            const credentialsStr = process.env.GOOGLE_CLIENT_SECRET;
            const tokenStr = process.env.GOOGLE_TOKEN;
            credentials = JSON.parse(credentialsStr);
            token = JSON.parse(tokenStr);
            console.log(`ENVから読み込み成功`);
        }
    } catch (error) {
        console.log('TOKEN ENV READ ERROR: ' + error);
    }

    console.log(`---OAuth認証スタート---`);
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);
    console.log(`---OAuth認証成功---`);

    return oAuth2Client;
}