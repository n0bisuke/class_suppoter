'use strict';

const getHWInfo = require('./_getHWInfo');
const getClassInfo = require('./_getClassInfo');
const postDiscord = require('./_postDiscord');

const main = async () => {
    try {
        const kadaiItems = await getHWInfo();

        // 課題の情報にクラスの情報を追加 - 主にWebhook用
        for (let i = 0, len = kadaiItems.length; i < len; i++) {
            const classInfo = await getClassInfo(kadaiItems[i].classId);
            kadaiItems[i].classInfo = classInfo;
        }
        //console.log(kadaiItems);

        // Discordに送信
        for (let i = 0, len = kadaiItems.length; i < len; i++) {
            const res = await postDiscord(kadaiItems[i]); //Discordにポスト
            console.log(res.status);
        }

    } catch (error) {
      console.error(error)
    }
}

main();