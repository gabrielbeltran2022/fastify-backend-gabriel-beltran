import { DataTypes, Model, Sequelize } from "sequelize";
import { v4 as uuidv4 } from 'uuid';

export class Product extends Model {
    public id!: string;
    public  productName!: string;
    public  price!: number;
    public brand!: string;
    public  category!: string;
    public subCategory!: string;
    public tag!: string[];
    public stock!: number;
    public sku!: string;
    public dimension!: string;
    public fk_store!: string;
}

export const initProduct = (sequelize: Sequelize) => {
    Product.init({
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
            defaultValue: () => uuidv4()
        },
        productName: {
            type: DataTypes.STRING(256),
            allowNull: false,
            validate: {
                len: { args: [3, 128], msg: "Product name must be between 3 and 256 characters" }
            }
        },
        price: {
            type: DataTypes.DECIMAL(10, 2), 
            allowNull: false,
            defaultValue: 0.00
        },
        brand: {
            type: DataTypes.STRING(128),
            allowNull: false,
            validate: {
                 len: { args: [3, 128], msg: "Brand must be between 3 and 128 characters" },
            }
        },
        category: {
            type: DataTypes.STRING(128),
            allowNull: false,
            validate: {
                len: { args: [3, 128], msg: "Category must be between 3 and 128 characters" },
            }
        },
        subCategory: {
            type: DataTypes.STRING(128),
            allowNull: false,
            validate: {
                len: { args: [3, 128], msg: "Subcategory must be between 3 and 128 digits" }
            }
        },
        tag: {
            type: DataTypes.JSONB,
            defaultValue: []
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        sku: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true
            }
        },
        dimension: {
            type: DataTypes.STRING(128),
            allowNull: false,
            validate: {
                len: { args: [3, 128], msg: "Dimension must be between 3 and 128 digits" }
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        fk_store: {
            type: DataTypes.STRING(128),
            allowNull: false,
            references: {
                model: "Stores",
                key: "id"
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        }
    }, { 
        sequelize,
        modelName: 'Product',
        tableName: 'Products'
    });

    return Product;
};