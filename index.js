const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBSite= require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const path = require('path');
const csrf = require('csurf');
const flash = require('connect-flash');
const User = require('./models/user');
const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, file.filename + '_' + file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const PORT = process.env.PORT || 5000

const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://samhay:artport341@art-portfolio.3l0ic.mongodb.net/portfolio?retryWrites=true&w=majority"

const site = new MongoDBSite({
    uri: MONGODB_URL,
    collection: 'sessions'
  });
const csrfProtection = csrf();

const corsOptions = {
    origin: "https://cs-431-team-project.herokuapp.com/",
    optionSuccessStatus: 200
};

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    family: 4
}

const app = express();

app.use(cors(corsOptions)); 

app.use(
    session({
      secret: 'my secret',
      resave: false, 
      saveUninitialized: false,
      site: site
    })
);

app.use(express.static(path.join(__dirname, 'public')))
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.use(bodyParser({ extended: false }))

app.use(csrfProtection);
  
app.use(flash());

// Looking to see if there is a user logged in
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

//connect to routes
const routes = require('./routes/routes');

app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
    .use('/images', express.static(path.join(__dirname, 'images')))
    .use('/', routes)
    .use((req, res, next) => {
        res.render('pages/404', { title: '404 - Page Not Found', path: req.url })
});

mongoose
    .connect(
        MONGODB_URL, options
    )
    .then(result => {
        app.listen(PORT);
    })
    .catch(err => {
        console.log(err);
});