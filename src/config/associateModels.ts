import { Customer } from "../models/customerModel";
import { Credential } from "../models/credentialsModel";
import { Product } from "../models/productModels";
import { Store } from "../models/storeModel";
import { Sales } from "../models/salesModel";

export const associateModels = () => {
    //Connection from Customer to Credentials
    Customer.hasOne(Credential, {
        foreignKey: "fk_customer",
        as: "credential"
    });

    Credential.belongsTo(Customer, {
        foreignKey: "fk_customer",
        as: "customer"
    });
    //Connection Store to Credentials
    Store.belongsTo(Credential,{
        foreignKey: "fk_customer",
        targetKey: "fk_customer",
        as: "customer"
    })
    Credential.hasMany(Store,{
        foreignKey: "fk_customer",
        sourceKey: "fk_customer",
        as: "stores"
    })
   //Connection Store to Product
   Product.belongsTo(Store, { foreignKey: 'fk_store' });
   Store.hasMany(Product, { foreignKey: 'fk_store' });

   //Connection Sales to credentials
    Sales.belongsTo(Credential, { 
        foreignKey: "fk_customer", 
        targetKey: "fk_customer",
        as: "customer" 
    });
    Credential.hasMany(Sales, { 
        foreignKey: "fk_customer", 
        as: "sales" 
    });

    //Connection Sales  to  store
     Sales.belongsTo(Store,{ 
        foreignKey: "fk_store",
         as: "store"
         });
    Store.hasMany(Sales, {foreignKey: 
        "fk_store", 
        as: "sales" 
    });
    //Connection Sales to product
     Sales.belongsTo(Product,{ 
        foreignKey: "fk_product",
        as: "product"
     });
    Product.hasMany(Sales,{ 
        foreignKey: "fk_product",
        as: "sales" 
    });
};
