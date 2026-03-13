import { DataTypes, Model, Sequelize } from "sequelize";
import { v4 as uuidv4 } from 'uuid';
import { Product } from "./productModels";
import { Store } from "./storeModel";
import { Customer } from "./customerModel";

export class Sales extends Model {
    public id!: string;
    public fk_product!: string;
    public fk_store!: string;
    public fk_customer!: string;
    public quantity!: number;
    public price!: number;
    public subTotal!: number;
    public transactionCode!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly product?: Product;         // for sale.product
    public readonly store?: Store;  
    public readonly customer?: Customer;       // for sale.customer
}

export const initSales = (sequelize: Sequelize) => {
    Sales.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: () => uuidv4()
        },
        fk_product: {
            type: DataTypes.STRING(128),
            allowNull: false,
            references: {
                model: 'Products',
                key: 'id'
            }
        },
        fk_store: {
            type: DataTypes.STRING(128), 
            allowNull: false,
            references: {
                model:  'Stores',
                key: 'id'
            }
        },
        fk_customer: {
            type: DataTypes.STRING(128),
            allowNull: false,
            references: {
                model: 'Credentials',
                key: 'fk_customer'
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        price: {
            type: DataTypes.DECIMAL(10, 2), 
            allowNull: false,
            defaultValue: 0.00
        },
        subTotal: {
            type: DataTypes.DECIMAL(10, 2), 
            allowNull: false,
            defaultValue: 0.00
        },
         transactionCode: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
       
    }, { 
        sequelize,
        modelName: 'Sale',
        tableName: 'Sales'
    });

    return Sales;
};