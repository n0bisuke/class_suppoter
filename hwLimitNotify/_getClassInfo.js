const { Client, APIErrorCode } = require("@notionhq/client")

const classInfoDBId = process.env.NOTION_CLASS_DBID;

// classIDからclassの情報を取得する
const getClassInfo = async (classId) => {
    try {

        const notion = new Client({auth: process.env.NOTION_TOKEN});    
        const response = await notion.databases.query({
            database_id: classInfoDBId,
            filter: {
              or: [
                {
                  property: 'クラス名',
                  url: {
                    contains: classId
                  }
                }
              ],
            },
        });
    
        let classInfo = {};
        // console.log(response);
        response.results.forEach(element => {
            // console.log(element.properties.名前.title[0].plain_text)
            // console.log(element.properties)
            classInfo.lesson = element.properties['授業資料'].url;
            classInfo.roomURL = element.properties['授業部屋'].url;
            classInfo.roomID = element.properties['授業部屋'].url.split('meet.google.com/')[1];
            classInfo.ytListUrl = element.properties['YouTubeリスト'].url;
            classInfo.ytListId = element.properties['YouTubeリスト'].url.split('list=')[1];
            classInfo.webhook = element.properties['WebhookURL'].url;
        });
    
        // console.log(response.results.length, classInfo);
        return classInfo;
    } catch (error) {
        if (error.code === APIErrorCode.ObjectNotFound) {
            //
            // For example: handle by asking the user to select a different database
            //
            } else {
            // Other error handling code
            console.error(error)
        }
    }
}

module.exports = getClassInfo;