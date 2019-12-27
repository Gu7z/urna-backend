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
    image: String
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
    var vote = new Vote(req.body)
    await vote.save()
    .then(
        data => salvo = true
    )
    .catch(
        err => {salvo = false; res.status(400).send("Nao foi possivel computar o voto")}
    )

    if ( salvo ){
        res.send('Computado')
    }else{
        res.send('Nao enviado')
    }

    res.end()
})

app.get('/contar', async(req, res)=>{
    var finalResult = [];
    var isDone = false;
    var getcountObj
    
    Vote.aggregate(
        [
            {
                $group: 
                {
                    _id: "$vote", count: {$sum: 1}
                }
            }
        ]
    ).then( async (qr) => { 

        var results = qr.map( async (countObj) => {

            await People.find({_id: countObj._id}, {name: 1, _id: 0}).then( (qrry) => {
                
                qrry.map( pessoaObj => {
                    result = {
                        name: pessoaObj.name,
                        votes: countObj.count
                    }

                    finalResult = result
                } )

            } )

            return(finalResult);

        } )

        Promise.all(results).then((completed) => {
            res.send(completed)
        })

    } )

    
})

app.listen(port, ()=> console.log(`Rodando na porta: ${port}`))