import { Op } from "sequelize";

export const buildSalesFilter = (userId: string,
  storeId: string,
  year: number,
  month?: number,
  week?: number
) => {
  let start: Date;
  let end: Date;

  // YEAR ONLY
  if (!month) {
    start = new Date(year, 0, 1);
    end = new Date(year, 11, 31);
  }

  // YEAR + MONTH
  else if (month && !week) {
    start = new Date(year, month - 1, 1);
    end = new Date(year, month, 0);
  }

  // YEAR + MONTH + WEEK
  else {
    const weekStart = (week! - 1) * 7 + 1;
    const weekEnd = week! * 7;

    start = new Date(year, month - 1, weekStart);
    end = new Date(year, month - 1, weekEnd);
  }

  return {
    fk_customer: userId,
    fk_store: storeId,
    createdAt: {
      [Op.between]: [start, end]
    }
  };
};