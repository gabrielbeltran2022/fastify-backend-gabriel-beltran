import { DataTypes, Model, Sequelize } from "sequelize";
import { v4 as uuidv4 } from 'uuid';


export class Credential extends Model {
    public id!: string;
    public fk_customer!: string;
    public password! : string;
    public isVerify!: boolean;
    public verificationCode!: string | null;
    public generatedCode!: string | null;
    public accessLevel!: number;

}
export const initCredential = (sequelize: Sequelize) => {
    Credential.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: () => uuidv4()
        },
        fk_customer: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true,
            references: {
                model: "Customers",
                key: "id"
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        },
        password: {
            type: DataTypes.STRING(128),
            allowNull: false,
             validate: {
                len: { args: [6, 128], msg: "Fullname must be between 3 and 128 characters" }
            }
        },
        isVerify: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        verificationCode: {
            type: DataTypes.STRING(12),
            allowNull: true
        },
        generatedCode: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        accessLevel: {
            type: DataTypes.INTEGER,
            defaultValue: 0, 
            allowNull: false,
            validate: {
                isIn: [[0, 1, 2]] 
            }
        }
    }, { 
        sequelize,
        modelName: 'Credential',
        tableName: 'Credentials',
    });

    return Credential;
};