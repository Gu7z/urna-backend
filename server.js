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

var People = mongoose.model('people', peopleSchema);

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
    var alo = await people.save()
    .then(
        item => {
            salvo = true
        }
    ).catch(
        err => {
            salvo = false
            res.status(400).send("unable to save to database")
        }
    )
    if (salvo){
        res.send('Enviado')
    }else{
        res.send('Não Enviado')
    }
    res.end()
})

app.listen(port, ()=> console.log(`Rodando na porta: ${port}`))