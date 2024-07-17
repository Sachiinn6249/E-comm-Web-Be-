import Product from "../models/productModel.js";

const getTotalAmount = async (cart) => {
  let totalAmount = 0;
  for (const item of cart) {
    const product = await Product.findById(item.productId);
    if (!product)
      throw new Error(`Product not found for ID: ${item.productId}`);

    if (typeof item.quantity !== "number" || item.quantity <= 0) {
      throw new Error(`Invalid quantity for product ID: ${item.product}`);
    }
    totalAmount += product.price * item.quantity;
  }
  return totalAmount;
};

export default getTotalAmount;
