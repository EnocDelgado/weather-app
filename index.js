require('dotenv').config()

const { readInput, pause, inquirerMenu, siteList } = require("./helpers/inquirer");
const Searches = require("./models/searches");

const main = async() => {

    const searches = new Searches();
    let opt = '';

    do{
        opt =await inquirerMenu();

        switch( opt ){
            case 1:
                // display message
                const keyWord = await readInput("City: ");
                // search sites
                const sites = await searches.city( keyWord );
                // select the site
                const id = await siteList( sites )
                if ( id === 0 ) continue;
                const siteSelected = sites.find( s => s.id === id );
                // Save DB
                searches.addHistory( siteSelected.name );
                // weather
                const weather = await searches.siteTime( siteSelected.lat, siteSelected.lng );

                // display results
                console.log("\nCity information\n".cyan);
                console.log("City:", siteSelected.name.cyan);
                console.log("Lat:", siteSelected.lat);
                console.log("Lng:", siteSelected.lng);
                console.log("Temperature:", weather.temp);
                console.log("Min:", weather.min);
                console.log("Max:", weather.max);
                console.log("The weather seems:", weather.desc.cyan)
            break

            case 2:
                // display history
                searches.capitalizedHistory.forEach( (site, i) => {
                    const id = `${ i + 1 }.`.cyan;
                    console.log(` ${ id } ${ site } `);
                })
            break

        }

       if ( opt !== 0 ) await pause();

    } while( opt !== 0 )


}

main()