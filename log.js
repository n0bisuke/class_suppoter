'use strict';

const fs = require('node:fs');
const LOGFILE_NAME = `log.json`;

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

(async () => {
    try {
        //ロギング
        const logjson = {
            msg: 'success',
            time: dayjs().tz().format()
        }
        fs.writeFileSync(LOGFILE_NAME, JSON.stringify(logjson));
        console.log(`log done--`, JSON.stringify(logjson));
    } catch (error) {
        console.error(error);
    }
})();