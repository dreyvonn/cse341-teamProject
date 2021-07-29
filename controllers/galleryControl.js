const Art = require('../models/art');
const User = require('../models/user');

const ITEMS_PER_PAGE = 10;

exports.getIndex = (req, res, next) => {
    const user = req.user;
    const page = +req.query.page || 1; 
    let totalArt;
    let usernames = [];

    Art.find()
    .countDocuments()
    .then(artNum => {
        totalArt = artNum;
        return Art.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .sort({dateAdded: -1})
        .populate('userId');
    })
    .then(art => {
        for(i = 0; i < art.length; i++){
            if(art[i].userId != null){
                if(art[i].userId.username){
                    usernames.push(art[i].userId.username);
                } 
                else {
                    usernames.push("Anonymous");
                } 
            } 
            else {
                usernames.push("Deleted User"); 
            }
        }

        res.render('../views/pages/index.ejs',{ 
        title: 'Public Gallery',
        path: '/index',
        user: user,
        itemList: art, 
        usernames: usernames,
        owner: false,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalArt,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalArt / ITEMS_PER_PAGE)
        });
    })
    .catch(err => console.log(err));
};

exports.getArtDetails = (req, res, next) => {
    res.render('../views/pages/art-details', {
        title: 'Art Details',
        path: '/art-details', 
        art: null
    });
};