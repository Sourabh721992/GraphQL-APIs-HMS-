const { GraphQLServer } = require("graphql-yoga");
const mongoose = require("mongoose");
const Mutation = require("./resolvers/Mutation");
const Query = require("./resolvers/Query");
//Config File
const db = require("./config/config").mongoURI;

//Connect to mongoDb
mongoose
  .connect(db)
  .then(() => console.log("MongoDb Connected"))
  .catch(err => console.log(err));

const server = new GraphQLServer({
  typeDefs: "./schema.graphql",
  resolvers: {
    Query,
    Mutation
  }
});

server.start(() => {
  console.log("Server is up");
});
