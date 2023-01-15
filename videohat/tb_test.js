const Youtube = require('./youtube');

const yt = new Youtube();

yt.search("test").then((res) => {
    console.log(res.items[0].id.videoId
        );
})