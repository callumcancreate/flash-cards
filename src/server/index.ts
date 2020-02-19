import server from "./server";
import connect from "./db";

const PORT = process.env.PORT || 3000;

connect();

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
