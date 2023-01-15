const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
module.exports= class Youtube {

    async search(query, pageToken) {

        let videos
        try {
            videos = await axios.get(`https://youtube.googleapis.com/youtube/v3/search?&q=${encodeURI(query)}&key=${process.env.YOUTUBE_API_KEY}&part=snippet&maxResults=10&order=viewCount&type=video${pageToken ? `&pageToken=${pageToken}` : ''}`);

            videos = videos.data;
            videos.items.forEach(video => {
                video.source="youtube";
            });
            return videos;
        } catch (error) {
            console.error("Error while trying to search for videos on Youtube");
            
            console.error(error.response.data);
            return null;
        }
    }

    async getVideo(id, iframe_width = 480, iframe_height = 270) {
        let video
        try {
            video = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${process.env.YOUTUBE_API_KEY}`);
            video = video.data.items[0];
            video.iframe = `<iframe width="${iframe_width}" height="${iframe_height}" src="https://www.youtube.com/embed/${id}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            video.source = "youtube";
            return video;
        } catch (error) {
            console.error("Error while trying to get video from Youtube");
            console.error(error.error);
            return null;
        }
    }


}