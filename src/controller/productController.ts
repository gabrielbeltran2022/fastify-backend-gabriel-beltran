import { FastifyRequest, FastifyReply } from 'fastify';
import { sendError } from '../utils/responseHelper';
import { Product } from '../models/productModels'
import {validateProductUnique } from '../services/productValidation'
import { sanitizeProductData } from '../utils/santinizeHelper';
import { generatedUniqueSku,generateTransactionCode } from '../services/generateProductCode';
import { Store } from '../models/storeModel';
import { Sales } from '../models/salesModel';
import { Op } from "sequelize";

export const getProductPagination = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        //initialization of request from cookie
        await request.jwtVerify();
        const user = request.user as { id: string };
        //getting the request from the user
        const { storeId } = request.params as { storeId: string };
         //sorting the the page 1 - 10 pages
        const { page = 1, limit = 10 } = request.query as { page?: number, limit?: number };

        const pageNumber = Math.max(1, Number(page) || 1);
        const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));

        //limting the return data from the page
        const offset = (pageNumber - 1) * limitNumber;

        // Verify store ownership
        const storeExists = await Store.findOne({
            where: { id: storeId, fk_customer: user.id }
        });

        if (!storeExists) {
            return sendError(reply, "Store not found or unauthorized access!", 404);
        }
        //access the product list
        const { count, rows } = await Product.findAndCountAll({
            where: { fk_store: storeId },
            limit: limitNumber,
            offset,
            order: [['productName', 'DESC']]
        });

        //creating of total page 
        const totalPages = Math.ceil(count / limitNumber);
        //validation of page is empty return error
        if (pageNumber > totalPages && totalPages !== 0) {
            return sendError(reply, `Page ${pageNumber} does not exist. Total pages: ${totalPages}`, 404);
        }
        

        return reply.code(200).send({
            status: "success",
            totalItems: count,
            totalPages,
            currentPage: pageNumber,
            pageSize: limitNumber,
            data: rows
        });

    } catch (err) {
        return sendError(reply, err);
    }
};



export const createProduct = async (request: FastifyRequest, reply: FastifyReply) => {
    try{
        await request.jwtVerify()
        const user = request.user as {id : string}
        //getting the request body
       const {storeId,...product} = request.body as any
        // Verify that the store exists AND belongs to this user
        const existingStore = await Store.findOne({
            where: { 
                id: storeId, 
                fk_customer: user.id 
            }
        });

        if (!existingStore) {
            return sendError(reply, "Store not found or unauthorized access!", 404);
        } 
       //clean all the white spaces in body
        const cleanData = sanitizeProductData(product)
    
        //generate a unique serial for product
        const generatedSKU = await generatedUniqueSku(reply,cleanData.sku)
        if(generatedSKU == null) return;

        //validate the product if no same sku
        const isValid = await validateProductUnique(reply,generatedSKU)
        if(!isValid) return;

        //reassign the generated sku
        cleanData.sku = generatedSKU

       const createProduct = await Product.create({
        ...cleanData,
        fk_store: existingStore.id
       })
       
       return reply.send({status:"Success",code:200,data: createProduct,msg: "Product is successfully created!"})

    }catch(err){
        return sendError(reply,err)
    }
}

export const deleteProduct = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
        const user = request.user as { id: string };
        const { id } = request.params as { id: string };

        const existingProduct = await Product.findOne({
            where: { id },
            include: [{
                model: Store,
                required: true,
                where: { fk_customer: user.id },
                attributes: []
            }]
        });

        if (!existingProduct) {
            return sendError(reply, "Product not found or unauthorized!", 404);
        }

        await existingProduct.destroy();

        return reply.send({
            status: "Success",
            code: 200,
            message: "Product deleted!"
        });

    } catch (err) {
        return sendError(reply, err);
    }
};export const updateProduct = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        await request.jwtVerify();
        const user = request.user as { id: string };
        
        //  Get storeId from the URL params
        const { storeId } = request.params as { storeId: string };
        const { id, ...updateData } = request.body as any;

        //  Validate IDs
        if (!id || !Array.isArray(id) || id.length === 0) {
            return sendError(reply, "No product selected to update!", 400);
        }

        const filteredUpdateData = Object.fromEntries(
            Object.entries(updateData).filter(([_, value]) => value !== undefined)
        );

        // Verify this specific store belongs to this user
        const store = await Store.findOne({
            where: { 
                id: storeId, 
                fk_customer: user.id 
            }
        });

        if (!store) {
            return sendError(reply, "Store not found or unauthorized access!", 404);
        }

        // Update using the validated storeId
        const [updatedCount] = await Product.update(filteredUpdateData, {
            where: {
                id: { [Op.in]: id },
                fk_store: store.id // Using the verified store ID
            },
            individualHooks: true
        });

        if (updatedCount === 0) {
            return sendError(reply, "Products not found in this store!", 404);
        }

        return reply.send({
            status: "Success",
            code: 200,
            updatedRows: updatedCount,
            message: "Product successfully updated"
        });

    } catch (err) {
        return sendError(reply, err);
    }
};
export const purchaseProduct = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
    const user = request.user as { id: string };
    const { storeId } = request.params as { storeId: string };
    const { fk_product } = request.body as { fk_product: { id: string; quantity: number }[] };

    if (!fk_product || fk_product.length === 0) {
      return sendError(reply, "No products provided", 400);
    }

    // Validate store
    const store = await Store.findOne({ where: { id: storeId, fk_customer: user.id } });
    if (!store) {
      return sendError(reply, "Store does not exist", 404);
    }

    const salesToCreate: any[] = [];

    for (const item of fk_product) {
      if (!item.id || item.quantity < 1) {
        return sendError(reply, "Invalid product ID or quantity", 400);
      }

      const product = await Product.findOne({ where: { id: item.id, fk_store: storeId } });
      if (!product) {
        return sendError(reply, `Product ${item.id} not found`, 404);
      }

      if (product.stock < item.quantity) {
        return sendError(reply, `Insufficient stock for ${product.productName}`, 400);
      }

      const subTotal = Number(product.price) * item.quantity;
      const transactionCode = await generateTransactionCode();

      if(!transactionCode) 
      return sendError(reply,'Transaction Code is not generated!',400)

      salesToCreate.push({
        fk_product: product.id,
        fk_store: storeId,
        fk_customer: user.id,
        quantity: item.quantity,
        price: product.price,
        transactionCode: transactionCode,
        subTotal
      });

      // Deduct stock immediately
      product.stock -= item.quantity;
      await product.save();
    }

    // Insert all sales
    const createdSales = await Sales.bulkCreate(salesToCreate);
    
    // Prepare response with product names
    const response = createdSales.map((sale) => {
      const product = fk_product.find(p => p.id === sale.fk_product);
      return {
        id: sale.id,
        product: {
          id: sale.fk_product  
        },
        quantity: sale.quantity,
        price: sale.price,
        subTotal: sale.subTotal
      };
    });

    const total = response.reduce((acc, s) => acc + Number(s.subTotal), 0);

    return reply.send({
      status: "Success",
      code: 200,
      data: response,
      total
    });

  } catch (err: any) {
    return sendError(reply, err.message || err);
  }
};