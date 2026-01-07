import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const session = await getSession({ req });
    const mode = (req.query.mode || 'timeline').toString(); // 'timeline' | 'byId' | 'search'
    const ids = (req.query.ids || '').toString();           // for mode=byId (comma-separated)
    const searchQuery = (req.query.query || '').toString(); // for mode=search
    const maxResults = (req.query.max_results || '100').toString();

    // Prefer user token; fallback to app bearer token (from env)
    const userAccessToken = session?.accessToken || '';
    const appBearerRaw = (process.env.TWITTER_BEARER_TOKEN || process.env.BEARER_TOKEN || '').trim();
    const appBearerToken = appBearerRaw.replace(/^['"]|['"]$/g, ''); // strip surrounding quotes if any

    // Helper
    const callTwitter = async (url, bearer) => {
      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${bearer}`,
          'Content-Type': 'application/json',
        },
      });
      return resp;
    };

    let apiUrl = '';
    let bearerToUse = '';

    if (mode === 'timeline') {
      if (!session) return res.status(401).json({ success: false, error: 'Unauthorized' });
      if (!userAccessToken) {
        return res.status(400).json({
          success: false,
          error: 'Unable to access your tweets. Please paste your tweet manually.',
        });
      }
      const userId = session.user?.id || session.user?.username;
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'Unable to fetch tweets. Please paste your tweet manually.' 
        });
      }

      // Optional: user info check for clearer errors
      const userInfoUrl = `https://api.twitter.com/2/users/${userId}?user.fields=username,created_at`;
      const userInfoResponse = await callTwitter(userInfoUrl, userAccessToken);
      if (!userInfoResponse.ok && (userInfoResponse.status === 401 || userInfoResponse.status === 403)) {
        return res.status(401).json({
          success: false,
          error: 'Unable to access your tweets. Please paste your tweet manually.',
        });
      }

      const params = new URLSearchParams({
        max_results: maxResults,
        'tweet.fields': 'created_at,text,public_metrics',
        exclude: 'retweets,replies',
      });
      apiUrl = `https://api.twitter.com/2/users/${userId}/tweets?${params.toString()}`;
      bearerToUse = userAccessToken;
    } else if (mode === 'byId') {
      const idList = ids.split(',').map(s => s.trim()).filter(Boolean);
      if (!idList.length) return res.status(400).json({ success: false, error: 'ids is required (comma-separated)' });
      const params = new URLSearchParams({
        ids: idList.join(','),
        'tweet.fields': 'created_at,text,public_metrics',
      });
      apiUrl = `https://api.twitter.com/2/tweets?${params.toString()}`;
      bearerToUse = appBearerToken || userAccessToken;
      if (!bearerToUse) {
        return res.status(401).json({
          success: false,
          error: 'Twitter bearer token not configured. Set TWITTER_BEARER_TOKEN (or BEARER_TOKEN).',
        });
      }
    } else if (mode === 'search') {
      if (!searchQuery) return res.status(400).json({ success: false, error: 'query is required for search mode' });
      const params = new URLSearchParams({
        query: searchQuery,
        max_results: maxResults,
        'tweet.fields': 'created_at,text,public_metrics',
      });
      apiUrl = `https://api.twitter.com/2/tweets/search/recent?${params.toString()}`;
      bearerToUse = appBearerToken || userAccessToken;
      if (!bearerToUse) {
        return res.status(401).json({
          success: false,
          error: 'Twitter bearer token not configured. Set TWITTER_BEARER_TOKEN (or BEARER_TOKEN).',
        });
      }
    } else {
      return res.status(400).json({ success: false, error: 'Invalid mode. Use timeline | byId | search' });
    }

    // Execute request
    const response = await callTwitter(apiUrl, bearerToUse);

    if (!response.ok) {
      const errorText = await response.text();
      // If access token is invalid, return a helpful error
      if (response.status === 401 || response.status === 403) {
        return res.status(401).json({
          success: false,
          error: 'Unable to fetch tweets. Please paste your tweet manually.',
        });
      }

      return res.status(response.status).json({
        success: false,
        error: 'Unable to fetch tweets. Please paste your tweet manually.',
      });
    }

    const data = await response.json();

    // Transform tweets to a simpler format
    const tweets = (data.data || []).map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      metrics: tweet.public_metrics || {},
    }));

    res.status(200).json({
      success: true,
      tweets: tweets,
      count: tweets.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Could not fetch tweets right now. You can paste a tweet manually instead.',
    });
  }
}

