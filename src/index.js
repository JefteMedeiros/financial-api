const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

function verifyIfAccountExistsByCPF(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found!" });
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

app.get("/statement", verifyIfAccountExistsByCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

app.post("/createaccount", (request, response) => {
  const { cpf, name } = request.body;

  const customer = customers.find((customer) => {
    return customer.cpf === cpf;
  });

  console.log(customer);

  if (customer) {
    return response.status(400).json({ error: "Customer already exists!" });
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
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).json(statementOperation);
});

app.post("/deposit", verifyIfAccountExistsByCPF, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  }

  customer.statement.push(statementOperation);

  return response.status(201).json(customer)
})

app.post("/withdraw", verifyIfAccountExistsByCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "Insuficient funds!" });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.get("/statement/date", verifyIfAccountExistsByCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + "00:00");

  const statement = customer.statement.filter((e) => {
    e.created_at.toDateString() === new Date(dateFormat).toDateString();
  });

  if(!statement) {
    return response.status(400).json({error: "No operations at this date"})
  }

  return response.json(statement);
});

app.put("/account", verifyIfAccountExistsByCPF ,(request, response) => {
  const { name } = request.body;
  const { customer } = request;
  
  customer.name = name;

  return response.status(201).send()
})

app.get("/account", verifyIfAccountExistsByCPF ,(request, response) => {
  const { customer } = request;

  return response.json(customer)
})

app.delete("/account", verifyIfAccountExistsByCPF, (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.status(200).json(customer)
})

app.get("/balance", verifyIfAccountExistsByCPF, (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statement);

  return response.json(balance)
})

app.listen(8080);
