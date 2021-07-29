const path = require('path');
const express = require('express');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

const galleryController = require('../controllers/galleryControl.js');
const adminController = require('../controllers/adminControl.js');
const authController = require('../controllers/authControl');

//gallery
router.get('/', galleryController.getIndex);
router.get('/art-details', galleryController.getArtDetails); 

//admin
router.get('/my-art', isAuth, adminController.getArt); 
router.get('/view-art', adminController.getViewArt); 
router.get('/add-art', isAuth, adminController.getAddArt); 
router.post('/add-art', isAuth, adminController.postAddArt);
router.get('/edit-art', isAuth, adminController.getEditArt);
router.post('/edit-art', isAuth, adminController.postEditArt);
router.get('/delete-art', isAuth, adminController.getDeleteArt);

//auth
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.post('/logout', authController.postLogout);

module.exports = router;