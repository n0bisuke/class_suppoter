const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
// dayjsにプラグインを適用
dayjs.extend(utc);
dayjs.extend(timezone);

const { Client, APIErrorCode } = require("@notionhq/client")

const classInfoDBId = process.env.NOTION_CLASS_DBID;
const lessonInfoDBId = process.env.NOTION_LESSON_DBID;

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

// classIdに紐づく授業を検索しタイトルを取得(string) - 日付が6日前から今日まで
const findLessonTitle = async (classId = 'PO09', options={limit: 10, searchDays: 6}) => {
  try {
    // 日本のタイムゾーンで現在の日時を取得し、ISO 8601形式に変換
    const today = dayjs().tz('Asia/Tokyo').format();
    const fewDaysAgo = dayjs().tz('Asia/Tokyo').subtract(options.searchDays, 'day').format(); //xx日前

    const notion = new Client({auth: process.env.NOTION_TOKEN});

    //クラスIDから授業リストを検索 - 日付が6日前から今日まで
    const response = await notion.databases.query({
        database_id: lessonInfoDBId,
        page_size: options.limit,
        filter: {
          and: [
            {
              property: '日付',
              date: {
                on_or_after: fewDaysAgo
              }
            },
            {
              property: '日付',
              date: {
                on_or_before: today
              }
            }
          ]
        },
        sorts:[
          {
            property: '日付',
            direction: 'descending'
          }
        ]
    });

    //classIdと一致しないものを排除
    const myClassLessons = response.results.filter(item => item.properties['クラスID(参照用)'].formula.string === classId);
    if(myClassLessons.length === 0) {
      console.log(`- ${classId}の授業がDBに見つかりませんでした。`);
      return '';
    }
    //おそらく1件のみ取得できるはず
    // console.log(myClassLessons.length, myClassLessons[0].properties);
    const currentLesson = myClassLessons[0];
    const lessonTitle = currentLesson.properties['授業回'].title[0].plain_text;
    const lessonDate = currentLesson.properties['日付'].date.start.split('.')[0];
    const lessonTopics1 = currentLesson.properties['実装授業トピック'].multi_select.map(item => item.name).join(',');
    const lessonTopics2 = currentLesson.properties['企画授業トピック'].multi_select.map(item => item.name).join(',');
    const lessonTopics3 = currentLesson.properties['その他授業トピック'].multi_select.map(item => item.name).join(',');
    const lessonTopics = `${lessonTopics1},${lessonTopics2},${lessonTopics3}`;

    const videoTitle = `${lessonTitle}_${lessonTopics} (${lessonDate})`;
    return videoTitle;
    // console.log(videoTitle);
  } catch (error) {
      if (error.code === APIErrorCode.ObjectNotFound) {
          //
          // For example: handle by asking the user to select a different database
          //
          } else {
          // Other error handling code
          console.error(error)
      }
      throw new Error(error);
  }

}

module.exports = {
  findByRoomURL: findByRoomURL,
  findAll: findAll,
  findLessonTitle: findLessonTitle
};