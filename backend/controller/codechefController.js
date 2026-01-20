import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const getCodeChefData = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const url = `https://www.codechef.com/users/${username}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const ratingElement = document.querySelector('.rating-number');
    const maxRatingElement = document.querySelector('.rating-header small');
    const starsElement = document.querySelector('.rating-star');
    const globalRankElement = document.querySelector('.rating-ranks a strong');
    const countryRankElement = document.querySelector('.rating-ranks strong:last-child');

    const rating = ratingElement ? parseInt(ratingElement.textContent) : 0;
    const maxRating = maxRatingElement ? parseInt(maxRatingElement.textContent.replace('max', '').trim()) : 0;
    const stars = starsElement ? starsElement.textContent.trim() : '';
    const globalRank = globalRankElement ? parseInt(globalRankElement.textContent.replace(/,/g, '')) : 0;
    const countryRank = countryRankElement ? parseInt(countryRankElement.textContent.replace(/,/g, '')) : 0;

    const scriptData = document.querySelector('#jsonData');
    let fullySolved = [];
    let partiallySolved = [];

    if (scriptData) {
      try {
        const jsonData = JSON.parse(scriptData.textContent);
        fullySolved = jsonData.fullySolved || [];
        partiallySolved = jsonData.partiallySolved || [];
      } catch (error) {
        console.error('Error parsing CodeChef JSON data:', error);
      }
    }

    const result = {
      username: username,
      rating: rating,
      maxRating: maxRating,
      stars: stars,
      globalRank: globalRank,
      countryRank: countryRank,
      fullySolved: fullySolved.length,
      partiallySolved: partiallySolved.length
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('CodeChef fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CodeChef data',
      error: error.message
    });
  }
};

export { getCodeChefData };
