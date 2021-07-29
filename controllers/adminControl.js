const art = require('../models/art.js');
const Art = require('../models/art.js');
const fileHelper = require('../util/fileManager');

const ITEMS_PER_PAGE = 10;

exports.getArt = (req, res, next) => {
    const user = req.user;
    const page = +req.query.page || 1; 
    let totalArt;

    Art.find({ userId: user })
    .countDocuments()
    .then(artNum => {
        totalArt = artNum;
        return Art.find({ userId: user })
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .sort({dateAdded: -1});
    })
    .then(art => {
        let usernames = [];
        for(i = 0; i < art.length; i++){
            usernames.push(art[i].username);
        }

        res.render('../views/pages/index.ejs',{
        title: 'My Art',
        path: '/my-art',
        user: user,
        itemList: art, 
        usernames: usernames,
        owner: true,
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

exports.getViewArt = (req, res, next) => {  
    const artId = req.query.artId;

    Art.findById(artId)
    .then(art => {
        let isOwner;
        if(req.user){
            isOwner = (req.user._id.toHexString() == art.userId.toHexString());
        }
        else{
            isOwner = false;
        }
        const tagArray = art.tags;
        let tagString = "";

        for(i = 0; i < tagArray.length; i++){ 
            if(i){
                tagString += ", ";
            }
            tagString += tagArray[i];
        }
 
        res.render('../views/pages/view-art.ejs',{
        title: art.title,
        path: '/view-art',
        art: art,
        owner: isOwner,
        tags: tagString
        });
    })
    .catch(err => console.log(err));
}; 

exports.getAddArt = (req, res, next) => {
    res.render('../views/pages/add-art',{
        title: 'Add Art',
        path: '/add-art'
    });
};

exports.postAddArt = (req, res, next) => { 
    const title = req.body.title;
    const description = req.body.description;
    const image = req.file;
    const userId = req.user;
    const tagString = req.body.tags;

    const tags = tagString.split(", ");

    if(!image){
        res.redirect('/add-art');
    }
    const imageUrl = image.path; 

    const art = new Art({
        title: title, 
        tags: tags, 
        image: imageUrl,
        description: description,
        userId: userId,
        dateAdded: new Date()
    });
    art.save()
    .then(result => {
        res.redirect('/my-art');
    })
    .catch(err => {
        console.log(err);
    })
};

exports.getEditArt = (req, res, next) => {
    const artId = req.query.artId;

    Art.findById(artId).then(art => {
        const tagArray = art.tags;
        let tagString = "";

        for(i = 0; i < tagArray.length; i++){ 
            if(i){
                tagString += ", ";
            }
            tagString += tagArray[i];
        }
 
        res.render('../views/pages/edit-art', {
        title: 'Edit Art',
        path: '/edit-art',
        art: art,
        tags: tagString
        }) 
    })
};

exports.postEditArt = (req, res, next) => { 
    const artId = req.body.artId;
    const newTitle = req.body.title;
    const newDescription = req.body.description;
    const tagString = req.body.tags;
    const newImage = req.file;

    Art.findById(artId)
    .then(art => {
        art.title = newTitle;
        art.description = newDescription;
        art.lastEdited = new Date();
        art.tags = tagString.split(", ");

        if(newImage){
            fileHelper.deleteFile(art.image);
            art.image = newImage.path;
        }

        return art.save()
    })
    .then(result => {
        res.redirect('/my-art');
    })
    .catch(err => console.log(err));
};

exports.getDeleteArt = (req, res, next) => {
    const artId = req.query.artId;

    Art.findById(artId)
    .then(art => {
        fileHelper.deleteFile(art.image);
        return Art.findByIdAndRemove(artId);
    })
    .then(() => {
        res.redirect('/my-art');
    })
    .catch(err => console.log(err));
};