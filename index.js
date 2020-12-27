// IMPORT
const express = require('express');
const mysql = require('mysql');



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

//note: all of this routes will be done like how its done for the node-SQL sample code given

app.get('/', (req, res) => {
    var query = 'SELECT country, MONTH(DAILY.DATE) AS month, max(confirmed) AS confirmed, max(deaths) AS deaths, max(recovered) AS recovered, max(active) AS active, max(new_cases) AS new_cases, max(new_deaths) AS new_deaths, max(new_recovered) AS new_recovered  FROM DAILY GROUP BY month(DAILY.DATE), country;';
    // var query = 'SELECT * FROM DAILY WHERE COUNTRY="PHILIPPINES";';
    db.query(query, (err, result) => {
        if (err) throw err;
        console.log('Data received from covid_db database:');
        // console.log(result);
        db.query('SELECT DISTINCT(COUNTRY) FROM DAILY;', (err, countries) => {
            if (err) throw err;
            res.render('index.ejs', {title:'Home', userData: result, country: countries});
        })
        
    })
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

/* 2.) Confirmed cases per month */

app.get('/getTWO', (req, res) => {
    var query = 'SELECT	COUNTRY, MONTH(DAILY.DATE) AS MONTH, MAX(CONFIRMED) AS CONFIRMED_CASES FROM	DAILY GROUP	BY	MONTH(DAILY.DATE),	COUNTRY;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/* 3.) Confirmed cases per country */

app.get('/getTHREE-optionONE', (req, res) => {
    var query = 'SELECT	COUNTRY, CONFIRMED AS CONFIRMED_CASES FROM DAILY WHERE MONTH(DAILY.DATE)="7" AND DAY(DAILY.DATE)="27" GROUP	BY	COUNTRY ORDER	BY	CONFIRMED	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getTHREE-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY, TOTAL_CASES FROM WORLDOMETER GROUP	BY	COUNTRY ORDER BY TOTAL_CASES DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
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

/* 5.) Death Cases per Month */

app.get('/getFIVE', (req, res) => {
    var query = 'SELECT	COUNTRY,	MONTH(DAILY.DATE) AS MONTH,		MAX(DEATHS) AS DEATH_CASES FROM	DAILY GROUP	BY	MONTH(DAILY.DATE), COUNTRY;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        // console.log(result);
        result.forEach( (result) => {
            console.log(`${result.COUNTRY} during ${result.MONTH} has ${result.DEATH_CASES} death cases`);
        });
        res.render('index.ejs', {title:'test', userData: result});
    })
});

/* 6.) Death cases per country */

app.get('/getSIX-optionONE', (req, res) => {
    var query = 'SELECT	COUNTRY,	DEATHS AS DEATH_CASES FROM	DAILY WHERE	MONTH(DAILY.DATE)="7" AND DAY(DAILY.DATE)="27" GROUP	BY	COUNTRY ORDER	BY	DEATHS	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getSIX-optionTWO', (req, res) => {
    var query = ' SELECT	COUNTRY,	TOTAL_DEATHS FROM	WORLDOMETER GROUP	BY	COUNTRY ORDER	BY	TOTAL_DEATHS	DESC;';
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

/* 8.) Recovered Cases per Month */

app.get('/getEIGHT', (req, res) => {
    var query = 'SELECT	COUNTRY,	MONTH(DAILY.DATE) AS MONTH,		MAX(RECOVERED) AS RECOVERED_CASES FROM	DAILY GROUP	BY	MONTH(DAILY.DATE), COUNTRY;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/* 9.) Recovered cases per country */

app.get('/getNINE-optionONE', (req, res) => {
    var query = 'SELECT	COUNTRY,	RECOVERED AS RECOVERED_CASES FROM	DAILY WHERE	MONTH(DAILY.DATE)="7" AND DAY(DAILY.DATE)="27" GROUP	BY	COUNTRY ORDER	BY	RECOVERED	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getNINE-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	TOTAL_RECOVERED FROM	WORLDOMETER GROUP	BY	COUNTRY ORDER	BY	TOTAL_RECOVERED	DESC;';
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

/* 11.) Active Cases per Month */

app.get('/getELEVEN', (req, res) => {
    var query = 'SELECT	COUNTRY,	MONTH(DAILY.DATE) AS MONTH,		MAX(DAILY.ACTIVE) AS ACTIVE_CASES FROM	DAILY GROUP	BY	MONTH(DAILY.DATE), COUNTRY;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/* 12.) Active cases per country */

app.get('/getTWELVE-optionONE', (req, res) => {
    var query = 'SELECT	COUNTRY,	DAILY.ACTIVE AS ACTIVE_CASES FROM	DAILY WHERE	MONTH(DAILY.DATE)="7" AND DAY(DAILY.DATE)="27" GROUP	BY	COUNTRY ORDER	BY	DAILY.ACTIVE	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getTWELVE-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	ACTIVE_CASES FROM	WORLDOMETER GROUP	BY	COUNTRY ORDER	BY	ACTIVE_CASES	DESC;';
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

/* 14.) New cases per month */

app.get('/getFOURTEEN', (req, res) => {
    var query = 'SELECT	COUNTRY,	MONTH(DAILY.DATE) AS MONTH,		MAX(NEW_CASES) AS NEW_CASES FROM	DAILY GROUP	BY	MONTH(DAILY.DATE), COUNTRY;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/* 15.) New Cases per country */

app.get('/getFIFTEEN-optionONE', (req, res) => {
    var query = 'SELECT	COUNTRY,	NEW_CASES FROM	DAILY WHERE	MONTH(DAILY.DATE)="7" AND DAY(DAILY.DATE)="27" GROUP	BY	COUNTRY ORDER	BY	NEW_CASES	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getFIFTEEN-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	NEW_CASES FROM	WORLDOMETER GROUP	BY	COUNTRY ORDER	BY	NEW_CASES	DESC;';
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

/* 17.) New death cases per month */

app.get('/getSEVENTEEN', (req, res) => {
    var query = 'SELECT	COUNTRY,	MONTH(DAILY.DATE) AS MONTH,		SUM(NEW_DEATHS) AS NEW_DEATH_CASES FROM	DAILY GROUP	BY	MONTH(DAILY.DATE), COUNTRY;;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/* 18.) New Death Cases per country */

app.get('/getEIGHTEEN-optionONE', (req, res) => {
    var query = 'SELECT	COUNTRY,	NEW_DEATHS FROM	DAILY WHERE	MONTH(DAILY.DATE)="7" AND DAY(DAILY.DATE)="27" GROUP	BY	COUNTRY ORDER	BY	NEW_DEATHS	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getEIGHTEEN-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	NEW_DEATHS FROM	WORLDOMETER GROUP	BY	COUNTRY ORDER	BY	NEW_DEATHS	DESC;';
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

/*20.) New recovered cases per month */

app.get('/getTWENTY', (req, res) => {
    var query = 'SELECT	COUNTRY,	MONTH(DAILY.DATE) AS MONTH,		SUM(NEW_RECOVERED) AS NEW_RECOVERED_CASES FROM	DAILY GROUP	BY	MONTH(DAILY.DATE), COUNTRY;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

/*21.) New recovered cases per country */

app.get('/getTWENTYONE-optionONE', (req, res) => {
    var query = 'SELECT	COUNTRY,	NEW_RECOVERED AS NEW_RECOVERED_CASES FROM	DAILY WHERE	MONTH(DAILY.DATE)="7" AND DAY(DAILY.DATE)="27" GROUP	BY	COUNTRY ORDER	BY	NEW_RECOVERED	DESC;';
    db.query(query, (err, result) => {
        if (err) throw err;

        console.log('Data received covid_db database:');
        console.log(result);
        res.send(result);
    })
});

app.get('/getTWENTYONE-optionTWO', (req, res) => {
    var query = 'SELECT	COUNTRY,	NEW_RECOVERED FROM	WORLDOMETER GROUP	BY	COUNTRY ORDER	BY	NEW_RECOVERED	DESC;';
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
