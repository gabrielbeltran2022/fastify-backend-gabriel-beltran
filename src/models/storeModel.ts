import { DataTypes, Model, Sequelize } from "sequelize";
import { v4 as uuidv4 } from 'uuid';

export class Store extends Model {
    public id!: string;
    public storeName!: string;
    public address!: string;
    public location!: string;
    public type!: string[];
    public isActive!: boolean;
    public fk_customer!: string;
}

export const initStore = (sequelize: Sequelize) => {
    Store.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: () => uuidv4()
        },
        storeName: {
            type: DataTypes.STRING(256),
            allowNull: false,
            validate: {
                len: { args: [3, 128], msg: "Store name must be between 3 and 256 characters" }
            }
        },
        address: {
            type: DataTypes.STRING(256), 
            allowNull: false,
            validate: {
                len: {args: [12,256], msg: "Address must be between 3 and 256 characters"}
            }
        },
        location: {
            type: DataTypes.STRING(128),
            allowNull: false,
            validate: {
                 len: { args: [3, 128], msg: "Location must be between 3 and 128 characters" },
            }
        },
        type: {
            type: DataTypes.JSONB,
            defaultValue: []
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        fk_customer: {
            type: DataTypes.STRING(128),
            allowNull: false,
            references: {
                model: "Credentials",
                key: "fk_customer"
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        }
    }, { 
        sequelize,
        modelName: 'Store',
        tableName: 'Stores'
    });

    return Store;
};