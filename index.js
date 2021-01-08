// IMPORT
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { start } = require('repl');

const buffer = fs.readFileSync('countries_and_continents.json');
const countriesAndContinents = JSON.parse(buffer);

//Create connection
const db = mysql.createConnection({
    host        :   'localhost',
    user        :   'root',
    password    :   'p@ssword',
    port        :   '3306',
    database    :   'covid_db'
});

//Connect
db.connect((err) => {
    if(err){
        throw err;
    }
    else{
        console.log('mySQL connected!');
    }
});

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true})) 
app.use(bodyParser.json()) 

//note: all of this routes will be done like how its done for the node-SQL sample code given

app.get('/', (req, res) => {
    // var query = 'SELECT country, MONTH(DAILY.DATE) AS month, max(confirmed) AS confirmed, max(deaths) AS deaths, max(recovered) AS recovered, max(active) AS active, max(new_cases) AS new_cases, max(new_deaths) AS new_deaths, max(new_recovered) AS new_recovered  FROM DAILY GROUP BY month(DAILY.DATE), country;';
    var query = 'SELECT * FROM DAILY WHERE COUNTRY="";';
    db.query(query, (err, result) => {
        console.log(result);
        if (err) throw err;
        console.log('Data received from covid_db database:');
        // console.log(result);
        var res1 = {
            total_cases     :       "-",
            total_recovered :       "-",
            total_deaths    :       "-",
            active_cases    :       "-",
            new_cases       :       "-"
        }
        db.query('SELECT DISTINCT(COUNTRY) FROM DAILY;', (err, countries) => {
            db.query('SELECT DISTINCT(continent) FROM WORLDOMETER;', (err, continent) => {
                if (err) throw err;
                res.render('index.ejs', {title:'Home', userData1: result, userData2: result, oneData: res1, country: countries, continent: continent});
            });
        }); 
    });
})

app.post('/', (req, res) => {
    // get timestamp before running the query
    var pre_query = new Date().getTime();

    console.log("called...");
    console.log(req.body);
    var cases = req.body.cases_table;
    var country = req.body.country_table;
    var months = req.body.months;

    var start_date = req.body.start_date;
    var end_date = req.body.end_date;

    var continent_total = req.body.continent_total;
    var country_total = req.body.country_total;

    if( (cases && country && months) && (!start_date && !end_date) && (!country_total && !continent_total) ){
        console.log("monthly");
        var q_cases;
        var MONTHS;
        var COUNTRY;
        if (cases == 'All_Cases'){
            q_cases = ', max(confirmed) AS confirmed, max(deaths) AS deaths, max(recovered) AS recovered, max(active) AS active, max(new_cases) AS new_cases, max(new_deaths) AS new_deaths, max(new_recovered) AS new_recovered';
        }
        else if (cases == 'None') {
            q_cases = '';
        }
        else{
            q_cases = ', max(' + cases + ') as ' + cases;
        }

        if (country == 'All_Countries'){
            COUNTRY = '';
        }
        else if (country == 'None') {
            COUNTRY = ' WHERE country=""';
        }
        else{
            COUNTRY = ' WHERE country="' + country + '"';
        }
        
        if (months == 'All_Months'){
            MONTHS = '';
        }
        else if (months != 'All_Months' && COUNTRY == ''){
            MONTHS = ' WHERE month(daily.date)="' + months + '"';
        }
        else if (start_date != 'All_Months' && country != ''){
            MONTHS = ' AND month(daily.date)="' + months + '"';
        }
        console.log("cases ", cases);
        console.log("country ", country);
        console.log("month ", months);

        var query = 'SELECT country, month(daily.date) AS month' + q_cases + ' FROM DAILY' + COUNTRY + MONTHS + ' GROUP BY month(daily.date), country;';

        db.query(query, (err, result) => {
            if (err) throw err;
            console.log('success');
            var res1 = {
                total_cases     :       "-",
                total_recovered :       "-",
                total_deaths    :       "-",
                active_cases    :       "-",
                new_cases       :       "-"
            }
            var query2 = 'SELECT * FROM DAILY WHERE COUNTRY="";';
            db.query(query2, (err, result2) => {
                db.query('SELECT DISTINCT(COUNTRY) FROM DAILY;', (err, countries) => {
                    db.query('SELECT DISTINCT(continent) FROM WORLDOMETER;', (err, continent) => {
                        if (err) throw err;
                        
                        // calculate the duration in seconds
                        var post_query = new Date().getTime();
                        var duration = (post_query - pre_query) / 1000;
                        console.log(duration)
                        
                        res.render('index.ejs', {title:'Home', userData1: result, userData2: result2, oneData:res1, country: countries, continent: continent});
                    });
                })
            })
        });
    }
    
    else if ( (cases && country && !months) && ( (start_date && end_date) || (start_date && !end_date) || (!start_date && end_date) ) && (!country_total && !continent_total) ) {
        console.log("daily");
        var q_cases;
        var COUNTRY;
        var START;
        var END;

        if (cases == 'All_Cases'){
            q_cases = ', confirmed, deaths, recovered, active, new_cases, new_deaths, new_recovered';
        }
        else if (cases == 'None') {
            q_cases = '';
        }
        else{
            q_cases = ', '+ cases + '';
        }
        
        if (country == 'All_Countries'){
            COUNTRY = '';
        }
        else if (country == 'None') {
            COUNTRY = ' WHERE country=""';
        }
        else{
            COUNTRY = ' WHERE country="' + country + '"';
        }

        if(start_date && end_date && COUNTRY =='')
        {
            START = ' WHERE daily.date between date("' + start_date + '") ';
            END   = 'and date("' + end_date + '")' ;
        }

        else if(start_date && end_date && COUNTRY !='')
        {
            START = ' AND daily.date between date("' + start_date + '") '; 
            END   = 'and date("' + end_date + '")' ;
        }

        else if(start_date && !end_date && COUNTRY =='')
        {
            START = ' WHERE daily.date between date("' + start_date + '")';
            END   = '';
        }

        else if(start_date && !end_date && COUNTRY !='')
        {
            START = ' AND daily.date between date("' + start_date + '") '; 
            END   = '';
        }

        else if (!start_date && end_date && COUNTRY =='')
        {
            START = '';
            END   = ' WHERE daily.date between date("' + end_date + '") ';
        }

        else if (!start_date && end_date && COUNTRY !='')
        {
            START = '';
            END   = ' AND daily.date between date("' + end_date + '") ';
        }

        var query = 'SELECT country, daily.date AS date' + q_cases + ' FROM DAILY' + COUNTRY + START + END + ';';
        console.log(query);
        db.query(query, (err, result) => {
            if (err) throw err;

            var date;
            var newDate;
            var timestampInSeconds;
            for (var i = 0; i < result.length; i++)
            {
                timestampInSeconds = Math.floor(result[i].date/1000);
                date = new Date(timestampInSeconds*1000);
                // day
                let day = ("0" + date.getDate()).slice(-2);

                // month
                let month = ("0" + (date.getMonth() + 1)).slice(-2);

                // year
                let year = date.getFullYear();
                
                newDate = year + "-" + month + "-" + day;
                result[i].date = newDate;
            }
            console.log(result[0].date);

            console.log(result);
            var res1 = {
                total_cases     :       "-",
                total_recovered :       "-",
                total_deaths    :       "-",
                active_cases    :       "-",
                new_cases       :       "-"
            }
            var query2 = 'SELECT * FROM DAILY WHERE COUNTRY="";';
            db.query(query2, (err, result2) => {
                db.query('SELECT DISTINCT(COUNTRY) FROM DAILY;', (err, countries) => {
                    db.query('SELECT DISTINCT(continent) FROM WORLDOMETER;', (err, continent) => {
                        if (err) throw err;
                        
                        // calculate the duration in seconds
                        var post_query = new Date().getTime();
                        var duration = (post_query - pre_query) / 1000;
                        console.log(duration)
                        
                        res.render('index.ejs', {title:'Home', userData1: result2, userData2: result, oneData:res1, country: countries, continent: continent});
                    });
                })
            })
        });
    }

    else if ( (!cases && !country && !months) && ((!start_date && !end_date)) && (country_total && continent_total) ) {
        console.log("Total");
        var query = 'SELECT * FROM DAILY WHERE COUNTRY="";';
        db.query(query, (err, result) => {
            if (err) throw err;

            var COUNTRY = '';
            var CONTINENT = '';
            var QUERY = '';
            var NONE;

            if (continent_total == 'none' && country_total == 'none')
            {
                NONE = true;
            }

            else {
                if ( (continent_total == 'All_Continent') || (country_total == 'none' && continent_total == 'All_Continent') )
                {
                    QUERY = 'SELECT SUM(total_cases) AS total_cases, SUM(total_recovered) AS total_recovered, SUM(total_deaths) AS total_deaths, SUM(active_cases) AS active_cases, SUM(new_cases) AS new_cases FROM WORLDOMETER GROUP BY CONTINENT;';
                }

                else
                {
                    if ( ((country_total != 'none')) && ((continent_total != 'All_Continent' && continent_total != 'none')) ) {
                        console.log("SPECIFIC");
                        COUNTRY   = ' WHERE country="' + country_total + '"';
                        CONTINENT = ' AND continent="' + continent_total + '"';
                    }

                    QUERY = 'SELECT total_cases, total_recovered, total_deaths, active_cases, new_cases FROM WORLDOMETER ' + COUNTRY + CONTINENT + ';';
                }
            }

            console.log(QUERY);

            db.query(QUERY, (err, RESULT) => {
                //console.log(RESULT.length);
                var totalcases = 0;
                var totalrecovered = 0;
                var totaldeaths = 0;
                var activecases = 0;
                var newcases = 0;
                var TOTAL = {};

                if(NONE)
                {
                    TOTAL = {
                        total_cases     :       "-",
                        total_recovered :       "-",
                        total_deaths    :       "-",
                        active_cases    :       "-",
                        new_cases       :       "-"
                    }
                    // window.alert("Invalid Query! Resetting Queries");
                }
                else {
                    if(RESULT.length != 0){
                        var i=1;
                        RESULT.forEach(function(data) {
                            //console.log(data);
    
                            totalcases += data.total_cases;
                            totalrecovered += data.total_recovered;
                            totaldeaths += data.total_deaths;
                            activecases += data.active_cases;
                            newcases += data.new_cases;
                        })
                    }

                    TOTAL = {
                        total_cases     :       totalcases,
                        total_recovered :       totalrecovered,
                        total_deaths    :       totaldeaths,
                        active_cases    :       activecases,
                        new_cases       :       newcases
                    }
                }   

                db.query('SELECT DISTINCT(continent) FROM WORLDOMETER;', (err, continent) => {
                    db.query('SELECT DISTINCT(COUNTRY) FROM DAILY;', (err, countries) => {
                        if (err) throw err;
                        
                        // calculate the duration in seconds
                        var post_query = new Date().getTime();
                        var duration = (post_query - pre_query) / 1000;
                        console.log(duration)
                        
                        res.render('index.ejs', {title:'Home', userData1: result, userData2: result, oneData: TOTAL, country: countries, continent: continent});
                    });
                })
            })

        })
    }
    
})

app.get('/Countries', (req, res) => {
    if (req.query.continent != 'All_Continent'){
        if(req.query.continent) res.send(countriesAndContinents[req.query.continent].sort());
        else res.send('');
    }
})

app.get('/Continents', (req, res) => {
    res.send(Object.keys(countriesAndContinents).sort());
})

app.listen('2000', () => {
    console.log('listening to server at port 2000');
});
