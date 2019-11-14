const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 8080;

require('./routes')(app);

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname, 'client/build')))

if(process.env.NODE_ENV === 'production'){
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build/index.html')); // + was =
  })
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/public/index.html'));
})

app.listen(PORT, ()=>{
  console.log('server listening on port ', PORT);
})