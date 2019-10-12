let express = require('express');
const app = express();
const port = 8888;
const mongodb = require('mongodb'); //quel mongodb va messo sempre, mai cambiato
const MongoClient = mongodb.MongoClient
const cors = require('cors');
app.use(cors())
let url = "mongodb://localhost:27017";
const bodyParser = require('body-parser');
app.use(bodyParser.json())

const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const _PRIVATE_KEY = 'SamuPaga600DiAssicurazioneSenzaBersaniAhAhAh'
app.use(exjwt({ secret: _PRIVATE_KEY}).unless({path: ['/login']}));

let visite = 0

MongoClient.connect(url, {}, (err, client) => {
  if (err) {
    process.kill() 
  }
  const db = client.db('mongodb') //quel mongodb è il nome del database

  app.get('/mongodb', function (req, res) { //mongodb è il nome del database
    db.collection('eroi').find().toArray((err, items) => {
      if (err) {
        console.log('errore')
        throw err;
      }
      res.send(items);
    })
  })

  app.post('/login', (req,res) => {
    if (req.body.username && req.body.password) {
        db.collection('utenti').findOne({
            username: req.body.username,
            password: req.body.password,
        }, (err, result) => {
            if (err || !result) {
                return res.send('password sbagliata')
            }
            const token = jwt.sign({ username: result.username }, _PRIVATE_KEY);
            console.log(token)
            return res.send(token)
        });
    } else {
        return res.send('err: inviami username e password')
    }
})

  app.delete('/mongodb/:id', function (req, res) {
      if (req.body.superpoteri) {
        db.collection('eroi').updateOne({_id: new mongodb.ObjectID(req.params.id)}, {
          $pull: {
            superpoteri: req.body.superpoteri
          }  
        })
        console.log("arrivato fin qui")
        res.send("Eseguito correttamente")
    } else {
      db.collection('eroi').deleteOne({_id: new mongodb.ObjectID(req.params.id)})
      res.send('ok')
    }  
  })

  app.post('/mongodb/', function (req, res) {
    if (req.body.nome && req.body.superpoteri) {
      db.collection('eroi').insert({
        nome: req.body.nome,
        superpoteri: req.body.superpoteri
      })
      res.send("Eseguito correttamente")
    } else if (req.body.superpoteri) {
      db.collection('eroi').updateOne({_id: new mongodb.ObjectID(req.params.id)}, {
        $push: {
          superpoteri: req.body.superpoteri
        }
      })
      res.send("Qui ci sei arrivato almeno...")
      
    } else {
      res.send("Devi riempire entrambi i campi!")
    }
  })

  app.post('/mongodb/:id', function (req, res) {
    if (req.body.superpoteri) {
      db.collection('eroi').updateOne({_id: new mongodb.ObjectID(req.params.id)}, {
        $push: {
          superpoteri: req.body.superpoteri
        }
      })
      res.send("Qui ci sei arrivato almeno...")
      
    } else {
      res.send("Devi riempire entrambi i campi!")
    }
  })

  app.put('/mongodb/:id', function (req, res) {
    if (req.body.superpoteri && req.body.originale) {
      db.collection('eroi').updateOne({_id: new mongodb.ObjectID(req.params.id)}, {
        $push: {
          superpoteri: req.body.superpoteri
        }
      })
      db.collection('eroi').updateOne({_id: new mongodb.ObjectID(req.params.id)}, {
        $pull: {
          superpoteri: req.body.originale
        }
      })
      
      res.send("Eseguito correttamente")
    } else if (req.body.nome) {
      db.collection('eroi').updateOne({_id: new mongodb.ObjectID(req.params.id)}, {
        $set: {
          nome: req.body.nome
        }
      })
      res.send("Eseguito correttamente")
    } else {
      res.send("Operazione fallita...")
    }
  })
})

app.get('/', function (req, res) { //mongodb è il nome del database
    visite++
    console.log("Qualcuno ha caricato la pagina!")
    res.send("SERVER \n" + "Visite totali: " + visite);
  
})

app.listen(port, function () {
  console.log('Eseguito correttamente sulla porta ' + port);
});

