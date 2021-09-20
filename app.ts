import cors from 'cors';
import express from 'express';
 
class App {
  public app: express.Application;
  public port: number;
 
  constructor(controllers:any, port:number) {
    this.app = express();
    this.port = port;
 
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }
 
  private initializeMiddlewares() {
    const allowedOrigins = ['http://localhost:3000'];
    const options: cors.CorsOptions = {
      origin: allowedOrigins
    };
    this.app.use(cors(options));
    this.app.use(express.json());
  }
 
  private initializeControllers(controllers:any[]) {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    });
  }
 
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`);
    });
  }
}
 
export default App;