const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('./models/user');
const postModel = require('./models/posts')
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const databaseConnection = require('./utils/database');
// const user = require('./models/user');

databaseConnection();
dotenv.config();
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.render("index")
})

app.post('/register', async(req, res)=>{
    let {username, name, image, useremail, userpassword, userage} = req.body; 
        let user = await userModel.findOne({email: useremail});
        if(user){
            return res.send("User Already Registered");
        }       
    bcrypt.genSalt(10, (err,salt)=>{
        bcrypt.hash(userpassword, salt, async(err, hash)=>{
            let registeredUser = await userModel.create({
                username,
                name,
                image,  
                email: useremail,
                password: hash,
                age: userage
            })
            let token = jwt.sign({email: useremail, userid: registeredUser._id}, 'secretKey');
            res.cookie("token", token);
            // res.send("Successfully registered");
            res.redirect('/profile');
        })
    })  
})

app.get('/login', (req,res)=>{
    res.render('login');
})

app.post('/login', async(req,res)=>{

    let {useremail, userpassword} = req.body;
    const user = await userModel.findOne({email: useremail});
    if(!user){
        return res.send("You Are Not Registered");
    }
    bcrypt.compare(userpassword, user.password, function(err, result){
        if(result){
            let token = jwt.sign({email:useremail, userid:user._id}, 'secretKey');
            res.cookie("token", token);
            res.redirect('/profile');
        }
        else{
            res.redirect('/login');
        }
    })
})

app.get('/logout', (req,res)=>{
    res.cookie("token", "");
    res.redirect('/login');
})

app.get("/home", isLoggedIn,(req,res)=>{
    // console.log(req.user);
    res.render("home");
})

app.get('/profile', isLoggedIn, async (req,res)=>{
    let userdata = await userModel.findOne({email: req.user.email});
    // console.log(userdata);
    await userdata.populate('posts');
    // console.log(userdata.posts);
    res.render("profile",{userdata});
})

app.get('/createPost',isLoggedIn, (req,res)=>{
    res.render("createPost");
})

app.post('/createPost', isLoggedIn, async (req,res)=>{
    let {title, desc, image} = req.body;
    let user = await userModel.findOne({email: req.user.email});
    // console.log(user);
    const userPost = await postModel.create({
        user: user._id,
        title,
        description: desc,
        image,
    })
    user.posts.push(userPost._id); 
    await user.save();
    // console.log(userPost);
    res.redirect('/profile');
})

app.get('/postDelete/:postid',isLoggedIn, async (req,res)=>{
    // let user = await userModel.findOne({email: req.user.email});
    let posts = await postModel.findOneAndDelete({_id: req.params.postid});    
    res.redirect('/profile')
})

app.get('/editPost/:postid', isLoggedIn, async (req,res)=>{
    let post = await postModel.findOne({_id: req.params.postid}).populate("user");
    res.render('editPost', {post});
})

app.post('/editPost/:postid', isLoggedIn, async(req,res)=>{
    let updatePost = await postModel.findOneAndUpdate({_id: req.params.postid},{title: req.body.title, description: req.body.desc, image:req.body.image});
    res.redirect('/profile');
})

app.get('/editProfile', isLoggedIn, async (req,res)=>{
    let userProfile = await userModel.findOne({email: req.user.email})
    res.render('editProfile', {userProfile});

})

app.post('/editProfile', isLoggedIn, async (req,res)=>{
    let {username, name, image, userage} = req.body; 
    let userProfile = await userModel.findOneAndUpdate({username: username,  name: name, image: image, age: userage})
    // console.log(userProfile);
    res.redirect('/profile');
})


app.get('/feed', async(req,res)=>{
    let FeedPosts = await postModel.find();
    res.render('feed', {FeedPosts});
})


function isLoggedIn(req,res,next){
    // console.log(req.cookies);
    if(req.cookies.token === ""){
        res.redirect('/login');
    }else{
        let data = jwt.verify(req.cookies.token, 'secretKey')
        req.user = data;
    }
    next();
}

app.listen(process.env.PORT, ()=>{
    console.log(`Server is running on port : ${process.env.PORT}`);
})





