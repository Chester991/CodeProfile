import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

const getLeetCodeData = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const graphqlQuery = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            submitStats: submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
          userContestRanking(username: $username) {
            attendedContestsCount
            rating
            globalRanking
          }
        }
      `,
      variables: {
        username
      }
    };

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphqlQuery)
    });

    const data = await response.json();

    if (!data.data.matchedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { matchedUser, userContestRanking } = data.data;

    const result = {
      username: matchedUser.username,
      problemsSolved: matchedUser.submitStats.acSubmissionNum.reduce((total, item) => {
        if (item.difficulty !== 'All') {
          return total + item.count;
        }
        return total;
      }, 0),
      easySolved: matchedUser.submitStats.acSubmissionNum.find(item => item.difficulty === 'Easy')?.count || 0,
      mediumSolved: matchedUser.submitStats.acSubmissionNum.find(item => item.difficulty === 'Medium')?.count || 0,
      hardSolved: matchedUser.submitStats.acSubmissionNum.find(item => item.difficulty === 'Hard')?.count || 0,
      contestRating: userContestRanking?.rating || 0,
      contestRanking: userContestRanking?.globalRanking || 0,
      contestsAttended: userContestRanking?.attendedContestsCount || 0
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('LeetCode fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch LeetCode data',
      error: error.message
    });
  }
};

export { getLeetCodeData };
