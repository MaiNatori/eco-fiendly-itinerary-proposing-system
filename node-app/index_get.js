const express = require('express');
const path = require('path');
const { default: fetch } = require('node-fetch');
const { Headers } = require('node-fetch').default;
// const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACES_API_KEY = "AIzaSyD6UaRw_ME-1NiWguJurxiCUPq83Q0R6lI";

//expressのインスタンス化
const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

//8080番ポートでサーバーを待ちの状態にする。
//またサーバーが起動したことがわかるようにログを出力する
app.listen(8080, () => {
  console.log("サーバー起動中");
});

async function fetchRestaurantViaV2TextSearch() {

  const BASE_URL = "https://places.googleapis.com/v1/places:searchText";

  const requestHeader = new Headers({
      'Content-Type': 'application/json',
      'X-Goog-FieldMask': 'places.id',
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY
  });

  const requestBody = {
      textQuery: "SDGs 市ヶ谷 レストラン",
      languageCode: "ja",
      maxResultCount: 5,
      // includedType: "", 定義された指定タイプに一致する場所のみに結果を制限
      // strictTypeFiltering: boolean,
      // priceLevels: [], 価格帯 UNSPECIFIED/INEXPENSIVE/MODERATE/EXPENSIVE/VERY_EXPENSIVE
  };

  try {
      const rawResponse = await fetch(`${BASE_URL}`, {
          method: "POST",
          headers: requestHeader,
          body: JSON.stringify(requestBody)
      })

      const response = await rawResponse.json()
      
      return response;
  } catch (error) {
      console.log(error)
  }
};

app.get('/', async (req, res) => {
  try {
    res.render('spot.ejs');
  } catch (error) {
    console.log(error)
  }
});

app.get('/interface', async (req, res) => {
  try {
    const result = await fetchRestaurantViaV2TextSearch();
    const placesId = result.places.map(places => places.id);
    res.json( {places_id: placesId} );
  } catch (error) {
    console.log(error)
  }
})

app.post('/sendDetails', (req,res) => {
  const { name, formattedAddress, website, location } = req.body;
  console.log('received data:', { name, formattedAddress, website, location });
  res.render('spot', { name, formattedAddress, website });
});
