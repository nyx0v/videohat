const DailyMotion = require('./dailymotion');


const dm = new DailyMotion();

dm.search("Gad Elmaleh").then((res) => {
    console.log(res);
})