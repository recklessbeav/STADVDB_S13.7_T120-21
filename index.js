// IMPORT
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');


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
        if (err) throw err;
        console.log('Data received from covid_db database:');
        // console.log(result);
        var res1 = [{
            total_cases     :       "-",
            total_recovered :       "-",
            total_deaths    :       "-",
            active_cases    :       "-",
            new_cases       :       "-"
        }]
        db.query('SELECT DISTINCT(COUNTRY) FROM DAILY;', (err, countries) => {
            db.query('SELECT DISTINCT(continent) FROM WORLDOMETER;', (err, continent) => {
                if (err) throw err;
                res.render('index.ejs', {title:'Home', userData: result, oneData: res1, country: countries, continent: continent});
            });
        }); 
    });
})

app.post('/', (req, res) => {
    console.log("called...");
    console.log(req.body);
    var cases = req.body.cases_table;
    var country = req.body.country_table;
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var continent_total = req.body.continent_total;
    var country_total = req.body.country_total;

    if( (cases && country && start_date) && (!country_total && !continent_total) ){
        if (cases == 'All_Cases'){
            q_cases = ', max(confirmed) AS confirmed, max(deaths) AS deaths, max(recovered) AS recovered, max(active) AS active, max(new_cases) AS new_cases, max(new_deaths) AS new_deaths, max(new_recovered) AS new_recovered';
        }
        else if (cases == 'None') {
            q_cases = '';
        }
        else{
            var q_cases = ', max(' + cases + ') as ' + cases;
        }

        if (country == 'All_Countries'){
            country = '';
        }
        else if (country == 'None') {
            country = ' WHERE country=""';
        }
        else{
            country = ' WHERE country="' + country + '"';
        }
        
        if (start_date == 'All_Months'){
            months = '';
        }
        else if (start_date != 'All_Months' && country == ''){
            months = ' WHERE month(daily.date)="' + start_date + '"';
        }
        else if (start_date != 'All_Months' && country != ''){
            months = ' AND month(daily.date)="' + start_date + '"';
        }
        console.log("cases ", cases);
        console.log("country ", country);
        console.log("start_date ", start_date);
        console.log("end_date ", end_date);

        var query = 'SELECT country, month(daily.date) AS month' + q_cases + ' FROM DAILY' + country + months + ' GROUP BY month(daily.date), country;';

        db.query(query, (err, result) => {
            if (err) throw err;
            console.log('success');
            var res1 = [{
                total_cases     :       "-",
                total_recovered :       "-",
                total_deaths    :       "-",
                active_cases    :       "-",
                new_cases       :       "-"
            }]
            db.query('SELECT DISTINCT(COUNTRY) FROM DAILY;', (err, countries) => {
                db.query('SELECT DISTINCT(continent) FROM WORLDOMETER;', (err, continent) => {
                    if (err) throw err;
                    res.render('index.ejs', {title:'Home', userData: result, oneData:res1, country: countries, continent: continent});
                });
            })
        });
    } 
    else if ( (!cases && !country && !start_date) && (country_total && continent_total) ) {
        // var query = 'SELECT country, MONTH(DAILY.DATE) AS month, max(confirmed) AS confirmed, max(deaths) AS deaths, max(recovered) AS recovered, max(active) AS active, max(new_cases) AS new_cases, max(new_deaths) AS new_deaths, max(new_recovered) AS new_recovered  FROM DAILY GROUP BY month(DAILY.DATE), country;';
        var query = 'SELECT * FROM DAILY WHERE COUNTRY="";';
        db.query(query, (err, result) => {
            if (err) throw err;

            var COUNTRY = '';
            var CONTINENT = '';
            var QUERY;
            if (country_total == 'All_Countries' && continent_total == 'none')
            {
                console.log('ALL COUNTRIES');
                COUNTRY = '';
            }
            else if (continent_total == 'none') {
                console.log('NOT ALL COUNTRIES')
                COUNTRY = ' WHERE country="' + country_total + '"';
            }

            if (country_total == 'none' && continent_total == 'All_Continent')
            {
                console.log('ALL CONTINENTS')
                CONTINENT = '';
            }
            else if (country_total == 'none') {
                console.log('NOT ALL CONTINENTS')
                CONTINENT = ' WHERE continent="' + continent_total + '"';
            }

            // if (country_total !== 'All_Countries' && continent_total !== 'All_Continent' && country_total !== 'none' && continent_total !== 'none')
            // {
            //     COUNTRY = ' WHERE country="' + country_total + '"';
            //     CONTINENT = ' AND continent="' + continent_total + '"';

            // }
            
            if(COUNTRY !== '' && CONTINENT == '')
            {
                QUERY = 'SELECT total_cases, total_recovered, total_deaths, active_cases, new_cases FROM WORLDOMETER ' + COUNTRY + ';';
            }
            
            else if (COUNTRY == '' && CONTINENT !== '') {
                QUERY = 'SELECT total_cases, total_recovered, total_deaths, active_cases, new_cases FROM WORLDOMETER ' + CONTINENT + ';';
            }

            else if (country_total == 'All_Countries') {
                QUERY = 'SELECT total_cases, total_recovered, total_deaths, active_cases, new_cases FROM WORLDOMETER ORDER BY COUNTRY;';
            }

            else if (continent_total == 'All_Continent'){
                QUERY = 'SELECT SUM(total_cases) AS total_cases, SUM(total_recovered) AS total_recovered, SUM(total_deaths) AS total_deaths, SUM(active_cases) AS active_cases, SUM(new_cases) AS new_cases FROM WORLDOMETER GROUP BY CONTINENT;';
            }
            else{
                QUERY = 'SELECT * FROM WORLDOMETER WHERE COUNTRY =""'
            }

            //console.log(QUERY);

            db.query(QUERY, (err, RESULT) => {
                var totalcases = 0;
                var totalrecovered = 0;
                var totaldeaths = 0;
                var activecases = 0;
                var newcases = 0;
                if(RESULT.length!=0){
                    var i=1;
                    RESULT.forEach(function(data) {
                        console.log(data);

                        totalcases += data.total_cases;
                        totalrecovered += data.total_recovered;
                        totaldeaths += data.total_deaths;
                        activecases += data.active_cases;
                        newcases += data.new_cases;
                    })
                }

                var TOTAL = [{
                    total_cases     :       totalcases,
                    total_recovered :       totalrecovered,
                    total_deaths    :       totaldeaths,
                    active_cases    :       activecases,
                    new_cases       :       newcases
                }]
                db.query('SELECT DISTINCT(continent) FROM WORLDOMETER;', (err, continent) => {
                    db.query('SELECT DISTINCT(COUNTRY) FROM DAILY;', (err, countries) => {
                        if (err) throw err;
                        //console.log(RESULT);
                        res.render('index.ejs', {title:'Home', userData: result, oneData: TOTAL, country: countries, continent: continent});
                    });
                })
            })

        })
    }
    
})

/* 1.) Confirmed cases per day */

app.get('/getONE-optionONE', (req, res) => {
    var query = 'SELECT	ID,	COUNTRY, MAX(CONFIRMED) AS CONFIRMED_CASES FROM	DAILY GROUP	BY	COUNTRY ORDER	BY	MAX(CONFIRMED)	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received from covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getONE-optionTWO', (req, res) => {
    var query = 'SELECT	ID, COUNTRY, DAILY.DATE, CONFIRMED FROM	DAILY;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received from covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/* 4.) Death Cases per day */

app.get('/getFOUR-optionONE', (req, res) => {
    var query = 'SELECT	ID, COUNTRY, MAX(DEATHS) AS DEATH_CASES FROM DAILY GROUP BY	COUNTRY ORDER BY MAX(DEATHS) DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getFOUR-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	DAILY.DATE,		DEATHS FROM	DAILY;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/* 7.) Recovered cases per day */

app.get('/getSEVEN-optionONE', (req, res) => {
    var query = 'SELECT	ID,		COUNTRY,	MAX(RECOVERED)	AS	RECOVERED_CASES FROM	DAILY GROUP	BY	COUNTRY ORDER	BY	MAX(RECOVERED)	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getSEVEN-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	DAILY.DATE,		RECOVERED FROM	DAILY;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/* 10.) Active cases per day */

app.get('/getTEN-optionONE', (req, res) => {
    var query = 'SELECT	ID,		COUNTRY,	MAX(DAILY.ACTIVE)	AS	ACTIVE_CASES FROM	DAILY GROUP	BY	COUNTRY ORDER	BY	MAX(DAILY.ACTIVE)	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getTEN-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	DAILY.DATE,		DAILY.ACTIVE FROM	DAILY;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/* 13.) New cases per day */

app.get('/getTHIRTEEN-optionONE', (req, res) => {
    var query = 'SELECT	ID,		COUNTRY,	MAX(NEW_CASES)	AS	NEW_CASES FROM	DAILY GROUP	BY	COUNTRY ORDER	BY	MAX(NEW_CASES)	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getTHIRTEEN-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	DAILY.DATE,		NEW_CASES FROM	DAILY;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/* 16.) New death cases per day */

app.get('/getSIXTEEN-optionONE', (req, res) => {
    var query = 'SELECT	ID,		COUNTRY,	SUM(NEW_DEATHS)	AS	NEW_DEATH_CASES FROM	DAILY GROUP	BY	COUNTRY ORDER	BY	SUM(NEW_DEATHS)	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getSIXTEEN-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	DAILY.DATE,		NEW_DEATHS FROM	DAILY;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/*19.) New recovered cases per day */

app.get('/getNINETEEN-optionONE', (req, res) => {
    var query = 'SELECT	ID,		COUNTRY,	SUM(NEW_RECOVERED)	AS	NEW_RECOVERED_CASES FROM	DAILY GROUP	BY	COUNTRY ORDER	BY	SUM(NEW_RECOVERED)	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getNINETEEN-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	DAILY.DATE,		NEW_RECOVERED FROM	DAILY;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/*22.) Total death case per country */

app.get('/getTWENTYTWO-optionONE', (req, res) => {
    var query = 'SELECT	COUNTRY,	MAX(DEATHS) AS DEATH_CASES FROM	DAILY GROUP	BY	COUNTRY ORDER	BY	MAX(DEATHS)	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getTWENTYTWO-optionTWO', (req, res) => {
    var query = ' SELECT	COUNTRY,	TOTAL_DEATHS FROM	WORLDOMETER GROUP	BY	COUNTRY ORDER	BY	TOTAL_DEATHS	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/*23.) Total death case per continent */

app.get('/getTWENTYTHREE', (req, res) => {
    var query = 'SELECT	CONTINENT,		SUM(TOTAL_DEATHS)	AS TOTAL_DEATHS FROM	WORLDOMETER GROUP	BY	CONTINENT ORDER	BY	SUM(TOTAL_DEATHS)	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/*24.) Total Case per country */

app.get('/getTWENTYFOUR-optionONE', (req, res) => {
    var query = 'SELECT	COUNTRY,	CONFIRMED AS CONFIRMED_CASES FROM	DAILY WHERE	MONTH(DAILY.DATE)="7" AND DAY(DAILY.DATE)="27" GROUP	BY	COUNTRY ORDER	BY	CONFIRMED	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getTWENTYFOUR-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	TOTAL_CASES FROM	WORLDOMETER GROUP	BY	COUNTRY ORDER	BY	TOTAL_CASES	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/*25.) Total Case per Continent */

app.get('/getTWENTYFIVE', (req, res) => {
    var query = 'SELECT	CONTINENT,		SUM(TOTAL_CASES) AS TOTAL_CASES FROM	WORLDOMETER GROUP	BY	CONTINENT ORDER	BY	SUM(TOTAL_CASES)	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/*26.) Total Recovered cases per country */

app.get('/getTWENTYSIX-optionONE', (req, res) => {
    var query = 'SELECT	COUNTRY,	RECOVERED AS RECOVERED_CASES FROM	DAILY WHERE	MONTH(DAILY.DATE)="7" AND DAY(DAILY.DATE)="27" GROUP	BY	COUNTRY ORDER	BY	RECOVERED	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getTWENTYSIX-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	TOTAL_RECOVERED FROM	WORLDOMETER GROUP	BY	COUNTRY ORDER	BY	TOTAL_RECOVERED	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/*27.) Total Recovered cases per continent */

app.get('/getTWENTYSEVEN', (req, res) => {
    var query = 'SELECT	CONTINENT,		SUM(TOTAL_RECOVERED) AS TOTAL_RECOVERED_CASES FROM	WORLDOMETER GROUP	BY	CONTINENT ORDER	BY	SUM(TOTAL_RECOVERED)	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/*28.) Total Active case per country */

app.get('/getTWENTYEIGHT-optionONE', (req, res) => {
    var query = 'SELECT	COUNTRY,	DAILY.ACTIVE AS ACTIVE_CASES FROM	DAILY WHERE	MONTH(DAILY.DATE)="7" AND DAY(DAILY.DATE)="27" GROUP	BY	COUNTRY ORDER	BY	DAILY.ACTIVE	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getTWENTYEIGHT-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	ACTIVE_CASES FROM	WORLDOMETER GROUP	BY	COUNTRY ORDER	BY	ACTIVE_CASES	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/*29.) Total Active cases per continent */

app.get('/getTWENTYNINE', (req, res) => {
    var query = 'SELECT	CONTINENT,		SUM(ACTIVE_CASES) AS TOTAL_RECOVERED_CASES FROM	WORLDOMETER GROUP	BY	CONTINENT ORDER	BY	SUM(ACTIVE_CASES)	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/*30.) Total New Cases per Country */

app.get('/getTHIRTY-optionONE', (req, res) => {
    var query = 'SELECT	COUNTRY,	NEW_CASES FROM	DAILY WHERE	MONTH(DAILY.DATE)="7" AND DAY(DAILY.DATE)="27" GROUP	BY	COUNTRY ORDER	BY	NEW_CASES	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getTHIRTY-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	NEW_CASES FROM	WORLDOMETER GROUP	BY	COUNTRY ORDER	BY	NEW_CASES	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/*31.) Total New Cases per Continent */

app.get('/getTHIRTYONE', (req, res) => {
    var query = 'SELECT	CONTINENT,		SUM(NEW_CASES) AS TOTAL_NEW_CASES FROM	WORLDOMETER GROUP	BY	CONTINENT ORDER	BY	SUM(NEW_CASES)	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.listen('2000', () => {
    console.log('listening to server at port 2000');
});
