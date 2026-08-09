const axios = require('axios');

class YoutubeService {
    constructor() {
        this.apiKey = process.env.SERPAPI_API_KEY || "";
        this.baseUrl = "https://serpapi.com/search";
    }

    /**
     * Search YouTube videos for a specific topic
     * @param {string} query - The search query (e.g., "Learn Data Structures")
     * @returns {Promise<Array>} - List of video objects { title, link, thumbnail, channel }
     */
    async searchVideos(query) {
        if (!this.apiKey) {
            return this.getFallbackVideos(query);
        }

        try {
            const response = await axios.get(this.baseUrl, {
                params: {
                    engine: "youtube",
                    search_query: query,
                    api_key: this.apiKey,
                    num: 15
                }
            });

            if (!response.data.video_results) {
                return this.getFallbackVideos(query);
            }

            const videoResults = response.data.video_results.map(video => ({
                title: video.title,
                link: video.link,
                thumbnail: video.thumbnail?.static || video.thumbnail?.default,
                channel: video.channel?.name,
                views: video.views,
                length: video.length
            }));

            const longVideos = videoResults.filter(video => {
                if (!video.length) return true;
                const parts = video.length.split(':').map(Number);
                let seconds = 0;
                if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
                else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
                else seconds = parts[0];
                return seconds >= 60;
            });

            return longVideos.length > 0 ? longVideos.slice(0, 6) : this.getFallbackVideos(query);
        } catch (error) {
            console.error(`YouTube search failed for query "${query}":`, error.message);
            return this.getFallbackVideos(query);
        }
    }

    getFallbackVideos(query) {
        const q = (query || "").toLowerCase();

        if (q.includes("system design") || q.includes("architecture") || q.includes("microservice")) {
            return [
                {
                    title: "System Design Interview Course for Beginners",
                    link: "https://www.youtube.com/watch?v=m8Icp_Cid5o",
                    thumbnail: "https://i.ytimg.com/vi/m8Icp_Cid5o/hqdefault.jpg",
                    channel: "freeCodeCamp.org",
                    views: "1.2M",
                    length: "1:24:10"
                },
                {
                    title: "System Design for Beginners Course",
                    link: "https://www.youtube.com/watch?v=SqcXvc3ZmRU",
                    thumbnail: "https://i.ytimg.com/vi/SqcXvc3ZmRU/hqdefault.jpg",
                    channel: "ByteByteGo",
                    views: "850K",
                    length: "45:30"
                },
                {
                    title: "Top 7 System Design Concepts Every Developer Should Know",
                    link: "https://www.youtube.com/watch?v=i53Gi_K3o7I",
                    thumbnail: "https://i.ytimg.com/vi/i53Gi_K3o7I/hqdefault.jpg",
                    channel: "Gaurav Sen",
                    views: "2.1M",
                    length: "18:45"
                }
            ];
        }

        if (q.includes("algorithm") || q.includes("dsa") || q.includes("data structure") || q.includes("code")) {
            return [
                {
                    title: "Data Structures and Algorithms for Beginners",
                    link: "https://www.youtube.com/watch?v=8hly31xKLI0",
                    thumbnail: "https://i.ytimg.com/vi/8hly31xKLI0/hqdefault.jpg",
                    channel: "freeCodeCamp.org",
                    views: "3.4M",
                    length: "5:12:00"
                },
                {
                    title: "NeetCode 150 - Roadmap to Master LeetCode",
                    link: "https://www.youtube.com/watch?v=KLlXCFG5TnA",
                    thumbnail: "https://i.ytimg.com/vi/KLlXCFG5TnA/hqdefault.jpg",
                    channel: "NeetCode",
                    views: "1.8M",
                    length: "22:15"
                },
                {
                    title: "Striver's A2Z DSA Course Tutorial",
                    link: "https://www.youtube.com/watch?v=0bHoB3etf1U",
                    thumbnail: "https://i.ytimg.com/vi/0bHoB3etf1U/hqdefault.jpg",
                    channel: "take U forward",
                    views: "2.9M",
                    length: "35:40"
                }
            ];
        }

        // General Engineering / Technical Interview prep fallback
        return [
            {
                title: "How to Ace the Technical Interview",
                link: "https://www.youtube.com/watch?v=1uFJqkWhJb4",
                thumbnail: "https://i.ytimg.com/vi/1uFJqkWhJb4/hqdefault.jpg",
                channel: "Clément Mihailescu",
                views: "950K",
                length: "15:20"
            },
            {
                title: "Top Technical Interview Coding Patterns",
                link: "https://www.youtube.com/watch?v=0K_eZGS5UsU",
                thumbnail: "https://i.ytimg.com/vi/0K_eZGS5UsU/hqdefault.jpg",
                channel: "NeetCode",
                views: "1.5M",
                length: "28:10"
            },
            {
                title: "Behavioral Interview Questions and Answers",
                link: "https://www.youtube.com/watch?v=PJKYqLP6MRE",
                thumbnail: "https://i.ytimg.com/vi/PJKYqLP6MRE/hqdefault.jpg",
                channel: "CareerVidz",
                views: "2.4M",
                length: "12:45"
            }
        ];
    }
}

module.exports = new YoutubeService();
