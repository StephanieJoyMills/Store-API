# Hello there! 2

I completed this challenge using Node.js paired with Postgres and Knex.js as the ORM and Postico as the client.

Documentation (using postman) for all the endpoints can be found here: https://documenter.getpostman.com/view/2117258/RzteSruv

## Postgres set-up

#### Installation

Install Postgres with homebrew: `brew install postgresql`     
Check version: `postgres -V`    

#### Using and Configuring PostgreSQL

Create our db: `createdb shopify-challenge`   
Open up psql utility: `psql postgres`   
(Optional) set password: `\password`   
Check to make sure our db was created: `\list`   

*Other useful commands:*   
To drop our db: `dropdb`   
To exit psql: `\q`   

#### (Optional) Postico

- Postgres Client for OSX

Download at: https://eggerapps.at/postico/download/
Connecting to local db: select `New Favorite` add pw, and select **Show all Databases**, click `Done` and then `Connect`

## Project Set-up

install dependencies: `npm install`   
run migrations: `knex migrate:latest`   
run seeds: `knex seed:run`   
start nodemon: `npm start nodemon` or just `npm start` to run without the demon    

Head over to postman to get started!
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/d4cddeb5d988215021c9)

## Notes

The `Get products` endpoint will fetch items one at a time or all at once depending on the use of limit and offset.

Products can be purchased both directly and after being added to a cart. I'm assuming if a product has no inventory it will simply be left in the cart. I also am not deleting the cart after completion.

There were a lot of features I would have loved to add and several elements I would have liked to improve on such as:

- Security (JWT, better error handling/checking, proper logging, etc)
- Database (improve design i.e. a user table, read and write database)
- Better docs (better comments on the code, error examples)
- Tests <- <- <-
