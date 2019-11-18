const fs = require('fs');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const App = require('./client/src/App');

const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 8080;

const router = express.Router()

require('./routes')(app);

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname, 'client/build')))

//if(process.env.NODE_ENV === 'production'){
//  app.use(express.static(path.join(__dirname, 'client/build')));
//  app.get('*', (req, res) => {
//    res.sendFile(path.join(__dirname + '/client/build/index.html')); // + was =
//  })
//}

//app.get('*', (req, res) => {
//  res.sendFile(path.join(__dirname + '/client/public/index.html'));
//})

const serverRender = (req, res, next)=>{
  fs.readFile(path.resolve('.client/build/index.html'), 'utf8', (err, data) => {
    if(err){
      console.error(err);
      return res.status(500).send('An error occurred');
    }
    return res.send(
      data.replace(
        '<div id="root"></div>', '<div id="root">${ReactDOMServer.renderToString(<App />)}</div>'
      )
    )
  })
}

router.use('^/$', serverRenderer);
router.use(express.static(path.resolve(__dirname, '..', 'build'), {maxAge: '30d' }));

app.use(router);

app.listen(PORT, ()=>{
  console.log('server listening on port ', PORT);
})
