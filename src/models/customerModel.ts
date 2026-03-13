import { DataTypes, Model, Sequelize } from "sequelize";
import { v4 as uuidv4 } from 'uuid';

export class Customer extends Model {
    public id!: string;
    public fullname!: string;
    public age!: number;
    public gender!: string;
    public email!: string;
    public contactNumber!: number;
    public address!: string;
    //ORM RELATION
    public credential?: Credential
    public customer?: Customer; 
}

export const initCustomer = (sequelize: Sequelize) => {
    Customer.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: () => uuidv4()
        },
        fullname: {
            type: DataTypes.STRING(128),
            allowNull: false,
            validate: {
                len: { args: [3, 128], msg: "Fullname must be between 3 and 128 characters" }
            }
        },
        age: {
            type: DataTypes.INTEGER, 
            allowNull: false,
            validate: {
                min: 12,     
                max: 120,     
                isInt: {
                  msg: "age must be valid number"
                }
            }
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: false,
            set(value: string) {
                this.setDataValue('gender', value.toUpperCase());
            },
            validate: {
                isIn: { args: [["MALE", "FEMALE"]], msg: "Gender must be MALE or FEMALE" }
            }
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: false,
            validate: {
                len: { args: [4, 128], msg: "Email must be between 4 and 128 characters" },
                isEmail: { msg: "Email must be a valid email address" }
            }
        },
        contactNumber: {
            type: DataTypes.STRING(16),
            allowNull: false,
            validate: {
                len: { args: [10, 16], msg: "Contact number must be between 10 and 16 digits" }
            }
        },
        address: {
            type: DataTypes.STRING(256),
            allowNull: false,
            validate: {
                len: { args: [10, 256], msg: "Address must be between 10 and 256 characters" }
            }
        }
    }, { 
        sequelize,
        modelName: 'Customer',
        tableName: 'Customers'
    });

    return Customer;
};