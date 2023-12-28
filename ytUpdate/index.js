'use strict';

const {google} = require('googleapis');
const googleAuth = require('./libs/googleAuth');
const auth = googleAuth(google);
console.log(`- Google認証成功 ---`);

const getClassInfo = require('./_getClassInfo');
const getYtVideo = require('./_getYtVideo');


const main = async () => {
    try {
      
      const ytInfo = await getYtVideo.getYtInfo(google, auth, 'protoout');
      console.log(ytInfo.data);
      // return;


        /**
         * 1. 直近のクラスを検索*/
        console.log(`- NotionDBから最新クラス検索中...`);
        const classInfoItems = await getClassInfo.findAll({limit: 10});
        // console.log(`最新クラス---`, classInfo);

        /**
         * 2. 検索したクラスのROOMIDを使って、workspaceの動画で直近のクラスの授業動画を検索*/
        console.log(`- 授業の動画がないかYoutubeのworkspaceプレイリストを検索中...`);
        let lessonVideos = [];
        for (let i = 0, len = classInfoItems.length; i < len; i++) {
          const lessonVideo = await getYtVideo.findWorkSpace(google, auth, classInfoItems[i].roomId);
          if(lessonVideo !== null) {
            lessonVideos.push(lessonVideo);
          }
        }
        console.log(lessonVideos);
                //workspaceの動画でROOMIDが含まれる動画(まだ名前変更されてない)を検索
        // const ytVideo = await getYtVideo.findWorkSpace(google, auth, classInfo.roomID);
        // console.log(ytVideo);

    } catch (error) {
      console.error(error)
    }
}

main();