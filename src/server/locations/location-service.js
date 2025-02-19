const fs = require('fs');

const { forEach } = require('redis/lib/commands');
const fetch = require('node-fetch');
var LocationJSON = require('./list/bangalore.json');
const {execSync} = require('child_process');
const regionMap = {"bangalore": "Karnataka"};
const sleep = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

 async function retrieve(url){
        return await fetch(url)
        .then(res => res.json()).catch(err => console.log('--fetch error--', err));
    }

class LocationService {
    static dedupe(LocationJSON) {
        LocationJSON.forEach((loc) => {
            let currLocality = loc.locality;
            let matchingLocalities = LocationJSON.filter(item=>item.locality.indexOf(currLocality)>=0);
            if (matchingLocalities.length < 2) {
                this.localityArr.push(loc);
            }
        });
        console.log('deduped...', this.localityArr);
        return this.localityArr;
    }
    static fetchAreaKey() {
        let locParam = escape('JP Nagar Phase 6');
        console.log('--locParam--', locParam);
        fetch("https://adsmanager-graph.facebook.com/v16.0/search?access_token=EAAL2g9xdQA0BO4eL7St4BNUCEWtZBo5do1kySUbGki7Uq61JYAHtXz0kXZB9JsonQprLRHkyti6emddZBwnCTsoKN8ImPDp6UtEZAcFx9OJLuI8pFfX2uR6Arsnqg7ojKRsulS2I79elcGsXMY5BghUbLkbkpY1rRSx6EijCL8R6PfoP7OBgJZBCVO5kgZC260ZAZBZAE5vo59sGZCaP5W&__cppo=1&__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__ad_account_id=850615988800340&__interactionsMetadata=%5B%5D&_app=ADS_MANAGER&_reqName=search%3Aadgeolocation&_reqSrc=AdsLocationSearchSource&bulk_upload=false&include_headers=false&limit=10&locale=en_GB&method=get&place_fallback=true&pretty=0&suppress_http_code=1&qs=['"+locParam+"']&type=adgeolocation&")
            .then(res => res.text())
            .then(text => {
                let response = JSON.parse(text);
                let areas = response.data;
                let areaMatches = areas.filter(area => area.primary_city == 'Bangalore');
                let areaMatch = {};
                console.log('--area--', areaMatches);
                if (areaMatches.length > 1) {
                    areaMatch = areaMatches[0];
                }
                console.log('--area match--', areaMatch.key);
             });
    }
    static async updateAreaKeys() {
        return new Promise(async (resolve) => {
            let existingLocData = fs.readFileSync(`${__dirname}/reach/bangalore.json`, 'utf8');
            existingLocData = JSON.parse(existingLocData);
            
            let count = 0;
            let len = 6;
            let parseCount = 0;
            let formattedArr = new Array();
            let urls = new Array();
            for(let i=0;i<this.localityArr.length - 1;i++) {
                let loc= this.localityArr[i];
                let locParam = escape(loc.locality);

                //if locParam already in file json array, continue to avoid redundant call
                let processed = existingLocData.find(item => item.locality == loc.locality);
                console.log('--processed--', processed);
                if (processed) {
                    continue;
                }
                console.log('--locParam--', locParam);
                urls[i] = "https://adsmanager-graph.facebook.com/v16.0/search?access_token=EAAL2g9xdQA0BO4eL7St4BNUCEWtZBo5do1kySUbGki7Uq61JYAHtXz0kXZB9JsonQprLRHkyti6emddZBwnCTsoKN8ImPDp6UtEZAcFx9OJLuI8pFfX2uR6Arsnqg7ojKRsulS2I79elcGsXMY5BghUbLkbkpY1rRSx6EijCL8R6PfoP7OBgJZBCVO5kgZC260ZAZBZAE5vo59sGZCaP5W&__cppo=1&__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__ad_account_id=850615988800340&__interactionsMetadata=%5B%5D&_app=ADS_MANAGER&_reqName=search%3Aadgeolocation&_reqSrc=AdsLocationSearchSource&bulk_upload=false&include_headers=false&limit=10&locale=en_GB&method=get&place_fallback=true&pretty=0&suppress_http_code=1&qs=['"+locParam+"']&type=adgeolocation&";
                const responseData = await retrieve(urls[i]);
                count++;
                let areas = responseData.data;
                //console.log('--areaMatches--', areas);
                let areaMatches = [];
                areaMatches = areas && areas.length > 0 && areas.filter(area => area.region == regionMap['bangalore'] && area.key.length > 10);
                
                let areaMatch = {};
                //console.log('--area--', areaMatches);
                if (typeof areaMatches !== 'undefined' && areaMatches != null && areaMatches.length >= 1) {
                    areaMatch = areaMatches[0];
                    console.log('--area match--', areaMatch.key);
                    console.log('--count--', count);
                    this.localityArr[i].key = areaMatch.key;
                }
                
                formattedArr.push(this.localityArr[i]);
                execSync('sleep 0.5');
            };
            resolve(existingLocData.concat(formattedArr));
        });
    }
    static async updateAreaReach() {
        return new Promise(async (resolve) => {
            let existingLocData = fs.readFileSync(`${__dirname}/reach/bangalore_keys.json`, 'utf8');
            existingLocData = JSON.parse(existingLocData);

            //let existingReachData = fs.readFileSync(`${__dirname}/reach/bangalore_reach.json`, 'utf8');
            let existingReachData = [];
            
            let count = 0;
            let formattedArr = new Array();
            let urls = new Array();
            console.log('existingLocData.length: ', existingLocData.length);
            for(let i=0;i<existingLocData.length - 1;i++) {
                let loc= existingLocData[i];
                console.log('existingLocData[i]: ',  existingLocData[i]);
                if ('key' in loc) {
                    let key = escape(loc.key);
                    console.log('--i--', i);
                    console.log('--keyParam--', key);
                    urls[i] = 'https://adsmanager-graph.facebook.com/v17.0/act_850615988800340/reachestimate?access_token=EAAL2g9xdQA0BO4eL7St4BNUCEWtZBo5do1kySUbGki7Uq61JYAHtXz0kXZB9JsonQprLRHkyti6emddZBwnCTsoKN8ImPDp6UtEZAcFx9OJLuI8pFfX2uR6Arsnqg7ojKRsulS2I79elcGsXMY5BghUbLkbkpY1rRSx6EijCL8R6PfoP7OBgJZBCVO5kgZC260ZAZBZAE5vo59sGZCaP5W&__cppo=1&__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__ad_account_id=850615988800340&__interactionsMetadata=%5B%5D&_app=ADS_MANAGER&_reqName=adaccount%2Freachestimate&_reqSrc=AdsTargetingEstimatedReach.react&include_headers=false&locale=en_GB&method=get&pretty=0&suppress_http_code=1&xref=f113e52fdb2c454&&targeting_spec={"age_max":43,"age_min":18,"geo_locations":{"places":[{"key":"'+key+'","distance_unit":"kilometer","radius":2,"country":"IN"}],"location_types":["home"]},"flexible_spec":[{"interests":[{"id":"6003668857118","name":"Pizza (food %26 drink)"}]}]}';
                    const responseData = await retrieve(urls[i]);
                    count++;
                    if (responseData && responseData.data) {
                        let res = responseData.data;
                    }
                    //console.log('--reach--', responseData.data.users_lower_bound);
                    existingLocData[i].users_lower_bound = responseData && responseData.data && responseData.data.users_lower_bound || 0;
                    existingLocData[i].users_upper_bound = responseData && responseData.data && responseData.data.users_upper_bound || 0;
                    formattedArr.push(existingLocData[i]);
                    this.writeToFile(existingLocData[i]);
                    if (i > 0 && i % 40 == 0) {
                        execSync('sleep 180');
                    } else {
                        execSync('sleep 6');
                    }
                }
            };
            resolve(existingReachData.concat(formattedArr));
        });
    }
    static async geoCodeLocalities() {
        return new Promise(async (resolve) => {
            let existingLocData = fs.readFileSync(`${__dirname}/reach/bangalore_reach.json`, 'utf8');
            existingLocData = JSON.parse(existingLocData);

            let existingGeoCodeData = [];
            
            let count = 0;
            let formattedArr = new Array();
            let urls = new Array();
            for(let i=0;i<existingLocData.length - 1;i++) {
                let loc= existingLocData[i];
                if ('locality' in loc) {
                    let localityName = escape(loc.locality);
                    console.log('--i--', i);
                    console.log('--keyParam--', localityName);
                    urls[i] = 'https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBvSR-z-DPXEfccE9bwj-FdH1fbsQl60Qg&address='+localityName;
                    const responseData = await retrieve(urls[i]);
                    count++;
                    if (responseData && responseData.results && responseData.results.length > 1) {
                        existingLocData[i].lat = responseData.results[1].geometry.location.lat;
                        existingLocData[i].long = responseData.results[1].geometry.location.lng;
                        console.log('--lat--', responseData.results[1].geometry.location.lat);
                        console.log('--lng--', responseData.results[1].geometry.location.lng);
                        if (typeof responseData.results[1].place_id !== 'undefined' && responseData.results[1].place_id != null) {
                            existingLocData[i].placeId = responseData.results[1].place_id;
                        }
                        formattedArr.push(existingLocData[i]);
                        this.writeToFile(existingLocData[i]);
                    } else if (responseData && responseData.results && responseData.results.length == 1) {
                        existingLocData[i].lat = responseData.results[0].geometry.location.lat;
                        existingLocData[i].long = responseData.results[0].geometry.location.lng;
                        console.log('--lat--', responseData.results[0].geometry.location.lat);
                        console.log('--lng--', responseData.results[0].geometry.location.lng);
                        if (typeof responseData.results[0].place_id !== 'undefined' && responseData.results[0].place_id != null) {
                            existingLocData[i].placeId = responseData.results[0].place_id;
                        }
                        formattedArr.push(existingLocData[i]);
                        this.writeToFile(existingLocData[i]);
                    }
                    if (i > 0 && i % 40 == 0) {
                        execSync('sleep 180');
                    } else {
                        execSync('sleep 6');
                    }
                }
                execSync('sleep 6');
            };
            resolve(existingGeoCodeData.concat(formattedArr));
        });
    }
    static writeToFile(arr) {
        fs.appendFile(`${__dirname}/reach/bangalore_geocode.json`, JSON.stringify(arr)+',', function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("--File written!!");
        }); 
    }
    static async fetchLocalities() {
        console.log('--Before Dedupe--', LocationJSON.length);
        this.dedupe(LocationJSON);
        //this.writeToFile(this.localityArr);
        console.log('--After Dedupe--', this.localityArr.length);
        
        //let locArray = await this.updateAreaKeys();
        //this.writeToFile(locArray);
        //console.log('--Keys Updated--');

        //let locReachArray = await this.updateAreaReach();
        //this.writeToFile(locReachArray);
        //console.log('--Reach Updated--');

        let locReachArray = await this.geoCodeLocalities();
        console.log('--Geocoding complete--');
        
        return this.localityArr;
    }
    static fetch(loc) {
        let existingLocData = fs.readFileSync(`${__dirname}/list/${loc}.json`, 'utf8');
        existingLocData = JSON.parse(existingLocData);
        existingLocData.sort((item1,item2)=> { 
            return item1.users_lower_bound - item2.users_lower_bound;
        });
        return existingLocData.reverse();
    }
    static async fetchNearByPlaces(loc) {
        const responseData = await retrieve('https://maps.googleapis.com/maps/api/place/textsearch/json?fields=formatted_address%2Cname%2Crating%2Copening_hours%2Cgeometry&query=pizza%20restaurant%20%25in%20'+escape(loc)+'&inputtype=textquery&key=%20AIzaSyBvSR-z-DPXEfccE9bwj-FdH1fbsQl60Qg');
        return responseData.results;
    }
}
LocationService.localityArr = [];
module.exports = LocationService;