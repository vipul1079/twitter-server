import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { User } from "./user";
import { GraphqlContext } from "../interfaces";
import JWTservice from "../services/jwt";



export async function initServer() {
  const app = express();

  
  app.use(cors());
  app.use(bodyParser.json());

  const graphqlServer = new ApolloServer<GraphqlContext>({
    typeDefs: `
    ${User.types}
        type Query {
            ${User.queries}
        }
        `,
    resolvers: {
      Query: {
        ...User.resolvers.queries,
      },
    },
  });
  await graphqlServer.start();

  app.use("/graphql", expressMiddleware(graphqlServer,{context:async({req,res})=>{
    return{
      user:req.headers.authorization ? JWTservice.decodeToken(req.headers.authorization.split("Bearer ")[1]):undefined,
    }
  }}));

  return app;
}
