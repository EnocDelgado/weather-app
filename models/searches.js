const fs = require('fs')
const axios = require('axios')

class Searches {

    history = [];
    dbPath = './db/database.json';

    constructor(){
        this.readDB()
    }

    get capitalizedHistory(){

        return this.history.map( site => {
            // we split every letter of our words
            let words = site.split(' ');
            // we caoitalize the first letter and join with the other
            words = words.map( w => w[0].toUpperCase() + w.substring(1) );

            // we join every word by its space
            return words.join(' ')
        })
    }

    get paramsMapbox() {
        return {
            'language': 'en',
            'access_token': process.env.MAPBOX_KEY,
            // 'limit': 5
        }
    }

    get paramsWeather() {
        return {
            'access_token': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'en'
        }
    }

    async city( site = '') {

        try{
            // this is oour API petition
            const isntance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${site}.json`,
                params: this.paramsMapbox
            })
            const resp = await isntance.get()
            // returns the specific object that we want to obtain by map
            return resp.data.features.map( locality => ({
                id: locality.id,
                name: locality.place_name,
                lng: locality.center[0],
                lat: locality.center[1],
            }));

        } catch ( err ) {
            return [];
        }
    }

    async siteTime( lat, lon ){
        
        try{
            // intance axios.create()
            // const isntance = axios.create({
            //     baseURL: 'https://api.openweathermap.org/data/2.5/weather?',
            //     params: { ...this.paramsWeather, lat, lon }
            // })
            const resp = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${ lat }&lon=${ lon }&appid=6856acdc0f8562c01b3bae63ebf696f1&units=metric&lang=en`)

            // const resp = await isntance.get();
            const { weather, main } = resp.data;
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch( err ){
            console.log( err )
        }
    }

    addHistory( site = '' ){
        // Prevent duplicates
        if ( this.history.includes( site.toLocaleLowerCase() ) ){
            return
        }
        // display the last 6 elemnts in our history
        this.history = this.history.slice(0,5);
        // add the element at the begining
        this.history.unshift( site );
        // calling the method
        this.saveDB();
    }

    saveDB() {
        // if we have ore properties
        const payload = {
            history: this.history
        }
        // create the file
        fs.writeFileSync( this.dbPath, JSON.stringify( payload) );
    }

    readDB() {
        // validate if exist
        if ( fs.existsSync( this.dbPath ) ) return;

        const info = fs.readFileSync( this.dbPath, { encoding: 'utf-8' } );
        const data = JSON.parse( info );

        this.history = data.history
    }

}

module.exports = Searches;