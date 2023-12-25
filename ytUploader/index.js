'use strict';

const {google} = require('googleapis');
const googleAuth = require('./libs/googleAuth');
const auth = googleAuth(google);

const getClassInfo = require('./_getClassInfo');
const getYtVideo = require('./_getYtVideo');

const main = async () => {
    try {
        //直近のクラスを検索
        const classInfo = await getClassInfo.findAll();


        // const classInfo = await getClassInfo(ROOM_URL);
        console.log(classInfo);

        //workspaceの動画でROOMIDが含まれる動画(まだ名前変更されてない)を検索
        // const ytVideo = await getYtVideo.findWorkSpace(google, auth, classInfo.roomID);
        // console.log(ytVideo);

    } catch (error) {
      console.error(error)
    }
}

main();