import 'dotenv/config'; // ./node_modules/dotenv
import fetch, {Headers} from 'node-fetch'; // ./node_modules/node-fetch
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY


export async function fetchRestaurantViaV2TextSearch() {
    const BASE_URL = "https://places.googleapis.com/v1/places:searchText"

    const requestHeader = new Headers({
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'places.id',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY
    })

    const requestBody = {
        textQuery: "市ヶ谷周辺のレストラン",
        languageCode: "ja",
        maxResultCount: 20,
        // includedType: "", 定義された指定タイプに一致する場所のみに結果を制限
        // strictTypeFiltering: boolean,
        // priceLevels: [], 価格帯 UNSPECIFIED/INEXPENSIVE/MODERATE/EXPENSIVE/VERY_EXPENSIVE
    }

    try {
        const rawResponse = await fetch(`${BASE_URL}`, {
            method: "POST",
            headers: requestHeader,
            body: JSON.stringify(requestBody)
        })

        const response = await rawResponse.json()

        console.log(response)
    } catch (error) {
        console.log(error)
    }
};