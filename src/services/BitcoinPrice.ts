import axios from 'axios';

const priceApi = () => {
    const priceurl = "https://api.coindesk.com/v1/bpi/currentprice.json";
    return axios.get(priceurl);
}

export default priceApi;