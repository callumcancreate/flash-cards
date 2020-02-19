import { Client } from "pg";
import chalk from "chalk";

const connect = () => {
  const client = new Client({
    connectionString: process.env.DB_URI,
    ssl: process.env.NODE_ENV === "development" ? false : true
  });

  client
    .connect()
    .then(() => {
      console.log(
        chalk.green(
          `New connection to database hosted on ${client.host} port ${client.port}`
        )
      );
    })
    .catch(e => {
      console.log(
        chalk.red(
          `Unable to make new connection to database hosted on ${client.host} port ${client.port}`
        )
      );
      console.log(e);
    });

  return client;
};

export default connect;
