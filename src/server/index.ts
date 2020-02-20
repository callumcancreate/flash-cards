import server from "./server";
import "./db";
import "./models/Category";

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
