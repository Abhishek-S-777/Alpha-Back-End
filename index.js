const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
var path = require("path");
const url = require('url');

const app = express();

app.use(cors());
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
    extended: true
}));

// Upload files handler..
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) 
    {
        if(file.fieldname === "cover_image"){
            cb(null, './uploads')
        }
        else if(file.fieldname === "song_file"){
            cb(null, './uploads/audios')
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    //   cb(null, uuid.v4() + path.extname(file.originalname));
    }
})
const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/audio')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    //   cb(null, uuid.v4() + path.extname(file.originalname));
    }
})
  
const upload = multer({ storage: storage })
const upload2 = multer({ storage: storage2 })

// const upload = multer({ dest: "uploads/" });

const  multipart  =  require('connect-multiparty');
const  multipartMiddleware  =  multipart({ uploadDir:  './uploads' });

// MySQL Database Connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'alpha',
    port: 3307
});

// check database connection
db.connect(err=>{
    if(err){
        console.log(err);
    }
    else{
        console.log("MySQL Database Connected Successfully")
        console.log(__dirname)
    }
})

// get the base directory of the node js server

app.get('/cover_art',(req,res)=>{
    let baseDir = __dirname.split('\\').join('/');
    res.send({
        dir: baseDir+'/'
    })
})

// Operations on song table

// Add new song..
// Insert into song_base table
app.post('/song_base',upload.fields(
    [
        {name: 'cover_image', maxCount: 1}, 
        {name: 'song_file', maxCount: 1}
    ]),(req,res)=>{
    console.log("Index js line 86",req.body);
    let song_name = req.body.songname;
    let release_date = req.body.dateofrelease;
    // let filepath = "hsdfhjkds\\";
    let fileCoverPath = req.files.cover_image[0].path;
    let newCoverFilePath = fileCoverPath.split('\\').join('/');

    let songPath = req.files.song_file[0].path;
    let newSongPath = songPath.split('\\').join('/');

    console.log("New Song path",newSongPath)
    console.log("New cover path",newCoverFilePath)
    let base = __dirname.split('\\').join('/');

    
    let query = `insert into song_base(song_name, release_date, cover_image, audio, average_rating) values ('${song_name}', '${release_date}', '${newCoverFilePath}', '${newSongPath}', 0)`

    db.query(query,(err,result)=>{
        console.log(err)
        console.log(result)
        if(err){
            console.log(err)
        }
        else{
            res.send({
                message: "Data inserted Successfully",
                data: result
            })
        }
     })

})
// app.post('/song_base',upload.single("cover_image"),(req,res)=>{
//     console.log("Index js line 86",req.body);
//     let song_name = req.body.songname;
//     let release_date = req.body.dateofrelease;
//     // let filepath = "hsdfhjkds\\";
//     let filepath = req.file.path;
//     let newFilePath = filepath.split('\\').join('/');
//     let base = __dirname.split('\\').join('/');

    
//     let query = `insert into song_base(song_name, release_date, cover_image, average_rating) values ('${song_name}', '${release_date}', '${newFilePath}', 0)`

//     db.query(query,(err,result)=>{
//         console.log(err)
//         console.log(result)
//         if(err){
//             console.log(err)
//         }
//         else{
//             res.send({
//                 message: "Data inserted Successfully",
//                 data: result
//             })
//         }
//      })

// })

// Get all songs from song_base table..
app.get('/song_base',(req,res)=>{
    let query1 = `SELECT song_id FROM song_base`;
     db.query(query1,(err,result)=>{
        // console.log(err)
        // console.log(result)
        if(err){
            console.log(err)
        }
        else{
            res.send({
                message: "All Song IDs",
                data: result
            })
        }
     })
})

// Get the last inserted id
app.get('/song_base_id',(req,res)=>{
    let query1 = `SELECT MAX( song_id ) as id FROM song_base`;
     db.query(query1,(err,result)=>{
        // console.log(err)
        // console.log(result)
        if(err){
            console.log(err)
        }
        else{
            res.send({
                message: "Last Inserted ID",
                data: result
            })
        }
     })
})

// Insert into song_reference table
app.post('/song_reference', async (req,res)=>{
    let song_id = req.body.song_id;
    console.log("Song_reference", req.body)

    // console.log("Song reference node js called")
    req.body.artists.forEach(element => {        
        let query = `insert into song_reference(song_id, artist_name) values ('${song_id}', '${element.item_text}')`
        db.query(query,(err,result)=>{
        })     
    });

})

// Inner Join operation on song table
app.get('/song_inner_join',(req,res)=>{
    let query1 = `select * from song_base 
    inner join song_reference
    on song_base.song_id = song_reference.song_id`;
     db.query(query1,(err,result)=>{
        // console.log(err)
        // console.log(result)
        if(err){
            console.log(err)
        }
        else{
            res.send({
                message: "Inner Join Result",
                data: result
            })
        }
     })
})


// Operations on Artist table
// Add new Artist..
// Insert into artist_base table
app.post('/artist_base', upload.single("profile_pic"),(req,res)=>{
    // console.log("Reqbody",req.body);
    let artist_name = req.body.artistname;
    let dateofbirth = req.body.dateofbirth;
    let bio = req.body.biography
    let profile_pic = req.file;
    // console.log(profile_pic)
    let filepath = req.file.path;
    let newFilePath = filepath.split('\\').join('/');
    let base = __dirname.split('\\').join('/');
    // console.log("Base dir is", base);

    // console.log(base+'/'+newFilePath);

    let query = `insert into artist_base(artist_name, dob, bio, profile_pic, average_rating) values ('${artist_name}', '${dateofbirth}', '${bio}', '${newFilePath}',0)`

    db.query(query,(err,result)=>{
        // console.log(err)
        // console.log(result)

        if(err){
            console.log(err)
        }
        else{
            res.send({
                message: "Data inserted Successfully",
                data: result
            })
        }
     })

})

// Get all the artist names
app.get('/artist_names',(req,res)=>{
    let query1 = `SELECT artist_id as item_id, artist_name as item_text FROM artist_base`;
     db.query(query1,(err,result)=>{
        // console.log(err)
        // console.log(result)
        if(err){
            console.log(err)
        }
        else{
            res.send({
                message: "Artist Name",
                data: result
            })
        }
     })
})


// Get the last inserted id
app.get('/artist_base_id',(req,res)=>{
    let query1 = `SELECT MAX( artist_id ) as id FROM artist_base`;
     db.query(query1,(err,result)=>{
        // console.log(err)
        // console.log(result)
        if(err){
            console.log(err)
        }
        else{
            res.send({
                message: "Last Inserted ID",
                data: result
            })
        }
     })
})

// Insert into artist_reference table
app.post('/artist_reference', async (req,res)=>{
    // console.log("Artist reference node js called")
    // console.log(req.body.songname);
    // let artists = req.body.artists;

    req.body.artists.forEach(element => {
        // console.log(element.item_text);
        let query = `insert into artist_reference(artist_id, song_name) values ('${element.item_id}', '${req.body.songname}')`
        db.query(query,(err,result)=>{
         })
        
    });
})

// Inner Join operation on artist table
app.get('/artist_inner_join',(req,res)=>{
    let query1 = `select * from artist_base 
    inner join artist_reference
    on artist_base.artist_id = artist_reference.artist_id`;
     db.query(query1,(err,result)=>{
        // console.log(err)
        // console.log(result)
        if(err){
            console.log(err)
        }
        else{
            res.send({
                message: "Inner Join Result",
                data: result
            })
        }
     })
})


// operations on user table

// Signup function..
app.post('/user_base', (req,res)=>{
    // console.log("User sign up called ")
    let query = `insert into user_base(uname, uemail, upassword) values ('${req.body.uname}', '${req.body.uemail}', '${req.body.upwdHash}')`
    db.query(query,(err,result)=>
    {
        if(err){
            console.log(err)
        }
        else{
            res.send({
                message: "Signup",
                data: result
            })
            // console.log(result)
        }

    })
        
})

// Get the last inserted id
app.get('/user_base_id',(req,res)=>{
    let query1 = `SELECT MAX( userid ) as id FROM user_base`;
     db.query(query1,(err,result)=>{
        // console.log(err)
        // console.log(result)
        if(err){
            console.log(err)
        }
        else{
            res.send({
                message: "User Last Inserted ID",
                data: result
            })
        }
     })
})

// Login function
app.get('/user_base_login',(req,res)=>{
    const queryObject = url.parse(req.url, true).query;
    // console.log(queryObject.email);
    let query1 = `select * from user_base where uemail = '${queryObject.email}'`;
     db.query(query1,(err,result)=>{
        // console.log(err)
        // console.log(result)
        if(err){
            console.log(err)
        }
        else{
            res.send({
                message: "Inner Join Result",
                data: result
            })
        }
     })
})

// Get the logged in user's song rating details
app.get('/user_reference_ratings',(req,res)=>{
    const queryObject = url.parse(req.url, true).query;
    console.log(queryObject.uid);
    let query1 = `select * from user_reference where userid = ${queryObject.uid}`;
     db.query(query1,(err,result)=>{
        // console.log(err)
        // console.log(result)
        if(err){
            console.log(err)
        }
        else{
            res.send({
                message: "User_reference song ratings data result",
                data: result
            })
        }
     })
})

// Insert into user_reference
app.post('/user_reference', (req,res)=>{
    var songIDs = [];
    var isSongPresent = false;
    console.log("user_request songs ", req.body)

    // Get all the song IDs..
    let query = `SELECT * FROM user_reference`;
    db.query(query,(err,result)=>{
    //    console.log(err)
    //    console.log(result)
       if(err){
        console.log(err)
       }
       else{
        songIDs = result;
        console.log("374",songIDs.length)
        if(songIDs.length == 0){
            isSongPresent = false;
        }
        else{
            songIDs.every(element=>{
                console.log("for each element: ",element);
                if(req.body.uid == element.userid){
                    console.log("Inside user id check if")
                    if((req.body.songid == element.song_id)){
                        console.log("if statement")
                        isSongPresent = true;
                        return false;
                    }
                    else if((req.body.songid != element.song_id)){
                        console.log("else statement")
                        isSongPresent = false;
                        return true;
                    }
                    return false
                }
                else{
                    console.log("Inside user id check else")
                    isSongPresent = false;
                    return true;
                }
                
            })
        }
       
        console.log("isSongPresent 390", isSongPresent)

        if(isSongPresent == true){
            console.log("Song Updated in user_reference")
            let query1 = `update user_reference set song_rating = '${req.body.rating}' where song_id = '${req.body.songid}' and userid = '${req.body.uid}'`;
            db.query(query1,(err,result)=>{
                if(err){
                    console.log(err)
                }
                else
                {
                    console.log("Song updated successfully")
                    res.send({
                        message: "User_reference song ratings updated",
                        data: result
                    })
                }
            })
        }
        else if(isSongPresent == false){
            console.log("Song inserted in user_reference")
            let query1 = `insert into user_reference(userid, song_id, song_rating) values ('${req.body.uid}', '${req.body.songid}', '${req.body.rating}')`;
            db.query(query1,(err,result)=>{
                if(err){
                    console.log(err)
                }
                else
                {
                    console.log("Song inserted successfully")
                    res.send({
                        message: "User_reference song ratings data inserted",
                        data: result
                    })
                }
            })
        }



       }
    })
})

// Calculate average rating of each song based on ratings of each user...
app.get('/user_reference_avg_song_rating',(req,res)=>{
    var avrSongRating = [];
    let query1 = `SELECT song_id,AVG(song_rating) AS avg_song_rating FROM user_reference GROUP by song_id`;
     db.query(query1,(err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            avrSongRating = result;
            console.log("Average calculated rating",avrSongRating)
            console.log("Average calculated rating length",avrSongRating.length)
            avrSongRating.forEach(element=>{
                console.log("Each element", element)
                console.log("Average rating",element.avg_song_rating)
                console.log("Average rating song id",element.song_id)
                let query1 = `update song_base set average_rating = '${element.avg_song_rating}' where song_id = '${element.song_id}'`;
                db.query(query1,(err,result)=>{
                    if(err){
                        console.log(err)
                    }
                    else
                    {
                        console.log("Song_base table updated successfully")
                        // res.send({
                        //     message: "User_reference song ratings updated",
                        //     data: result
                        // })
                    }
                })
                // return true
            })
            // res.send({
            //     message: "User_reference_avg song ratings update result",
            //     data: result
            // })
        }
     })
})


// Get the logged in user's artist rating details
app.get('/user_reference_artist_ratings',(req,res)=>{
    const queryObject = url.parse(req.url, true).query;
    console.log(queryObject.uid);
    let query1 = `select * from user_reference_artist where userid = ${queryObject.uid}`;
     db.query(query1,(err,result)=>{
        // console.log(err)
        // console.log(result)
        if(err){
            console.log(err)
        }
        else{
            res.send({
                message: "User_reference_artist artist ratings data result",
                data: result
            })
        }
     })
})

// Insert into user_reference_artist
app.post('/user_reference_artist', (req,res)=>{
    var artistIDs = [];
    var isArtistPresent = false;
    console.log("user_request artists ", req.body)

    // Get all the song IDs..
    let query = `SELECT * FROM user_reference_artist`;
    db.query(query,(err,result)=>{
    //    console.log(err)
    //    console.log(result)
       if(err){
        console.log(err)
       }
       else{
        artistIDs = result;
        console.log("374",artistIDs.length)
        if(artistIDs.length == 0){
            isArtistPresent = false;
        }
        else{
            artistIDs.every(element=>{
                console.log("for each element: ",element);
                if(req.body.uid == element.userid){
                    console.log("Inside user id check if")
                    if((req.body.artistid == element.artist_id)){
                        console.log("if statement")
                        isArtistPresent = true;
                        return false;
                    }
                    else if((req.body.artistid != element.artist_id)){
                        console.log("else statement")
                        isArtistPresent = false;
                        return true;
                    }
                    return false
                }
                else{
                    console.log("Inside user id check else")
                    isArtistPresent = false;
                    return true;
                }
                
            })
        }
       
        console.log("isSongPresent 390", isArtistPresent)

        if(isArtistPresent == true){
            console.log("Song Updated in user_reference")
            let query1 = `update user_reference_artist set artist_rating = '${req.body.rating}' where artist_id = '${req.body.artistid}' and userid = '${req.body.uid}'`;
            db.query(query1,(err,result)=>{
                if(err){
                    console.log(err)
                }
                else
                {
                    console.log("Artist updated successfully")
                    res.send({
                        message: "User_reference_artist artist ratings updated",
                        data: result
                    })
                }
            })
        }
        else if(isArtistPresent == false){
            console.log("Song inserted in user_reference_artist")
            let query1 = `insert into user_reference_artist(userid, artist_id, artist_rating) values ('${req.body.uid}', '${req.body.artistid}', '${req.body.rating}')`;
            db.query(query1,(err,result)=>{
                if(err){
                    console.log(err)
                }
                else
                {
                    console.log("Artist inserted successfully")
                    res.send({
                        message: "User_reference_artist artist ratings data inserted",
                        data: result
                    })
                }
            })
        }



       }
    })
})

// Calculate average rating of each artist based on ratings of each user...
app.get('/user_reference_avg_artist_rating',(req,res)=>{
    var avrArtistRating = [];
    let query1 = `SELECT artist_id,AVG(artist_rating) AS avg_artist_rating FROM user_reference_artist GROUP by artist_id`;
     db.query(query1,(err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            avrArtistRating = result;
            console.log("Average calculated rating",avrArtistRating)
            console.log("Average calculated rating length",avrArtistRating.length)
            avrArtistRating.forEach(element=>{
                console.log("Each element", element)
                console.log("Average rating",element.avg_artist_rating)
                console.log("Average rating song id",element.artist_id)
                let query1 = `update artist_base set average_rating = '${element.avg_artist_rating}' where artist_id = '${element.artist_id}'`;
                db.query(query1,(err,result)=>{
                    if(err){
                        console.log(err)
                    }
                    else
                    {
                        console.log("artist_base table updated successfully")
                        // res.send({
                        //     message: "User_reference song ratings updated",
                        //     data: result
                        // })
                    }
                })
                // return true
            })
            // res.send({
            //     message: "User_reference_avg song ratings update result",
            //     data: result
            // })
        }
     })
})

app.listen(3000,()=>{
    console.log("Server is running...")
});
