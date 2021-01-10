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
    var query = 'SELECT * FROM COUNTRYPROFILE WHERE COUNTRY="";';
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
        db.query('SELECT DISTINCT(COUNTRY) FROM COUNTRYPROFILE ORDER BY COUNTRY ASC;', (err, countries) => {
            db.query('SELECT DISTINCT(continent) FROM COUNTRYPROFILE;', (err, continent) => {
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

        if (country == 'All_Countries'){
            COUNTRY = 'JOIN countryprofile c ON d.worldometer_id = c.worldometer_id';
            q_country = 'c.country as country, '
            g_country = ' , c.country  ORDER BY c.country ASC'
        }
        else if (country == 'None') {
            COUNTRY = '';
            q_country = ''
            g_country = ''
        }
        else{
            COUNTRY = 'JOIN countryprofile c ON d.worldometer_id = c.worldometer_id WHERE c.country="' + country + '"';
            q_country = 'c.country as country, '
            g_country = ' , c.country  ORDER BY c.country ASC'
        }

        if (cases == 'All_Cases'){
            if (country != 'None'){
                q_case = 'sum'
            }
            else{
                q_case = 'max'
            }
            q_cases = ', ' + q_case + '(d.confirmed) AS confirmed, ' + q_case + '(d.deaths) AS deaths, ' + q_case + '(d.recovered) AS recovered, ' + q_case + '(d.active) AS active, ' + q_case + '(d.new_cases) AS new_cases, ' + q_case + '(d.new_deaths) AS new_deaths, ' + q_case + '(d.new_recovered) AS new_recovered';
        }
        else if (cases == 'None') {
            q_cases = '';
        }
        else{
            if (country == 'None'){
                q_case = 'sum'
            }
            else{
                q_case = 'max'
            }
            q_cases = ', ' + q_case + '(d.' + cases + ') as ' + cases;
        }
        
        if (months == 'All_Months'){
            MONTHS = '';
        }
        else if (months != 'All_Months' && COUNTRY == ''){
            MONTHS = ' WHERE month(d.date)="' + months + '"';
        }
        else if (start_date != 'All_Months' && country != ''){
            MONTHS = ' AND month(d.date)="' + months + '"';
        }
        console.log("cases ", cases);
        console.log("country ", country);
        console.log("month ", months);

        var query = 'SELECT ' + q_country + ' month(d.date) AS month' + q_cases + ' FROM daily d ' + COUNTRY + MONTHS + ' GROUP BY month(d.date) ' + g_country + ';';

        db.query(query, (err, result) => {
            if (err) throw err;
            console.log(query);
            var res1 = {
                total_cases     :       "-",
                total_recovered :       "-",
                total_deaths    :       "-",
                active_cases    :       "-",
                new_cases       :       "-"
            }
            var query2 = 'SELECT * FROM COUNTRYPROFILE WHERE COUNTRY="";';
            db.query(query2, (err, result2) => {
                db.query('SELECT DISTINCT(COUNTRY) FROM COUNTRYPROFILE ORDER BY COUNTRY ASC;', (err, countries) => {
                    db.query('SELECT DISTINCT(continent) FROM COUNTRYPROFILE;', (err, continent) => {
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
            if (country == 'None'){
                q_case = 'sum';
                g_case = ' GROUP BY d.date ';
            }
            else{
                q_case = ''
                g_case = ''
            }
            q_cases = ', ' + q_case + '(d.confirmed) AS confirmed, ' + q_case + '(d.deaths) AS deaths, ' + q_case + '(d.recovered) AS recovered, ' + q_case + '(d.active) AS active, ' + q_case + '(d.new_cases) AS new_cases, ' + q_case + '(d.new_deaths) AS new_deaths, ' + q_case + '(d.new_recovered) AS new_recovered';
        }
        else if (cases == 'None') {
            q_cases = '';
            g_case = '';
        }
        else{
            if (country == 'None'){
                q_case = 'sum';
                g_case = ' GROUP BY d.date ';
            }
            else{
                q_case = '';
                g_case = '';
            }
            q_cases = ', ' + q_case + '(d.' + cases + ') as ' + cases;
        }

        if (country == 'All_Countries'){
            COUNTRY = 'JOIN countryprofile c ON d.worldometer_id = c.worldometer_id';
            q_country = 'c.country as country, '
            g_country = '  ORDER BY c.country ASC'
        }
        else if (country == 'None') {
            COUNTRY = '';
            q_country = ''
            g_country = ''
        }
        else{
            COUNTRY = 'JOIN countryprofile c ON d.worldometer_id = c.worldometer_id WHERE c.country="' + country + '"';
            q_country = 'c.country as country, '
            g_country = '  ORDER BY c.country ASC'
        }

        if(start_date && end_date && COUNTRY =='')
        {
            START = ' WHERE d.date between date("' + start_date + '") ';
            END   = 'and date("' + end_date + '")' ;
        }

        else if(start_date && end_date && COUNTRY !='')
        {
            START = ' AND d.date between date("' + start_date + '") '; 
            END   = 'and date("' + end_date + '")' ;
        }

        else if(start_date && !end_date && COUNTRY =='')
        {
            START = ' WHERE d.date between date("' + start_date + '")';
            END   = '';
        }

        else if(start_date && !end_date && COUNTRY !='')
        {
            START = ' AND d.date between date("' + start_date + '") '; 
            END   = '';
        }

        else if (!start_date && end_date && COUNTRY =='')
        {
            START = '';
            END   = ' WHERE d.date between date("' + end_date + '") ';
        }

        else if (!start_date && end_date && COUNTRY !='')
        {
            START = '';
            END   = ' AND d.date between date("' + end_date + '") ';
        }

        var query = 'SELECT ' + q_country + ' d.date AS date' + q_cases + ' FROM daily d ' + COUNTRY + START + END + g_case + g_country + ';';
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
            var query2 = 'SELECT * FROM COUNTRYPROFILE WHERE COUNTRY="";';
            db.query(query2, (err, result2) => {
                db.query('SELECT DISTINCT(COUNTRY) FROM COUNTRYPROFILE ORDER BY COUNTRY ASC;', (err, countries) => {
                    db.query('SELECT DISTINCT(continent) FROM COUNTRYPROFILE;', (err, continent) => {
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
        var query = 'SELECT * FROM COUNTRYPROFILE WHERE COUNTRY="";';
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
                    QUERY = 'SELECT SUM(w.total_cases) AS total_cases, SUM(w.total_recovered) AS total_recovered, SUM(w.total_deaths) AS total_deaths, SUM(w.active_cases) AS active_cases, SUM(w.new_cases) AS new_cases FROM WORLDOMETER w JOIN COUNTRYPROFILE c ON w.id = c.worldometer_id  GROUP BY c.CONTINENT;';
                }

                else
                {
                    if ( ((country_total != 'none')) && ((continent_total != 'All_Continent' && continent_total != 'none')) ) {
                        console.log("SPECIFIC");
                        COUNTRY   = ' WHERE c.country="' + country_total + '"';
                        CONTINENT = ' AND c.continent="' + continent_total + '"';
                    }
                    else if ( ((country_total == 'none')) && ((continent_total != 'All_Continent' && continent_total != 'none')) ){
                        console.log("SPECIFIC continent");
                        CONTINENT = ' WHERE c.continent="' + continent_total + '"';
                    }

                    QUERY = 'SELECT w.total_cases AS total_cases, w.total_recovered AS total_recovered, w.total_deaths AS total_deaths, w.active_cases AS active_cases, w.new_cases AS new_cases FROM WORLDOMETER w JOIN COUNTRYPROFILE c ON w.id = c.worldometer_id ' + COUNTRY + CONTINENT + ';';
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

                db.query('SELECT DISTINCT(continent) FROM COUNTRYPROFILE;', (err, continent) => {
                    db.query('SELECT DISTINCT(COUNTRY) FROM COUNTRYPROFILE ORDER BY COUNTRY ASC;', (err, countries) => {
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
