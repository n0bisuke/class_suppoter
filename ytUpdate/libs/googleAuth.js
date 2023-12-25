const fs = require('node:fs');

module.exports = (google) => {


    let credentials = null;
    let token = null;

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
        if(credentials && token) {
            console.log(`FILEから読み込み成功`);
            return;
        }

        console.log(`ENVから読み込み中...`);
        console.log(process.env.GOOGLE_CLIENT_SECRET);
        console.log(process.env.GOOGLE_TOKEN);
        credentials = JSON.parse(process.env.GOOGLE_CLIENT_SECRET);
        token = JSON.parse(process.env.GOOGLE_TOKEN);
        console.log(`ENVから読み込み成功`);
    } catch (error) {
        console.log('TOKEN ENV READ ERROR: ' + error);
    }

    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
}