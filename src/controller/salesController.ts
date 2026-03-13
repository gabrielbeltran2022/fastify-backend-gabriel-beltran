import { Store } from "../models/storeModel";
import { Sales } from "../models/salesModel";
import { Product } from "../models/productModels";
import { FastifyRequest, FastifyReply } from 'fastify';
import { sendError } from '../utils/responseHelper';
import { Credential } from "../models/credentialsModel";
import { Customer } from "../models/customerModel";
import {buildSalesFilter} from '../utils/salesFilterHelper'

export const getSalesData = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Verify JWT
    await request.jwtVerify();
    const user = request.user as { id: string };
    const { storeId } = request.params as { storeId: string };

    // Fetch all sales for this store and customer
    const existingSales = await Sales.findAll({
      where: {
        fk_customer: user.id,
        fk_store: storeId
      },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "productName"] // fetch product name
        },
        {
          model: Credential,
          as: "customer",
          include: [
            {
              model: Customer,
              as: "customer",
              attributes: ["id", "fullname"] // fetch customer fullname
            }
          ],
          attributes: ["fk_customer"]
        }
      ],
      order: [["createdAt", "DESC"]] // latest transaction first
    });

    if (!existingSales || existingSales.length === 0) {
      return sendError(reply, "No available sales data for this store");
    }

    // Calculate total amount
    const totalAmount = existingSales.reduce((sum, sale) => sum + Number(sale.subTotal), 0);

    // Get latest transaction date
    const latestDate = existingSales[0].createdAt;

    // Flatten data for frontend
    const salesData = existingSales.map(sale => ({
        id: sale.id,
        transactionCode: sale.transactionCode,
        quantity: sale.quantity,
        subTotal: sale.subTotal,
        productName: sale.product?.productName,        // ✅ now recognized
        customerName: sale.customer?.customer?.fullname,
        createdAt: sale.createdAt
        }));
    return reply.send({
      success: "Success",
      code: 200,
      totalAmount,
      latestTransactionDate: latestDate,
      data: salesData
    });

  } catch (err) {
    return sendError(reply, err);
  }
};

//get Total sales of Store
export const getTotalSalesSummary = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    //await the payload 
    await request.jwtVerify();
    //destructure the payload and get the user id
    const user = request.user as { id: string };
    //get the store id from specific store
    const { storeId } = request.params as { storeId: string };

    //make a request from query if the condition is generating yearly,monthly,weekly
    const { year, month, week } = request.query as {
      year: string
      month?: string
      week?: string
    };
    //generate the from utility helpers if the data is year,month,week
    const filter = buildSalesFilter(
      user.id,
      storeId,
      Number(year),
      month ? Number(month) : undefined,
      week ? Number(week) : undefined
    );

    //total all sales and quantity base the result of filter if yearly,monthly,weekly
    const totalSales = await Sales.sum("subTotal", { where: filter });  
    const totalQuantity = await Sales.sum("quantity", { where: filter });

    return reply.send({
      success: true,
      data: {
        storeId,
        year,
        month: month ?? null,
        week: week ?? null,
        totalSales: totalSales || 0,
        totalQuantity: totalQuantity || 0
      }
    });

  } catch (err) {
    return sendError(reply, err);
  }
};