const mysql = require('mysql');
const package = require('./package.json');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'cis435',
  password: 'project3',
  database: 'cis435_schema'
});

connection.connect((err)=>{
(err) ? console.log(err) : console.log(connection);
});

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "*");
    next();
  });

  app.get('/', (req, res) =>{ 
    res.send(package.name + ' - ' + package.version);
  })

  app.get('/isAlive', (req, res)=> {
    res.send('success');
  })

  app.get('/getStudents', (req, res) => {
    connection.query('SELECT * FROM students', (err, data) => {
      if(err) console.log(err);
      res.send(data);
    })
  })

  app.get('/getTimeSlots', (req, res) =>{
    connection.query('SELECT * FROM time_slots', (err, data)=>{
      if(err)
        console.log(err);

      console.log(data);
      res.send(data);
    })
  })

  app.post('/bookReservation', async (req, res) => {
    let data = await selectAllByUmid(req.body.umid)    
    let timeframe = await selectAllByTimeFrame(req.body.scheduled);
    console.log('TimeFrame: ' + timeframe);

    console.log('Data: ' + JSON.stringify(data));
    if(data.length < 1 || data == undefined){
      let isSuccess = await insertAllIntoStudents(req.body);
      let validOccupants = await decrementOccupants(req.body.scheduled);
      if(isSuccess && validOccupants){
        res.status(200);
        res.send('success');
      } else if(!validOccupants){
        res.status(400);
        res.send('max occupancy at selected timeframe');
      } else{
        console.log(err);
        res.status(500);
        res.send('error');
      }
    } else {
      res.status(302);
      res.send(data);
    }
  })

  app.post('/getReservation', (req, res) => {
    connection.query('SELECT * FROM students WHERE umid='+req.body.umid, (err, data)=>{
      if(err)
        console.log(err);

      console.log(data);
      res.send(data);
    })
  })

  app.post('/updateSchedule', (req, res)=>{
    connection.query("UPDATE students SET scheduled='" + req.body.schedule + "' WHERE (umid='" + req.body.umid + "')", (err, data) => {
      if(err) console.log(err);

      console.log(req.body.schedule);
      console.log(data);
      res.send(data)
    });
  })

  app.post('/removeSchedule', async (req, res)=>{
    let umid = req.body.umid;

    await incrementOccupants(umid);
    res.send(await removeSchedule(umid));
  })
};

function selectAllByTimeFrame(timeframe){
  return new Promise((resolve, reject) => {
    connection.query("SELECT * FROM time_slots WHERE timeframe='" + timeframe + "'", (err, data) => {
      resolve(data);
    });
  })  
}

function selectAllByUmid(umid){
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM students WHERE umid='+umid, async (err, data)=>{
      resolve(data);
    });
  });
}

function insertAllIntoStudents(request){
  return new Promise((resolve, reject) => {
    connection.query("INSERT INTO students VALUES (" + request.umid + ", '" + request.first + "', '" + request.last + "', '"
      + request.title + "', '" + request.email + "', '" + request.phone + "', '" + request.scheduled
      + "');", (err)=>{
      
      if(err) reject(false);
      resolve(true);
    })
  })
}

function selectAllTimeSlotsByTimeFrame(timeframe){
  return new Promise((resolve, reject) => {
    connection.query('SELECT * FROM time_slots WHERE timeframe="' + timeframe + '"', (err, data) =>{
      if(err){
        console.log(err);
        reject(err);
      }

      resolve(data[0].occupants);
    });
  })
}

function updateTimeSlotsByTimeFrame(occupants, timeframe){
  return new Promise((resolve, reject) => {
    console.log('occupants: ' + occupants + '; timeframe: ' + timeframe);
    connection.query('UPDATE time_slots SET occupants=' + occupants + ' WHERE (timeframe="' + timeframe + '");', (err, data) =>{
      if(err){
        console.log(err);
        reject(false);
      }
      resolve(true);
    })
  })
}

function decrementOccupants(timeframe){
  return new Promise(async (resolve, reject) => {
    let occupants = await selectAllTimeSlotsByTimeFrame(timeframe);
    if(occupants === 0){
      reject(false);
    } else {
      occupants--;

      resolve(await updateTimeSlotsByTimeFrame(occupants, timeframe));
    }
  })
}

function incrementOccupants(umid){
  return new Promise(async (resolve, reject) => {
    let record = await selectAllByUmid(umid);
    let timeframe = record[0].scheduled;

    let occupants = await selectAllTimeSlotsByTimeFrame(timeframe);
    console.log(occupants);
    if (occupants < 6)
      occupants++;

    resolve(await updateTimeSlotsByTimeFrame(occupants, timeframe));
  })
}

function removeSchedule(umid){
  return new Promise(async (resolve, reject) =>{
    connection.query("DELETE FROM cis435_schema.students WHERE umid='" + umid + "'", (err, data) =>{
      if(err){
        console.log(err);
        reject(err);
      }
      
      resolve(data);
    })
  })
}