const ss = require('express-session');

function initSession (){
    const middleware = ss ({
        secret: 'your_secret_key',
        resave: true,
        saveUninitialized: true,
        cookie: {
            secure: false, // HTTPSを使用
            httpOnly: true, // XSS攻撃を防ぐ
            sameSite: 'strict', // CSRF攻撃を防ぐ
            maxAge: 24 * 60 * 60 * 1000 // セッションの有効期限を設定(例：24時間)
        }
    });

    return middleware;

}

module.exports = { ss, initSession };