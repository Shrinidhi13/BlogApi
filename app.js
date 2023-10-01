const express = require('express');
const axios = require('axios');
const _ = require('lodash');

const app = express();
const PORT = 3000;

const BLOG_API = 'https://intent-kit-16.hasura.app/api/rest/blogs';
const BLOG_API_SECRET = '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6';

async function fetchData() {
    try {
        const response = await axios.get(BLOG_API, {
            headers: {
                'x-hasura-admin-secret': BLOG_API_SECRET
            }
        });

        return response.data.blogs;  // Change is here: Using response.data.blogs
    } catch (error) {
        throw new Error('Error fetching data from API.');
    }
}

const analyzeData = async (req, res) => {
    try {
        const data = await fetchData();

        const totalBlogs = data.length;

        const longestTitleEntry = _.maxBy(data, blog => blog && blog.title ? blog.title.length : 0);
        const longestTitleBlog = longestTitleEntry ? longestTitleEntry.title : 'No blogs available';

        const blogsWithPrivacy = _.filter(data, blog => blog.title && blog.title.toLowerCase().includes('privacy')).length;

        const uniqueBlogTitles = _.uniqBy(data, 'title').map(blog => blog.title);

        res.json({
            totalBlogs,
            longestTitleBlog,
            blogsWithPrivacy,
            uniqueBlogTitles
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

app.get('/api/blog-stats', analyzeData);

app.get('/api/blog-search', async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({ error: "Query parameter is required." });
        }

        const data = await fetchData();
        const filteredBlogs = data.filter(blog => blog.title && blog.title.toLowerCase().includes(query.toLowerCase()));

        res.json(filteredBlogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('Welcome to the Blog Analytics API. Use /api/blog-stats for analytics and /api/blog-search for searching blogs.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
