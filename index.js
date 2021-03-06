
const express = require('express')
const app = express()

const map = {
  12: 1,
  13: 7,
  14: 31,
  15: 93,
  16: 186
};

const port = 3000

app.use(express.json());

app.set('view engine', 'jade');
app.use(express.static('public'))
app.use(express.urlencoded({limit: '5000mb', extended: true, parameterLimit: 100000000000}));

app.get('/', (req, res) => {
    res.render('index');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.post('/results', (req,res) => {
  const fs = require('fs')
  const body = req.body;
  let place = body.region.split(', ');
  if (place.length < 2){
    res.redirect('/');
    return;
  }
  const keyworde = body.business;
  const zipcode = place[place.length-2].slice(-5);
  const daysBack = map[body.timeframe];
  let rawdata = fs.readFileSync('public/dmazip.json');
  fs.writeFile('public/kw.txt',keyworde,function(err) {
    if (err) throw err;
    console.log('complete');
    })
  let student = JSON.parse(rawdata);
  const dma = student[zipcode];
  timenow = new Date();
  timethen = new Date();
  timethen.setDate(timethen.getDate()-daysBack);
  const googleTrends = require('google-trends-api');
  googleTrends.relatedTopics({keyword: keyworde, startTime: timethen, endTime: timenow, geo: dma, granularTimeResolution: true})
    .then((res) => {
  fs.writeFile('public/relatedTopics.json',res,function(err) {
    if (err) throw err;
    console.log('complete');
    })
})
.catch((err) => {
  console.log(err);
})
  googleTrends.relatedQueries({keyword: keyworde, startTime: timethen, endTime: timenow, geo: dma, granularTimeResolution: true})
  .then((res) => {
    fs.writeFile('public/relatedQueries.json',res,function(err) {
      if (err) throw err;
      console.log('complete');
      })
  })
  .catch((err) => {
    console.log(err);
  })
  //problem here: results page uses old json data each time 
  //(might be because it takes too long to write to JSON files)
  //

  function stateChange(newState) {
    setTimeout(function () {
        if (newState == -1) {
          res.render("results");
        }
    }, 5000);
}
stateChange(-1);
}) 


