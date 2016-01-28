# Notes

Trying to make order out of the data...

```json
{
  "transactions": [
    {
      "payee": "Testing Payee",
      "date": "034204324+324",
      "amount": -33.33,
      "account": 23,
      "category": -1 || -2 || catId,
      "note": "This is a transaction"
    }
  ],
  "accounts": [
    {
      "name": "Checking",
      "credit": false,
      "id": 23
    }
  ]
}
```

orrrrr

```json
{
  "transactions": {
    2015: {
      0: [
        {
          "payee": "sdfsdf"
        }
      ]
    }
  }
}


# MOAR NOTES
```json
{
  "01022016": {
    "category": {
      0: {
        value: 10,
        rolling: 10,
        note: "",
        transactions: [{
          name: "Cool movie cinema",
          outflow: 10
        }]
      },
      5: {
        value: 20,
        note: ""
      },
      6: {
        value: 500,
        note: ""
      }
    }
  }, {
    "date": 1/2/16,
    "category": {
      0: {
        value: 10,
        rolling: 20
      },
      5: 25,
      6: 500
    }
  }
}
```

```json
"categories": [
  {
    id: 0,
    name: "Groceries"
  }, {
    id: 5,
    name: "Movies"
  }, {
    id: 6,
    name: "Rent"
  }
]
```

### API
```js
function Database(name) {

  function getMonths() {
    return {
      "01012016": Month,
      "02012016": Month,
      [...]
    };
  }

  function setMonth(Date, Month) {}

  function getCategories() {}

  function removeCategory(id) {}
  
  return {
    getMonths,
    setMonth
  }
}

function Month(obj, next, update) {
  function removeTransaction(Transaction) {
    // remove transaction
    calcTotal();
    next.setRolling(catId, value);
  }

  function addTransaction(Transaction) {
    // add transaction
    calcTotal();
    next.setRolling(catId, value);
  }

  function setRolling(catId, rolling) {
    obj.category[catId] = rolling;
    calcTotal();
    next.setRolling(catId, value);
  }

  function calcTotal() {
    // add up transactions, mess around with the total
  }
}
```