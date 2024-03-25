const { default: fetch, Headers } = require('node-fetch-cjs');
const querystring = require('querystring');

  // 施設番号の検索
  async function fetchHotelSearch(req, res) {

    const BASE_URL = "https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20170426";
    const totalPageCount = 4;

    try {
      let allResults = [];

      for(let page = 1; page <= totalPageCount; page++) {

    const params = {
      'format': "json",
      'elements': "",
      'responseType': 'large',
      'formatVersion': "2",
      'largeClassCode': "japan",
      'middleClassCode': "shizuoka", //都道府県 destinationページで選択されたもの
      'smallClassCode': "atami", //市区町村 destinationページで選択されたもの
      //'detailClassCode': "A", //駅、詳細地域 destinationページで選択されたもの
      'page': page,
      'hits': "30",
      'applicationId': "1073265773085603320"
    };

    console.log("fetchHotelSearch > params: \n", params);

    //try {
      const queryString = querystring.stringify(params);
  
      const urlWithParams = await fetch(`${BASE_URL}?${queryString}`)
    
      const response = await urlWithParams.json()

      allResults = allResults.concat(response.hotels);

      //const classCode = response.hotels[0][2].hotelDetailInfo.hotelClassCode;
      /*
      const classCodes = response.hotels.map(hotel => {
        return hotel[2].hotelDetailInfo.hotelClassCode;
      });
      console.log(classCodes);
      */
      allResults.forEach(hotel => {
        console.log(hotel[2].hotelDetailInfo.hotelClassCode);
      });
      

      if (response.hotels.length < 30) {
        break;
      }
    }

      return allResults;

    } catch (error) {
      console.log(error)
    }
  }

  fetchHotelSearch();