import App from './app';
import UserController from './src/controllers/User';
 
const app = new App(
  [
    new UserController(),
  ],
  5000,
);
 
app.listen();