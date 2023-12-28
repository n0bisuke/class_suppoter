const { Client, APIErrorCode } = require("@notionhq/client")

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
// dayjsにプラグインを適用
dayjs.extend(utc);
dayjs.extend(timezone);

const dbId = process.env.NOTION_KADAI_DBID;

// 課題の情報を取得する
const getKadaiInfo = async () => {
    try {
        // 日本のタイムゾーンで現在の日時を取得し、ISO 8601形式に変換
        const today = dayjs().tz('Asia/Tokyo').format();
        const in6days = dayjs().tz('Asia/Tokyo').add(6, 'day').format(); //6日後

        const notion = new Client({auth: process.env.NOTION_TOKEN});
        const response = await notion.databases.query({
            database_id: dbId,
            sorts:[
                {
                    "property": "提出期限",
                    "direction": "descending"
                }
            ],

            filter: {
                and: [
                  {
                    property: '提出期限',
                    date: {
                      on_or_after: today
                    }
                  },
                  {
                    property: '提出期限',
                    date: {
                      on_or_before: in6days
                    }
                  }
                ],
            },
        });
    
        return response.results.map(element => {
            // console.log(element.properties["クラス（外部参照用）"]);
            // console.log(element.properties["クラス"]);
            return {
                url: element.url,
                classId: element.properties['クラス（外部参照用）'].formula.string,
                title: element.properties.title.title[0].plain_text,
                submitLimit: element.properties['提出期限'].date.start,
                caLimit: element.properties['Check&Action期限'].date.start,
                reviewDate: element.properties['レビュー予定日'].date.start,
            };
        });

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

module.exports = getKadaiInfo;