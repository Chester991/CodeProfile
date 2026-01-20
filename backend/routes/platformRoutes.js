import express from 'express';
import { getLeetCodeData } from '../controller/leetcodeController.js';
import { getCodeforcesData } from '../controller/codeforcesController.js';
import { getCodeChefData } from '../controller/codechefController.js';

const router = express.Router();

// Popular users endpoint - returns famous competitive programmers
router.get('/popular', (req, res) => {
    res.json({
        success: true,
        data: {
            leetcode: [
                { username: 'tourist', displayName: 'tourist' },
                { username: 'uwi', displayName: 'uwi' },
                { username: 'Petr', displayName: 'Petr' }
            ],
            codeforces: [
                { username: 'tourist', displayName: 'tourist' },
                { username: 'Benq', displayName: 'Benq' },
                { username: 'jiangly', displayName: 'jiangly' }
            ],
            codechef: [
                { username: 'gennady.korotkevich', displayName: 'Gennady' },
                { username: 'errichto', displayName: 'Errichto' },
                { username: 'scott_wu', displayName: 'Scott Wu' }
            ]
        }
    });
});

router.get('/leetcode/:username', getLeetCodeData);
router.get('/codeforces/:username', getCodeforcesData);
router.get('/codechef/:username', getCodeChefData);

export default router;
