//expressモジュールの読み込み
const express = require('express');
const fetch = require('node-fetch');
const fetchRestaurantViaV2TextSearch = require('./api/fetch-esm.js');
// const GOOGLE_PLACES_API_KEY = "AIzaSyD6UaRw_ME-1NiWguJurxiCUPq83Q0R6lI";

//expressのインスタンス化
const app = express();

//8080番ポートでサーバーを待ちの状態にする。
//またサーバーが起動したことがわかるようにログを出力する
app.listen(8080, () => {
  console.log("サーバー起動中");
});

//GETリクエストの設定
//'/get'でアクセスされた時に、JSONとログを出力するようにする
app.get('/searchText', (req, res) => {
  console.log('GETリクエストを受け取りました');
  fetchRestaurantViaV2TextSearch();
  res.end();
/*
  const BASE_URL = "https://places.googleapis.com/v1/places:searchText"

  const requestBody = {
    textQuery: "市ヶ谷周辺のレストラン",
    languageCode: "ja",
    maxResultCount: 20,
    // includedType: "", 定義された指定タイプに一致する場所のみに結果を制限
    // strictTypeFiltering: boolean,
    // priceLevels: [], 価格帯 UNSPECIFIED/INEXPENSIVE/MODERATE/EXPENSIVE/VERY_EXPENSIVE
  }

  const options = {
    host: "places.googleapis.com",
    port: 80,
    path: "/v1/places:searchText",
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-FieldMask': 'places.id',
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY
    },
    body: JSON.stringify(requestBody)
  };


  try {

    http.request(options, (res) => {
      console.log(res.json());
    });
    
  } catch (error) {
    console.log(error)
  }
*/

  console.log('place_idを取得しました');

  res.end();
});