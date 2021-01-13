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
    var world_pre_query = new Date().getTime();
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
        db.query('SELECT sum(total_cases) as total_cases, sum(total_recovered) as total_recovered, sum(total_deaths) as total_deaths, sum(total_tests) as total_tests FROM WORLDOMETER', (err, overviewTotal) => {
            var totalcases = 0;
            var totalrecovered = 0;
            var totaldeaths = 0;
            var totaltests = 0;
            var overview = {};
            if(overviewTotal.length != 0){
                var i=1;
                overviewTotal.forEach(function(data) {
                    //console.log(data);

                    totalcases += data.total_cases;
                    totalrecovered += data.total_recovered;
                    totaldeaths += data.total_deaths;
                    totaltests += data.total_tests;
                })
            }

            overview = {
                total_cases     :       totalcases,
                total_recovered :       totalrecovered,
                total_deaths    :       totaldeaths,
                total_tests     :       totaltests,
            }
            var world_post_query = new Date().getTime();
            var world_duration = (world_post_query - world_pre_query) / 1000;
            console.log('world', world_duration)
            // db.query('SELECT DISTINCT(WHO_REGION) FROM COUNTRYPROFILE ORDER BY WHO_REGION ASC;', (err, regions) => {
                db.query('SELECT DISTINCT(COUNTRY) FROM COUNTRYPROFILE ORDER BY COUNTRY ASC;', (err, countries) => {
                    // db.query('SELECT DISTINCT(continent) FROM COUNTRYPROFILE;', (err, continent) => {
                        if (err) throw err;
                        res.render('index2.ejs', {title:'Home', userData1: result, userData2: result, userData4: result, userData3: result, country: countries, overviewTotal: overview});
                    // });
                }); 
            // }); 
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
    var date = req.body.date;

    if(date == ''){
        date = 'None';
    }

    var region = req.body.region;

    var continent_total = req.body.continent_total;
    var country_total = req.body.country_total;

    var radio_option = req.body.inlineRadioOptions;

    if( (!radio_option) && (country) ){
        var query2 = 'SELECT * FROM COUNTRYPROFILE WHERE COUNTRY="";';
            db.query(query2, (err, result2) => {
                db.query('SELECT sum(total_cases) as total_cases, sum(total_recovered) as total_recovered, sum(total_deaths) as total_deaths, sum(total_tests) as total_tests FROM WORLDOMETER', (err, overviewTotal) => {
                    var totalcases = 0;
                    var totalrecovered = 0;
                    var totaldeaths = 0;
                    var totaltests = 0;
                    var overview = {};
                    if(overviewTotal.length != 0){
                        var i=1;
                        overviewTotal.forEach(function(data) {
                            //console.log(data);

                            totalcases += data.total_cases;
                            totalrecovered += data.total_recovered;
                            totaldeaths += data.total_deaths;
                            totaltests += data.total_tests;
                        })
                    }

                    overview = {
                        total_cases     :       totalcases,
                        total_recovered :       totalrecovered,
                        total_deaths    :       totaldeaths,
                        total_tests     :       totaltests,
                    }
                    // db.query('SELECT DISTINCT(WHO_REGION) FROM COUNTRYPROFILE ORDER BY WHO_REGION ASC;', (err, regions) => {
                        db.query('SELECT DISTINCT(COUNTRY) FROM COUNTRYPROFILE ORDER BY COUNTRY ASC;', (err, countries) => {
                            // db.query('SELECT DISTINCT(continent) FROM COUNTRYPROFILE;', (err, continent) => {
                                if (err) throw err;
                                
                                // calculate the duration in seconds
                                var post_query = new Date().getTime();
                                var duration = (post_query - pre_query) / 1000;
                                console.log(duration)
                                
                                res.render('index2.ejs', {title:'Home', userData1: result2, userData2: result2, userData4:result2, userData3: result2, country: countries, overviewTotal: overview});
                            // });
                        })
                    // });
                })
            })
    }

    // total case report per country
    else if( (radio_option == 'option1') && (country) ){
        console.log("total case report per country");
        var q_cases;
        var MONTHS;
        var COUNTRY;

        if (country == 'All_Countries'){
            COUNTRY = '';
        }
        else if (country == 'None') {
            COUNTRY = '';
        }
        else{
            COUNTRY = ' AND W.COUNTRY="' + country + '" ';
        }

        console.log("cases ", cases);
        console.log("country ", country);
        console.log("month ", months);

        // var query = 'SELECT ' + q_country + ' month(d.date) AS month' + q_cases + ' FROM daily d ' + COUNTRY + MONTHS + ' GROUP BY month(d.date) ' + g_country + ';';
        if (country == 'None') {
            var query = 'SELECT * FROM COUNTRYPROFILE WHERE COUNTRY="";'
        } 
        else{
            var query = 'SELECT w.country as country, w.total_cases as total_cases, d.deaths as deaths, d.recovered as recovered, d.active as active FROM WORLDOMETER W JOIN DAILY D ON W.COUNTRY = D.COUNTRY WHERE MONTH(D.DATE) = 7 AND DAY(D.DATE) = 27 ' + COUNTRY + ';'
        }
        
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
                db.query('SELECT sum(total_cases) as total_cases, sum(total_recovered) as total_recovered, sum(total_deaths) as total_deaths, sum(total_tests) as total_tests FROM WORLDOMETER', (err, overviewTotal) => {
                    var totalcases = 0;
                    var totalrecovered = 0;
                    var totaldeaths = 0;
                    var totaltests = 0;
                    var overview = {};
                    if(overviewTotal.length != 0){
                        var i=1;
                        overviewTotal.forEach(function(data) {
                            //console.log(data);

                            totalcases += data.total_cases;
                            totalrecovered += data.total_recovered;
                            totaldeaths += data.total_deaths;
                            totaltests += data.total_tests;
                        })
                    }

                    overview = {
                        total_cases     :       totalcases,
                        total_recovered :       totalrecovered,
                        total_deaths    :       totaldeaths,
                        total_tests     :       totaltests,
                    }
                    // db.query('SELECT DISTINCT(WHO_REGION) FROM COUNTRYPROFILE ORDER BY WHO_REGION ASC;', (err, regions) => {
                        db.query('SELECT DISTINCT(COUNTRY) FROM COUNTRYPROFILE ORDER BY COUNTRY ASC;', (err, countries) => {
                            // db.query('SELECT DISTINCT(continent) FROM COUNTRYPROFILE;', (err, continent) => {
                                if (err) throw err;
                                
                                // calculate the duration in seconds
                                var post_query = new Date().getTime();
                                var duration = (post_query - pre_query) / 1000;
                                console.log(duration)
                                
                                res.render('index2.ejs', {title:'Home', userData1: result, userData2: result2, userData4:result2, userData3: result2, country: countries, overviewTotal: overview});
                            // });
                        })
                    // });
                })
            })
        });
    }//end of total case report per country
    
    // recent week report
     if ( (radio_option == 'option2') && (country) ) {
        console.log("week report");
        // var q_cases;
        var COUNTRY;
        var START;
        var END;

        if (country == 'All_Countries'){
            COUNTRY = '';
        }
        else if (country == 'None') {
            COUNTRY = '';
        }
        else{
            COUNTRY = ' AND C.COUNTRY="' + country + '" ';
        }

        // var query = 'SELECT ' + q_country + ' d.date AS date' + q_cases + ' FROM daily d ' + COUNTRY + START + END + g_case + g_country + ';';
        if (country == 'None') {
            var query = 'SELECT * FROM COUNTRYPROFILE WHERE COUNTRY="";'
        } 
        else{
            var query = 'SELECT C.COUNTRY AS country, MAX(D.CONFIRMED) AS confirmed, MAX(D.DEATHS) AS deaths, MAX(D.RECOVERED) AS recovered, MAX(D.ACTIVE) AS active, SUM(D.NEW_CASES)AS new_cases, SUM(D.NEW_DEATHS)AS new_deaths, SUM(D.NEW_RECOVERED) AS new_recovered, MAX(C.CONFIRMED_LAST_WEEK) AS confirmed_last_week, MAX(C.WEEK_INCREASE) AS week_increase_percentage FROM DAILY D JOIN COUNTRYWISE C ON D.COUNTRY = C.COUNTRY WHERE MONTH(D.DATE) = 7 AND DAY(D.DATE) BETWEEN 21 AND 27 ' + COUNTRY + ' GROUP BY C.COUNTRY;'
        }
        console.log(query);
        console.log('query length', query.length)
        
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
            // console.log(result[0].date);

            // console.log(result);
            // var res1 = {
            //     total_cases     :       "-",
            //     total_recovered :       "-",
            //     total_deaths    :       "-",
            //     active_cases    :       "-",
            //     new_cases       :       "-"
            // }
            var query2 = 'SELECT * FROM COUNTRYPROFILE WHERE COUNTRY="";';
            db.query(query2, (err, result2) => {
                db.query('SELECT sum(total_cases) as total_cases, sum(total_recovered) as total_recovered, sum(total_deaths) as total_deaths, sum(total_tests) as total_tests FROM WORLDOMETER', (err, overviewTotal) => {
                    var totalcases = 0;
                    var totalrecovered = 0;
                    var totaldeaths = 0;
                    var totaltests = 0;
                    var overview = {};
                    if(overviewTotal.length != 0){
                        var i=1;
                        overviewTotal.forEach(function(data) {
                            //console.log(data);

                            totalcases += data.total_cases;
                            totalrecovered += data.total_recovered;
                            totaldeaths += data.total_deaths;
                            totaltests += data.total_tests;
                        })
                    }

                    overview = {
                        total_cases     :       totalcases,
                        total_recovered :       totalrecovered,
                        total_deaths    :       totaldeaths,
                        total_tests     :       totaltests,
                    }
                    // db.query('SELECT DISTINCT(WHO_REGION) FROM COUNTRYPROFILE ORDER BY WHO_REGION ASC;', (err, regions) => {
                        db.query('SELECT DISTINCT(COUNTRY) FROM COUNTRYPROFILE ORDER BY COUNTRY ASC;', (err, countries) => {
                            // db.query('SELECT DISTINCT(continent) FROM COUNTRYPROFILE;', (err, continent) => {
                                if (err) throw err;
                                
                                // calculate the duration in seconds
                                var post_query = new Date().getTime();
                                var duration = (post_query - pre_query) / 1000;
                                console.log(duration)
                                
                                res.render('index2.ejs', {title:'Home', userData1: result2, userData2: result, userData4:result2, userData3: result2, country: countries, overviewTotal: overview});
                            // });
                        })
                    // });
                });
            })
        });
    }// end of recent week report

    // In-Depth report on confirmed cases by WHO Region
    else if (region){
        console.log("WHO Region");
        var REGION;
        var r_date;

        if (region == 'All_Regions'){
            REGION = '';
            r_date = ' WHERE D.DATE = "' + date + '"';
        }
        else if (region == 'None') {
            REGION = '';
        }
        else{
            REGION = ' WHERE P.WHO_REGION="' + region + '" ';
            r_date = ' AND D.DATE = "' + date + '"';
        }

        if (date == 'None'){
            r_date = '';
        }

        if (region == 'None' || r_date == '') {
            var query = 'SELECT * FROM COUNTRYPROFILE WHERE COUNTRY="";'
        } 
        else{
            var query = 'SELECT D.COUNTRY AS COUNTRY, P.POPULATION AS POPULATION, D.CONFIRMED AS CONFIRMED_TODAY, D.CONFIRMED AS OVERALL_COUNTRY, (D.CONFIRMED / W.TOTAL_CASES * 100) AS TODAY_VS_OVERALL, (D.CONFIRMED / P.POPULATION * 100) AS TODAY_VS_POPULATION FROM WORLDOMETER W JOIN COUNTRYPROFILE P ON W.COUNTRY = P.COUNTRY JOIN    COUNTRYWISE C ON W.COUNTRY = C.COUNTRY JOIN    DAILY D ON C.COUNTRY = D.COUNTRY ' + REGION + r_date + ' ;'
        }
        console.log(query);
        console.log('query length', query.length)
        
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
            var query2 = 'SELECT * FROM COUNTRYPROFILE WHERE COUNTRY="";';
            db.query(query2, (err, result2) => {
                db.query('SELECT sum(total_cases) as total_cases, sum(total_recovered) as total_recovered, sum(total_deaths) as total_deaths, sum(total_tests) as total_tests FROM WORLDOMETER', (err, overviewTotal) => {
                    var totalcases = 0;
                    var totalrecovered = 0;
                    var totaldeaths = 0;
                    var totaltests = 0;
                    var overview = {};
                    if(overviewTotal.length != 0){
                        var i=1;
                        overviewTotal.forEach(function(data) {
                            //console.log(data);

                            totalcases += data.total_cases;
                            totalrecovered += data.total_recovered;
                            totaldeaths += data.total_deaths;
                            totaltests += data.total_tests;
                        })
                    }

                    overview = {
                        total_cases     :       totalcases,
                        total_recovered :       totalrecovered,
                        total_deaths    :       totaldeaths,
                        total_tests     :       totaltests,
                    }
                    // db.query('SELECT DISTINCT(WHO_REGION) FROM COUNTRYPROFILE ORDER BY WHO_REGION ASC;', (err, regions) => {
                        db.query('SELECT DISTINCT(COUNTRY) FROM COUNTRYPROFILE ORDER BY COUNTRY ASC;', (err, countries) => {
                            // db.query('SELECT DISTINCT(continent) FROM COUNTRYPROFILE;', (err, continent) => {
                                if (err) throw err;
                                
                                // calculate the duration in seconds
                                var post_query = new Date().getTime();
                                var duration = (post_query - pre_query) / 1000;
                                console.log(duration)
                                
                                res.render('index2.ejs', {title:'Home', userData1: result2, userData2: result2, userData4:result2, userData3: result, country: countries, overviewTotal: overview});
                            // });
                        })
                    // });
                });
            })
        });
    }// end of In-Depth report on confirmed cases by WHO Region

    // total cases per continent
    else if ( (!cases && !country && !months) && ((!start_date && !end_date)) && (continent_total) ) {
        console.log("Total");
        var query = 'SELECT * FROM COUNTRYPROFILE WHERE COUNTRY="";';
        db.query(query, (err, result) => {
            if (err) throw err;

            var CONTINENT = '';
            var QUERY = '';
            var NONE;

            if (continent_total == 'none')
            {
                NONE = true;
            }

            else {
                if ( (continent_total == 'All_Continent') )
                {
                    QUERY = 'SELECT SUM(w.total_cases) AS total_cases, SUM(w.total_recovered) AS total_recovered, SUM(w.total_deaths) AS total_deaths, SUM(w.active_cases) AS active_cases, SUM(w.new_cases) AS new_cases FROM WORLDOMETER w;';
                }

                else
                {
                    QUERY = 'SELECT c.country, w.total_cases, w.total_recovered, w.total_deaths, w.total_tests FROM WORLDOMETER w JOIN COUNTRYPROFILE c ON C.COUNTRY = W.COUNTRY WHERE c.continent="' + continent_total + '";';
                }
            }
            if(NONE){
                QUERY = 'SELECT * FROM COUNTRYPROFILE WHERE COUNTRY = "";';
            }
            console.log(QUERY);

            db.query(QUERY, (err, RESULTone) => {
                console.log(RESULTone);
                db.query('SELECT sum(total_cases) as total_cases, sum(total_recovered) as total_recovered, sum(total_deaths) as total_deaths, sum(total_tests) as total_tests FROM WORLDOMETER', (err, overviewTotal) => {
                    var overviewcases = 0;
                    var overviewrecovered = 0;
                    var overviewdeaths = 0;
                    var overviewtests = 0;
                    var overview = {};
                    if(overviewTotal.length != 0){
                        var i=1;
                        overviewTotal.forEach(function(data) {
                            //console.log(data);

                            overviewcases += data.total_cases;
                            overviewrecovered += data.total_recovered;
                            overviewdeaths += data.total_deaths;
                            overviewtests += data.total_tests;
                        })
                    }

                    overview = {
                        total_cases     :       overviewcases,
                        total_recovered :       overviewrecovered,
                        total_deaths    :       overviewdeaths,
                        total_tests     :       overviewtests,
                    }
                    // db.query('SELECT DISTINCT(WHO_REGION) FROM COUNTRYPROFILE ORDER BY WHO_REGION ASC;', (err, regions) => {
                        // db.query('SELECT DISTINCT(continent) FROM COUNTRYPROFILE;', (err, continent) => {
                            db.query('SELECT DISTINCT(COUNTRY) FROM COUNTRYPROFILE ORDER BY COUNTRY ASC;', (err, countries) => {
                                if (err) throw err;
                                
                                // calculate the duration in seconds
                                var post_query = new Date().getTime();
                                var duration = (post_query - pre_query) / 1000;
                                console.log(duration)
                                
                                res.render('index2.ejs', {title:'Home', userData1: result, userData2: result, userData4: RESULTone, userData3: result, country: countries, overviewTotal: overview});
                            });
                        // })
                    // });
                });
            })

        })
    }//end of total cases per continent
    
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
