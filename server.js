require('dotenv').config()
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
const MongoClient = require('mongodb').MongoClient;
app.use('/public', express.static('public'));
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
var flash = require('connect-flash');

app.set('view engine', 'ejs');


var db;
MongoClient.connect(process.env.DB_URL,
    function (에러, client) {
        // db = client.db('todoapp');
        db = client.db('yourwedding');
        app.listen(process.env.PORT, function () {

        });

    });







// 회원가입 관련

app.post('/welcome', (요청, 응답) => {
    응답.render('welcome.ejs');

    db.collection('counter').findOne({
        name: '유저수'
    }, function (에러, 결과) {
        var totaluser = 결과.totalUser;

        db.collection('user').insertOne({
            _id: totaluser + 1,
            userId: 요청.body.userid,
            userPw: 요청.body.userpassword,
            userName: 요청.body.username,
            userPh: 요청.body.userph,
            userEmail: 요청.body.useremail,
        }, function (에러, 결과) {
            db.collection('counter').updateOne({
                name: '유저수'
            }, {
                $inc: {
                    totalUser: 1
                }
            }, function (에러, 결과) {});

        });
    });
});

//새견적 등록

app.post('/newquotation', (요청, 응답) => {

    db.collection('counter').findOne({
        name: '견적'
    }, function (에러, 결과) {
        var totalquotation = 결과.totalQuotation;

        db.collection('quotation').insertOne({
            _id: totalquotation + 1,
            quId: 요청.body.quid,
            quName: 요청.body.quname,
            quPh: 요청.body.quph,
            quEmail: 요청.body.quemail,
            wdDate: 요청.body.weddingdate,
            wdHall: 요청.body.weddinghall,
            wdDress: 요청.body.weddingdress,
            wdStudio: 요청.body.weddingstudio,
            wdMakeup: 요청.body.weddingmakeup,
            wdToday: 요청.body.weddingtoday
        }, function (에러, 결과) {
            db.collection('counter').updateOne({
                name: '견적'
            }, {
                $inc: {
                    totalQuotation: 1
                }
            }, function (에러, 결과) {});
        });
    });

    응답.render('quodone.ejs');
});



//회원 정보 수정

app.put('/mypage', function (요청, 응답) {
    db.collection('user').updateOne({
            userId: 요청.body.id
        }, {
            $set: {
                userPw: 요청.body.pw,
                userPh: 요청.body.ph,
                userEmail: 요청.body.email
            }
        },
        function (에러, 결과) {
            console.log('수정완료');
            응답.redirect('/mypage');
        });
});







//User Session

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const e = require('express');
app.use(flash());

app.use(session({
    secret: '비밀코드',
    resave: true,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


// 인증 후 맵핑
app.post('/login', passport.authenticate('local', {
    failureRedirect: '/loginfail',
    failureFlash: true
}), function (req, res) {
    res.redirect('/homeal')
});









//fail 맵핑
app.get('/fail', function (req, res) {
    res.render('fail.ejs');
});

//loginfail 맵핑
app.get('/loginfail', function (req, res) {
    res.render('loginfail.ejs');
});




// 마이페이지 체크
app.get('/mypage', loginCheck, function (req, res) {
    // console.log(req.user); 
    res.render('mypage.ejs', {
        user: req.user
    });
});

function loginCheck(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.render('fail.ejs')
    }
};
function homeLoginCheck(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.render('home.ejs');
    }
};

// new quotation 체크
app.get('/newquotation', loginCheck, function (req, res) {
    // console.log(req.user); 
    res.render('newquotation.ejs', {
        user: req.user
    });
});



// 글쓰기 체크
app.get('/write', loginCheck, function (req, res) {
    // console.log(req.user); 
    res.render('write.ejs', {
        user: req.user
    });
});

app.get('/deletefail', loginCheck, function (req, res) {
    // console.log(req.user); 
    res.render('deletefail.ejs', {
        user: req.user
    });
});



//my quotation with userId

app.get('/myquotation/:id', loginCheck, (요청, 응답) => {
    db.collection('quotation').find({
        quId: 요청.params.id
    }).toArray(function (에러, 결과) {
        if (결과 === null) {
            응답.render('myquotationnull.ejs', {
                user: 요청.user
            });
        } else {
            응답.render('myquotation.ejs', {
                data: 결과,
                user: 요청.user
            });
        };
    });
});

// quotation detail
app.get('/myquotation-detail/:id', function (요청, 응답) {
    db.collection('quotation').findOne({
        _id: parseInt(요청.params.id)
    }, function (에러, 결과) {

        응답.render('myquotation-detail.ejs', {
            data: 결과,
            user: 요청.user
        });
    })

});


// 홈 로긴 체크
app.get('/home', homeLoginCheck, function (req, res) {
    res.render('homeal.ejs', {
        user: req.user
    });
});

app.get('/homeal', homeLoginCheck, function (req, res) {
    res.render('homeal.ejs', {
        user: req.user
    });
});

app.get('/', homeLoginCheck, function (req, res) {
    res.render('homeal.ejs', {
        user: req.user
    });
});





//로그아웃
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});


//인증 수행
passport.use(new LocalStrategy({
    usernameField: 'id', 
    passwordField: 'pw', 
    session: true, 
    passReqToCallback: false, 
}, function (inputId, inputPw, done) {
    db.collection('user').findOne({
        userId: inputId
    }, function (에러, 결과) {
        if (에러) return done(에러)
        if (!결과) return done(null, false, {
            message: 'Incorrect userid'
        })
        if (inputPw == 결과.userPw) {
            return done(null, 결과)
        } else {
            return done(null, false, {
                message: 'Incorrect password'
            })
        }
    })
}));


passport.serializeUser(function (user, done) {
    done(null, user.userId);
});

//아이디는 user.userId 임
passport.deserializeUser(function (아이디, done) {
    db.collection('user').findOne({
        userId: 아이디
    }, function (에러, 결과) {
        done(null, 결과)
    })
});





// 게시판
app.post('/write', (요청, 응답) => {


    var theday = new Date();
    var utcNow = theday.getTime(); + (theday.getTimezoneOffset() + 60 * 1000); // utc변환
    var koreaTimeDiff = 9 * 60 * 60 * 1000; //9시간 더함
    var today = new Date(utcNow + koreaTimeDiff);

    var year = today.getFullYear();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);

    var hours = ('0' + today.getHours()).slice(-2);
    var minutes = ('0' + today.getMinutes()).slice(-2);
    var seconds = ('0' + today.getSeconds()).slice(-2);

    var dateString = year + '-' + month + '-' + day;
    var hourString = hours + ':' + minutes + ':' + seconds;

    console.log(dateString);
    console.log(hourString);


    db.collection('counter').findOne({
        name: 'post'

    }, function (에러, 결과) {

        var totalpost = 결과.totalPost;
        var 저장할거 = {

            _id: totalpost + 1,
            postTitle: 요청.body.title,
            postText: 요청.body.post,
            writer: 요청.user.userId,
            writerDay: dateString,
            writerTime: hourString,
            postRead: 0,
            postRecom: 0,
            postComments: 0
        }

        db.collection('post').insertOne(저장할거, function (에러, 결과) {
            db.collection('counter').updateOne({
                name: 'post'
            }, {
                $inc: {
                    totalPost: 1
                }
            }, function (에러, 결과) {
                if (에러) {
                    return console.log(에러)
                };
            });

        });
    });
    응답.redirect('/board');
});



// 게시판 
app.get('/board', loginCheck, function (req, res) {
    db.collection('post').find().toArray((err, result) => {

        // console.log(result);
        res.render('board.ejs', {
            posts: result,
            user: req.user
        });
    });
});



//나의 게시글
app.get('/board/:id', loginCheck, function (req, res) {

    console.log(req.user.userId)
    db.collection('post').find({
        writer: req.user.userId
    }).toArray((err, result) => {

        console.log(result);
        res.render('board.ejs', {
            posts: result,
            user: req.user
        });
    });
});



//게시글 상세
app.get('/boarddetail/:id', function (요청, 응답) {

    db.collection('post').updateOne({
        _id: parseInt(요청.params.id)
    }, {
        $inc: {
            postRead: 1
        }
    }, function (에러, 결과) {
        db.collection('post').findOne({
            _id: parseInt(요청.params.id)
        }, function (에러, 결과) {
            db.collection('comments').find({
                postId: parseInt(요청.params.id)
            }).toArray(function (err, comments) {
                console.log(comments);
                응답.render('boarddetail.ejs', {
                    data: 결과,
                    comments: comments,
                    user: 요청.user
                });
            });
        });
    });
});


//게시글 검색
app.get('/search', (요청, 응답) => {
    var 검색조건 = [{
            $search: {
                index: 'titleSearch',
                text: {
                    query: 요청.query.value,
                    path: 'postTitle'
                }
            }
        },
        {
            $sort: {
                _id: 1
            }
        },
        {
            $limit: 10
        }
    ]
    db.collection('post').aggregate(검색조건).toArray((err, res) => {
        console.log(res);
        응답.render('board', {
            posts: res,
            user: 요청.user
        });
    })
});



//게시글 삭제

app.get('/delete/:id', function (요청, 응답) {

    var userId = 요청.user.userId
    var paramsId = parseInt(요청.params.id);

    db.collection('post').findOne({
        _id: paramsId
    }, function (에러, 결과) {

        var postWriter = 결과.writer;

        if (postWriter == userId) {
            db.collection('post').deleteOne({
                _id: paramsId,
                writer: userId
            }, function (에러, 결과) {

                응답.redirect('/board');
            });
        } else {
            응답.redirect('/deletefail');
        }
    });
});


//추천

app.get('/postrecom/:id', function (req, res) {

    req.params.id = parseInt(req.params.id);
    db.collection('post').updateOne({
        _id: req.params.id
    }, {
        $inc: {
            postRecom: 1
        }
    }, function (에러, 결과) {

        res.redirect('/boarddetail/' + req.params.id)
    })
});


//댓글

app.post('/comments/:id', (req, res) => {

    var theday = new Date();
    var utcNow = theday.getTime(); + (theday.getTimezoneOffset() + 60 * 1000); // 
    var koreaTimeDiff = 9 * 60 * 60 * 1000;
    var today = new Date(utcNow + koreaTimeDiff);

    var year = today.getFullYear();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);

    var hours = ('0' + today.getHours()).slice(-2);
    var minutes = ('0' + today.getMinutes()).slice(-2);
    var seconds = ('0' + today.getSeconds()).slice(-2);

    var dateString = year + '-' + month + '-' + day;
    var hourString = hours + ':' + minutes + ':' + seconds;

    var postId = parseInt(req.params.id);
    var userId = req.user.userId;
    var userComments = req.body.comments;

    db.collection('comments').insertOne({
        postId: postId,
        commentsWriter: userId,
        intext: userComments,
        commentsDate: dateString,
        commentsHours: hourString,
    }, function (에러, 결과) {
        db.collection('post').updateOne({
            _id: postId
        }, {
            $inc: {
                postComments: 1
            }
        }, function (err, res2) {
            res.redirect('/boarddetail/' + req.params.id)

        })
    });

});