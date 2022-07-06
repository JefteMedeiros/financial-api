const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

function verifyIfAccountExistsByCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if(!customer) {
    return response.status(400).json({error: "customer not found"});
  }

  request.customer = customer;

  return next();
}

app.get("/getclients", (request, response) => {
  return response.send("Testing");
});

app.get("/statement", verifyIfAccountExistsByCPF ,(request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
})

app.post("/createaccount", (request, response) => {
  const { cpf, name } = request.body;

  const customer = customers.find((customer) => {
    return customer.cpf === cpf
  })

  if(customer) {
    return response.status(400).json({error: "Customer already exists!"})
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return response.status(201).send(customers);
});

app.post("/statement", verifyIfAccountExistsByCPF, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount, 
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation)

  return response.status(201).send()
})

app.listen(8080);
