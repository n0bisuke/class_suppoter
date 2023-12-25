const { Client, APIErrorCode } = require("@notionhq/client")

const classInfoDBId = process.env.NOTION_CLASS_DBID;

// classの情報を取得する
const findByRoomURL = async (roomurl) => {
    try {
        const roomid = roomurl.split('meet.google.com/')[1];
        const notion = new Client({auth: process.env.NOTION_TOKEN});
    
        const response = await notion.databases.query({
            database_id: classInfoDBId,
            filter: {
              or: [
                {
                  property: '授業部屋',
                  url: {
                    contains: roomid
                  }
                }
              ],
            },
        });
    
        let classInfo = {};
        // console.log(response);
        response.results.forEach(element => {
            // console.log(element.properties.名前.title[0].plain_text)
            console.log(element.properties)
            classInfo.lesson = element.properties['授業資料'].url;
            classInfo.roomURL = element.properties['授業部屋'].url;
            classInfo.roomID = element.properties['授業部屋'].url.split('meet.google.com/')[1];
            classInfo.ytListUrl = element.properties['YouTubeリスト'].url;
            classInfo.ytListId = element.properties['YouTubeリスト'].url.split('list=')[1];
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

// classの情報を全て取得 - 最新クラス
const findAll = async(options={limit: 10}) => {
    try {
        const notion = new Client({auth: process.env.NOTION_TOKEN});
    
        const response = await notion.databases.query({
            database_id: classInfoDBId,
            sorts:[
              {
                  "property": "期間",
                  "direction": "descending"
              },
              {
                "property": "最終更新",
                "direction": "descending"
              },
            ]
        });
    
        let classItemsNew = [];
        const classItems = response.results;

        //一旦クラスの情報を取得 - 最新クラスから指定件数
        for (let i = 0; i < options.limit; i++) {
          try {
            // console.log(classItems[i].properties['期間'])
            const groupId = classItems[i].properties['グループID'].select.name ? classItems[i].properties['グループID'].select.name : '';
            const classId = classItems[i].properties['クラスID'].formula.string ? classItems[i].properties['クラスID'].formula.string : '';
            const schoolbookUrl = classItems[i].properties['授業資料'].url ? classItems[i].properties['授業資料'].url : '';
            const roomUrl = classItems[i].properties['授業部屋'].url ? classItems[i].properties['授業部屋'].url : '';
            const roomId = classItems[i].properties['授業部屋'].url ? classItems[i].properties['授業部屋'].url.split('meet.google.com/')[1] : '';
            const ytListUrl = classItems[i].properties['YouTubeリスト'].url ? classItems[i].properties['YouTubeリスト'].url : '';
            const ytListId = classItems[i].properties['YouTubeリスト'].url ? classItems[i].properties['YouTubeリスト'].url.split('list=')[1] : '';
            const endDate = classItems[i].properties['期間'].date.end ? classItems[i].properties['期間'].date.end : '';
            
            const classItemTmp = {
              groupId: groupId,
              classId: classId,
              schoolbookUrl: schoolbookUrl,
              roomUrl: roomUrl,
              roomId: roomId,
              ytListUrl: ytListUrl,
              ytListId: ytListId,
              endDate: endDate
            };
            classItemsNew[i] = classItemTmp;
          } catch (error) {
              continue;
          }
        }
        
        // YouTube再生リストの情報が抜けてるものを排除
        classItemsNew = classItemsNew.filter(item => item.ytListUrl !== '');

        //グループIDで重複しているものを排除
        const result = Object.values(classItemsNew.reduce((acc, item) => {
          const existingItem = acc[item.groupId];
          if (!existingItem || new Date(item.endDate) > new Date(existingItem.endDate)) {
            acc[item.groupId] = item;
          }
          return acc;
        }, {}));
        
        // console.log(result);
        return result;

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

module.exports = {
  findByRoomURL: findByRoomURL,
  findAll: findAll
};