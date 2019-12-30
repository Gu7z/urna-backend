const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
var cors = require('cors')

const app = express()
const port = 3001

mongoose.connect('mongodb://localhost:27017/urna', {useNewUrlParser: true, useUnifiedTopology: true});

var peopleSchema = new mongoose.Schema({
    name: String,
    desc: String,
    image: String,
    votes: ''
});

var voteSchema = new mongoose.Schema({
    vote: String
});


var People = mongoose.model('people', peopleSchema);
var Vote = mongoose.model('vote', voteSchema);

app.use(bodyParser.json());
app.use(cors())

app.get('/', async (req, res)=>{
    var result;
    await People.find().then(item=>{
        result = item
    }).catch(
        result = 'Nao encontrado'
    )
    res.send(result)
    res.end()
})

app.post('/novo', async (req, res)=>{
    var salvo = false
    var people = new People(req.body)
    await people.save()
    .then(
        item => {
            salvo = true
        }
    ).catch(
        err => {
            salvo = false
            res.status(400).send("Nao foi possivel enviar o dado")
        }
    )
    if (salvo){
        res.send('Enviado')
    }else{
        res.send('Não Enviado')
    }
    res.end()
})

app.post('/vote', async (req, res) => {
    console.log(req.body)
    var salvo = false;
    People.update(
        {_id: req.body.id},
        {$push: {votes: {voto: req.body.id}}}
    ).then(res.end())
})

app.get('/count', async(req, res)=>{    
    People.find().then( async (qr) => { 
        var result = []; 
        qr.map(data => result = [...result, {name: data.name, votes: data.votes.length}]); 
        res.send(result) 
    } )    
})

app.listen(port, ()=> console.log(`Rodando na porta: ${port}`))