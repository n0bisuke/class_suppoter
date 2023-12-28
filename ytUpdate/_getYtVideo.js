module.exports = {
  findWorkSpace: async (google, auth, roomId) => {
    const youtube = google.youtube({version: 'v3', auth});

    try {
        console.log(`リストID:`,process.env.YT_WORKSPACE_PLAYLIST_ID);
        const res = await youtube.playlistItems.list({
            part: 'snippet',
            maxResults: 50, // 一度に取得する最大動画数
            playlistId: process.env.YT_WORKSPACE_PLAYLIST_ID
        });

        const searchWord = roomId; //検索ワード
        const videos = res.data.items
            .filter(item => item.snippet.title.indexOf(searchWord) != -1)
            .map(item => {
                return {
                    title: item.snippet.title,
                    videoId: item.snippet.resourceId.videoId
                };
            });
        return videos;
    } catch (error) {
        console.log('The API returned an error: ' + error);
    }
  },

  getYtInfo: async(google, auth, channelId) => {
    const youtube = google.youtube({version: 'v3', auth});

    const response = await youtube.channels.list({
        id: channelId,
        part: 'snippet'
    });
    return response;
  },

  getHOGEHOE: async (google, auth, roomId) => {

  }
}


