class Youtube {
    constructor(google, auth) {
      this.youtube = google.youtube({version: 'v3', auth});
    }

    //チャンネル情報を取得
    getYtInfo = async (channelId) => {
        const response = await this.youtube.channels.list({
            id: channelId,
            part: 'snippet'
        });
        return response;
    }

    //workspaceの動画でROOMIDが含まれる動画(まだ名前変更されてない)を検索
    findWorkSpace = async (roomId) => {    
        try {
            // console.log(`リストID:`,process.env.YT_WORKSPACE_PLAYLIST_ID);
            const res = await this.youtube.playlistItems.list({
                part: 'snippet',
                maxResults: 50, // 一度に取得する最大動画数
                playlistId: process.env.YT_WORKSPACE_PLAYLIST_ID
            });
    
            const searchWord = roomId; //検索ワード
            const videos = res.data.items
                .filter(item => item.snippet.title.indexOf(searchWord) != -1)
                .map(item => {
                    // console.log(item);
                    return {
                        linkedId: item.id, // プレイリストに紐付けられた動画のID
                        title: item.snippet.title,
                        videoId: item.snippet.resourceId.videoId,
                    };
                });
            return videos;
        } catch (error) {
            console.log('The API returned an error: ' + error);
        }
    }

    //動画を再生リストに追加
    addVideoToPlaylist = async (videoId, playlistId) => {
        try {
            const res = await this.youtube.playlistItems.insert({
                part: 'id,snippet,contentDetails',
                requestBody: {
                    snippet: {
                        playlistId: playlistId,
                        resourceId: {
                            kind: "youtube#video",
                            videoId: videoId
                        }
                    }
                }
            });
            return res.data;
        } catch (error) {
            console.log('The API returned an error: ' + error);
        }
    }

    //動画を再生リストから削除
    removeVideoFromPlaylist = async (linkedId) => {
        try {
            const res = await this.youtube.playlistItems.delete({
                id: linkedId
            });
            return res.data;
        } catch (error) {
            console.log('The API returned an error: ' + error);
        }
    }

    //動画のタイトルを変更
    updateVideoTitle = async (videoId, title) => {
        try {
            const res = await this.youtube.videos.update({
                part: 'snippet',
                requestBody: {
                    id: videoId,
                    snippet: {
                        title: title,
                        categoryId: 27 //カテゴリID 27 = Education
                        // description: newDescription
                    }
                }
            });
            return res.data;
        } catch (error) {
            console.log('The API returned an error: ' + error);
        }
    }

    
};

module.exports = Youtube;