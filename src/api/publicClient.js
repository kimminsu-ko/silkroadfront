import axios from 'axios';

const publicApi = axios.create({
    baseURL : '',
    timeout : 5000,
    withCredentials : false
})

export default publicApi;