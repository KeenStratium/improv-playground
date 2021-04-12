# improv-playground




## Initial Setup of Local Environment for Devs

1. Clone [`https://github.com/KeenStratium/improv-playground`](https://github.com/KeenStratium/improv-playground) . 
2. Go into `improv-playground` project folder and create `.env` and ask a dev for `.env`'s content.
3. Run `docker-compose up -d`
4. To access the GraphQL studio/explorer, open [http://localhost:4000/graphql](http://localhost:4000/graphql) on your browser.
Alternative is the Apollo Studio, which is better than the GraphQL playground. To access Apollo Studio, open [https://studio.apollographql.com/](https://studio.apollographql.com/). You can either create an account or ask a dev to be invited. When you chose to create an account, you can create a Graph and choose the "Local development", it'll then try to connect to your local Apollo Server instance.



## Normal Workflow on Running Local Environment

1. Run `docker-compose up -d`
3. Open **GraphQL Playground** or **Apollo Studio** to test queries.
