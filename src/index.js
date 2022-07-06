const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

const customers = [];

//request body 

//Middleware
function verifyIfAccountExistsByCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf)

  if(!customer) {
    return response.status(400).send({error: "Customer not found"})
  }

  request.customer = customer;

  return next();
}

app.use(express.json());

//Usar middleware em todas as rotas já existentes
app.use(verifyIfAccountExistsByCPF);

app.post("/account", (request, response) => {  
  const { cpf, name, statement} = request.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    response.status(400).json({ error: "customer already exists" });
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement,
  });

  return response.status(201).send(customers);
});


//Usar middleware em rota específica
app.get("/statement", verifyIfAccountExistsByCPF, (request, response) => {
  const { customer } = request;

  return response.send(customer.statement)
});

app.listen(8080);
