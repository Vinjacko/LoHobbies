const express = require('express');
const diaryController = require('../controllers/diaryEntry.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.use(authController.protect);

router
    .route('/')
    .get(diaryController.getUserDiary)      
    .post(diaryController.logOrUpdateEntry); 

router
    .route('/:entryId')
    .delete(diaryController.deleteEntry);

module.exports = router;