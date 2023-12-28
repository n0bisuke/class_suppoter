'use strict';

const fs = require('node:fs');
const LOGFILE_NAME = `log.json`;

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tokyo");

console.log(`--TESTENV---`)
console.log(process.env.TESTENV1, JSON.parse(process.env.TESTENV1));
console.log(process.env.TESTENV2, JSON.parse(process.env.TESTENV2));
console.log(process.env.TESTENV3, JSON.parse(process.env.TESTENV3));
console.log(process.env.TESTENV4, JSON.parse(process.env.TESTENV4));
console.log(process.env.TESTENV5, JSON.parse(process.env.TESTENV5));
console.log(process.env.TESTENV6, JSON.parse(process.env.TESTENV6));

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