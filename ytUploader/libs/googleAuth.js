const fs = require('node:fs');

module.exports = (google) => {
    const CREDENTIALS_PATH = 'client_secret.json';
    const TOKEN_PATH = 'token.json';

    let credentials = null;
    let token = null;
    try {
        credentials = JSON.parse(process.env.GOOGLE_CLIENT_SECRET || fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
        token = JSON.parse(process.env.GOOGLE_TOKEN || fs.readFileSync(TOKEN_PATH, 'utf8'));    
    } catch (error) {
        console.log('TOKEN READ ERROR: ' + error);
    }

    const {client_secret, client_id, redirect_uris} = credentials.installed;

    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
}