const express = require("express");
const app = express();

//body-parserモジュールを読み込み初期化する
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
//HTTPリクエストのボディをjsonで扱えるようになる
app.use(bodyParser.json());

app.listen(8080, () => {
  console.log("サーバー起動中");
});

//POSTリクエストの作成
app.post("/", (req, res) => {
  //HTTPリクエストのボディを出力
  console.log(req.body);
  console.log("POSTリクエストを受け取りました");
  res.end();
});