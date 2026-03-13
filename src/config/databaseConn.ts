import { Sequelize } from "sequelize";
import "dotenv/config";
import { initCustomer } from "../models/customerModel";
import {initProduct} from '../models/productModels'
import {initCredential} from '../models/credentialsModel'
import {associateModels} from '../config/associateModels'
import {initSales} from '../models/salesModel'
import {initStore} from '../models/storeModel'


class Database {
  public sequelize!: Sequelize;

  //connection for postre sql
  async connect() {
    this.sequelize = new Sequelize(
      process.env.DB_NAME as string,
      process.env.DB_USER as string,
      process.env.DB_PASSWORD as string,
      {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: "postgres",
         logging: false
      }
    );

    try {
        // Inside connect()
      await this.sequelize.authenticate();
      console.log(`PostgreSQL connected successfully running in: ${process.env.DB_PORT}`);
     
      //initialization for creation of table in postre
       
      //Customer
      initCustomer(this.sequelize)
      //Product
      initProduct(this.sequelize)
      //Credentials
      initCredential(this.sequelize)
      //Store
      initStore(this.sequelize)
      //Sales
      initSales(this.sequelize)

      //associate the model for the relationships
     associateModels();
      //synchronization of data if there some changes in schema
      await this.sequelize.sync({
        alter: true
      })
      console.log(`Database synced and tables created.`)


    } catch (error) {
      console.error("Unable to connect to database:", error);
      throw error;
    }
  }
}

export default Database;