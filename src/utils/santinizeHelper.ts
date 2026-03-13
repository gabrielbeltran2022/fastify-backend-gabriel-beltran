
/*CUSTOMER*/ 
// Helper functions for cleaning specific types of data
const rules = {
  cleanString: (str: string) => str?.trim().replace(/\s+/g, ' ') || '',
  stripAllSpaces: (str: string) => str?.replace(/\s+/g, '') || '',
  cleanEmail: (email: string) => email?.toLowerCase().trim() || ''
};

export const sanitizeCustomerData = (raw: any) => {
  return {
    fullname: rules.cleanString(raw.fullname),
    age: Number(raw.age) || 0,
    gender: rules.cleanString(raw.gender),
    email: rules.cleanEmail(raw.email),
    contactNumber: rules.stripAllSpaces(raw.contactNumber),
    address: rules.cleanString(raw.address)
  };
};
/*PRODUCT*/ 
const productRules = {
  cleanString: (str: string) => str?.trim().replace(/\s+/g, ' ') || '',
  // Assuming price and numeric values should be forced to numbers
  toNumber: (val: any) => Number(val) || 0,
  // Custom rule for tag arrays (cleaning each string in the array)
  cleanTags: (tags: string[]) => Array.isArray(tags) ? tags.map(t => t.trim().toLowerCase()) : []
};

export const sanitizeProductData = (raw: any) => {
  return {
    productName: productRules.cleanString(raw.productName),
    price: productRules.toNumber(raw.price),
    brand: productRules.cleanString(raw.brand),
    category: productRules.cleanString(raw.category),
    subCategory: productRules.cleanString(raw.subCategory),
    tag: productRules.cleanTags(raw.tag),
    sku: productRules.cleanString(raw.sku),
    dimension: productRules.cleanString(raw.dimension),
    stock: productRules.toNumber(raw.stock)
  };
};

/* AUTH / LOGIN DATA SANITIZATION */
const authRules = {
    cleanString: (str: string) => str?.trim().replace(/\s+/g, ' ') || '',
    cleanEmail: (email: string) => email?.toLowerCase().trim() || '',
    cleanPassword: (password: string) => password?.trim() || ''
};

export const sanitizeAuthData = (raw: any) => {
    return {
        email: authRules.cleanEmail(raw.email),
        password: authRules.cleanPassword(raw.password)
    };
};

/* STORE & ACCESS DATA SANITIZATION */
const storeRules = {
  // Ensures userId is treated as a clean alphanumeric ID
  cleanId: (id: string) => id?.trim() || '',
  // Ensures level is strictly a number (defaulting to 0 if invalid)
  cleanLevel: (val: any) => {
    const num = Number(val);
    return [0, 1, 2].includes(num) ? num : 0;
  }
};

export const sanitizeStoreAccessData = (raw: any) => {
  return {
    userId: storeRules.cleanId(raw.userId),
    accessLevel: storeRules.cleanLevel(raw.accessLevel)
  };
};

/* SALES / PURCHASE DATA SANITIZATION */
const salesRules = {
  // Ensure the ID is a clean string
  cleanId: (id: any) => String(id).trim(),
  
  // Helper to generate a unique transaction code
  generateTrxCode: () => `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
};

export const sanitizeSalesData = (raw: any) => {
  // If request.body is the array itself, or if it's inside a property
  const sourceArray = Array.isArray(raw) ? raw : (raw.productIds || []);

  return {
    // 1. Map through the IDs and clean them
    // 2. Filter out any empty strings or nulls
    productIds: sourceArray
      .map((id: any) => salesRules.cleanId(id))
      .filter((id: string) => id.length > 0),
      
    // Create a single code for this specific checkout session
    transactionCode: salesRules.generateTrxCode()
  };
};