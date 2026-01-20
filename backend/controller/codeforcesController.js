import axios from 'axios';

const getCodeforcesData = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const userInfoUrl = `${process.env.CODEFORCES_USER_INFO_URL}${username}`;
    const userRatingUrl = `${process.env.CODEFORCES_USER_RATING_URL}${username}`;

    const [userInfoResponse, userRatingResponse] = await Promise.all([
      axios.get(userInfoUrl),
      axios.get(userRatingUrl)
    ]);

    if (userInfoResponse.data.status !== 'OK' || !userInfoResponse.data.result.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userInfo = userInfoResponse.data.result[0];
    const ratings = userRatingResponse.data.result || [];

    const currentRating = ratings.length > 0 ? ratings[ratings.length - 1].newRating : 0;
    const maxRating = ratings.length > 0 ? Math.max(...ratings.map(r => r.newRating)) : 0;
    const contestsAttended = ratings.length;

    const result = {
      username: userInfo.handle,
      rating: currentRating,
      maxRating: maxRating,
      contestsAttended: contestsAttended,
      rank: userInfo.rank || 'unrated',
      country: userInfo.country || '',
      friendOfCount: userInfo.friendOfCount || 0,
      contribution: userInfo.contribution || 0,
      lastOnline: userInfo.lastOnlineTimeSeconds || 0,
      registrationTime: userInfo.registrationTimeSeconds || 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Codeforces fetch error:', error);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Codeforces data',
      error: error.message
    });
  }
};

export { getCodeforcesData };
