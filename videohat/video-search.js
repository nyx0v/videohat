
const Youtube = require('./youtube');
const DailyMotion = require('./dailymotion');

module.exports = class VideoSeach {
    
    shuffleArray(arr) {
      return arr.sort(() => Math.random() - 0.5);
    }
    shuffleArrays(arr1, arr2) {
        let arr = arr1.concat(arr2);
        return this.shuffleArray(arr);
    }

    createVideo(yt_vids, dm_vids) {
        let videos = [];
        for (let vid of yt_vids) {
            videos.push({
                id: vid.id.videoId,
                title: vid.snippet.title,
                description: vid.snippet.description,
                thumbnail: vid.snippet.thumbnails.medium.url,
                source: 'youtube',
                tags: vid.snippet.tags
            });
        }

        for (let vid of dm_vids) {
            videos.push({
                id: vid.id,
                title: vid.title,
                description: vid.description,
                thumbnail: vid.thumbnail_360_url,
                source: 'dailymotion',
                tags: vid.description.split([' ', ',', '.', ';', ':', '!', '?', '(', ')', '[', ']', '{', '}', '/', '\\', '\'', '"', '`', '~', '@', '#', '$', '%', '^', '&', '*', '-', '_', '+', '=', '<', '>', '|']),
            });
        }

        return this.shuffleArray(videos);
    
    
    }
    async search(query, page, pageToken) {
        const yt = new Youtube();
        const dm = new DailyMotion();
        let yt_vids, dm_vids, videos;

        try {
            yt_vids = await yt.search(query, pageToken);
            dm_vids = await dm.search(query, page);
            console.log(dm_vids.has_more)
            videos = {
                nextPageToken: yt_vids.nextPageToken,
                nextPage: dm_vids.page+1,
                dm_has_more: dm_vids.has_more,
                videos: this.createVideo(yt_vids.items, dm_vids.list)
            };

            return videos;

        }
        catch (error) {
            console.error("Error while trying to search for videos");
            console.error(error.message);
            return null;
        }
    }
}