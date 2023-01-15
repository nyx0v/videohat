const axios = require('axios');

class Dailymotion {
  

    async search(query, page = 1) {
        let videos
        try {
            videos = await axios.get(`https://api.dailymotion.com/videos?search=${encodeURI(query)}&fields=id,title,description,thumbnail_720_url,views_total,created_time,owner.screenname,owner.avatar_720_url&limit=10&page=${page}`);
            videos = videos.data;
            videos.list.forEach(video => {
                video.source="dailymotion";
            });
            return videos;
        } catch (error) {
            console.error("Error while trying to search for videos on Dailymotion");
            console.error(error.message);
            return null;
        }
    }

    async getVideo(id, iframe_width = 480, iframe_height = 270) {
        let video
        try {
            video = await axios.get(`https://api.dailymotion.com/video/${id}?fields=id,title,description,thumbnail_720_url,views_total,created_time,owner.screenname,owner.avatar_720_url`);
            video = video.data;
            video.iframe = `<iframe frameborder="0" width="${iframe_width}" height="${iframe_height}" src="https://www.dailymotion.com/embed/video/${id}" allowfullscreen allow="autoplay"></iframe>`;	
            video.source = "dailymotion";
            return video;
        } catch (error) {
            console.error("Error while trying to get video from Dailymotion");
            console.error(error.error);
            return null;
        }
    }
}

module.exports = Dailymotion;