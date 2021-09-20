import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import * as express from 'express';
import client from '../clients/DynamoClient';
import IUser from '../interfaces/IUser';
import priceApi from '../services/BitcoinPrice';
 
class UserController {
  public path = '/user';
  public router = express.Router();

  private _tablename = "game_user";
 
  constructor() {
    this.intializeRoutes();
  }
 
  public intializeRoutes() {
    this.router.get(this.path, this.getUser);
    this.router.post(this.path, this.createUser);
    this.router.put(this.path, this.updateUser);

  }
 
  getUser = (request: express.Request, response: express.Response) => {
    if (request.query.name){
        const data = {
            AttributesToGet: [
                "name",
                "points"
            ],
            TableName : this._tablename,
            Key : { 
            name : {
                "S" : request.query.name.toString().toLowerCase(),
            }
            }
        }
        try{
            client.getItem(data).then((data: GetItemCommandOutput) => {
                if(data.Item){
                    const userData = data.Item;
                    const user:IUser = {
                        name: userData.name.S ? userData.name.S : "",
                        points: userData.points.N ? parseInt(userData.points.N) : 0,
                    };
                    response.send(user);
                }else{
                    response.status(404).send(`User ${request.query.name} Not Found`)
                }
            });
        }catch(err){
            console.error(err);
            response.status(500).send({"message": "fail"});
        }
    } else {
        response.status(400).send({"message": "Please provide User's Name"});
    }
  }
 
  createUser = (request: express.Request, response: express.Response) => {
    const user: IUser = request.body;
    const data = {
        TableName: this._tablename,
        Item: {
            name : { S: user.name.toLowerCase()},
            points: {N: "0"},
            timestamp: {N: Math.round((new Date()).getTime() / 1000).toString()}
         },
        
    }
    try {
        client.putItem(data).then((res) => {
            if (res) {
                response.send({"message": "Success"});
            } else {
                response.status(400).send({"message": "fail"});
            }
        });
    }catch (err) {
        console.error(err);
        response.status(500).send({"message": "fail"});
    }
  }

  updateUser = async(request: express.Request, response: express.Response) => {
    const body = request.body
    const guess = body['guess'];
    const price = body['price'];
    if (await this.comparePrice(price, guess)){
        const user: IUser = {
            name: body.name,
        };
        const data = {
            TableName: this._tablename,
            Key: {
                name : {S: user.name.toLowerCase()},
             },
            UpdateExpression: "SET points = points + :point, #ts = :ts",
            ExpressionAttributeNames: {
                "#ts": "timestamp"
            },
            ExpressionAttributeValues: {
                ":point": {N: "1"},
                ":ts": {S: Math.round((new Date()).getTime() / 1000).toString()}
            },
            ReturnValues:"UPDATED_NEW"
        }
        try {
            client.updateItem(data).then((res) => {
                if (res) {
                    const points = res['Attributes'] ? res['Attributes']['points']['N'] : '0'
                    response.send({"message": "Success", "points": points? parseInt(points): 0});
                } else {
                    response.status(400).send({"message": "Please Check the Request"});
                }
            });
        }catch(err){
            console.error(err);
            response.status(500).send({"message": "Service Failure"});
        }
    }else{
        response.send({"message": "Fail"});
    }
  }

  fetchPrice = async() => {
    const response = await priceApi();
    const data = response.data;
    return data.bpi.USD.rate_float;
}

  comparePrice = async(price: number, guess:string) => {
    const currentPrice = await this.fetchPrice();
    if (price<currentPrice && guess=="UP"){
        return true;
    }
    else if (price>currentPrice && guess=="DOWN"){
        return true;
    }
    else {
        return false;
    }
  }
}
 
export default UserController;