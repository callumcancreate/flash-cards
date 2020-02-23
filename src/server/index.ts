import server from "./server";
import "./db";
import "./models/Card";

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
