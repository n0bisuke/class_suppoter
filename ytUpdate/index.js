'use strict';

const {google} = require('googleapis');
const googleAuth = require('./libs/googleAuth');
const auth = googleAuth(google);
console.log(`-- Authクライアント作成DONE ---`);

const getClassInfo = require('./_getClassInfo');

const YtApi = require('./_ytApi');
const ytApi = new YtApi(google, auth);

const main = async () => {
    try {
      // await getClassInfo.findLessons();
      // YouTubeの情報を取得 - APIテスト
      // const ytInfo = await ytApi.getYtInfo('protoout');
      // console.log(ytInfo.data);

      /**
       * 1. 直近のクラスを検索*/
      console.log(`- NotionDBから最新クラス検索中...`);
      const classInfoItems = await getClassInfo.findAll({limit: 10});
      // console.log(`直近クラス---`, classInfoItems);
      console.log(`最新クラスが${classInfoItems.length}件見つかりました。`);
      if(classInfoItems.length === 0) {
        console.log(`- 最新クラスが見つかりませんでした。`);
        return;
      }
      
      /**
       * 2. 検索したクラスのROOMIDを使って、workspaceの動画で直近のクラスの授業動画を検索*/
      console.log(`- 授業の動画がないかYoutubeのworkspaceプレイリストを検索中...`);
      let lessonVideos = [];
      for (let i = 0, len = classInfoItems.length; i < len; i++) {
        const lessonVideo = await ytApi.findWorkSpace(classInfoItems[i].roomId);
        if(lessonVideo !== null) {
          lessonVideos.push(lessonVideo);
          // console.log(`- 授業の動画が見つかりました。`, lessonVideo[0].title.split(`-`)[0]);
          // console.log(`- 授業の動画が見つかりました。`, lessonVideo);
        }
      }
      lessonVideos = lessonVideos.flat(); // ネストしていた2次元配列を1次元配列に変換
      // console.log(lessonVideos);
      console.log(`未処理の授業の動画が${lessonVideos.length}件見つかりました。`);
      if(lessonVideos.length === 0) {
        console.log(`- 授業の動画が見つかりませんでした。`);
        return;
      }
      
      /**
       * 3. 検索したクラスの情報をもとにタイトル変更とYouTube再生リストに紐付け */
      //下処理で配列をオブジェクトに変換 - ROOMIDをキーにしたオブジェクト
      const newClassInfoItems = classInfoItems.reduce((obj, item) => ({ ...obj, [item.roomId]: item }), {});

      for (let i = 0, len = lessonVideos.length; i < len; i++) {
        let roomId = ``;
        try {
          // 正規表現を用いて3文字-4文字-3文字のパターンを探す
          roomId = lessonVideos[i].title.match(/\b\w{3}-\w{4}-\w{3}\b/g)[0];          
        } catch (error) {
          console.log(`- ROOMIDが見つかりませんでした。`);
        }

        // roomIdが見つかったら、そのroomIdをキーにして、classInfoItemsから該当するクラス情報を取得
        const classInfo = newClassInfoItems[roomId];
        const videoId = lessonVideos[i].videoId; // 動画ID
        const playlistId = classInfo.ytListId; // 追加先のPlaylistID

        console.log(`--- [${i+1}件数目] ---`);
        console.log(`--- 3-1. 再生リストに紐付けします。 ---`);
        const playlist = await ytApi.addVideoToPlaylist(videoId, playlistId);
        // console.log(playlist);

        console.log(`--- 3-2. 動画タイトルを変更します。 ---`);
        try {
          // NotionのLesson情報から動画タイトルを生成
          const videoTitle = await getClassInfo.findLessonTitle(classInfo.classId);
          // console.log(`videoTitle:`, videoTitle);

          if(videoTitle !== '') {
            // 動画のタイトルを変更
            const editedVideo = await ytApi.updateVideoTitle(videoId, videoTitle);
            if(editedVideo.hasOwnProperty('kind')) {
              console.log(`- 動画タイトルを変更しました。: ${videoTitle}`);
            }

          }
        } catch (error) {
          console.log(`- 動画タイトルの変更に失敗しました。`,error);
        }

        console.log(`--- 3-3. WSプレイリストから削除します。 ---`);
        const removeVideo = await ytApi.removeVideoFromPlaylist(lessonVideos[i].linkedId);
        // console.log(removeVideo);
        if(removeVideo.hasOwnProperty('kind')) {
          console.log(`- 削除に成功しました。`);
          console.log(`- 再生リストの付け替え完了---`);
        }
      }


      console.log(`処理を終了します。`)

    } catch (error) {
      console.error(error)
    }
}

main();