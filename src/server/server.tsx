import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import apiRouter from './routes/api';
import errorHandler from './middleware/errorHandler';
import renderApp from './middleware/renderApp';

const server = express();

server.use(cookieParser());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use('/api/v1', apiRouter);
server.use(express.static('dist/public'));
server.use(errorHandler);

server.get('*', renderApp);

export default server;
