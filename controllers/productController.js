import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Cart from "../models/cartModel.js";
import asyncErrrorHandler from "../middlewares/asyncErrorHandler.js";
import ErrorHandler from "../utils/errorResponse.js";

//get all products
export const getAllProducts = asyncErrrorHandler(async (req, res, next) => {
  try {
    const products = await Product.find();
    res
      .status(200)
      .json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.log("Error in get Products", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get filtered product
export const filteredProducts = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { search, name, category, subcategory, gender, brand, sizechart, minPrice, maxPrice, tags } = req.query;

    // Construct tag filter
    let tagFilter = { $exists: true };
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      if (tagArray.length > 0) {
        tagFilter = { $in: tagArray };
      }
    }

    // Log the constructed tag filter
    console.log("Tag Filter:", tagFilter);
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);

    const keywordFilter = [];
    if (search) {
      const regex = new RegExp(search, 'i');
      keywordFilter.push({ name: regex });
      keywordFilter.push({ category: regex });
      keywordFilter.push({ subcategory: regex });
      keywordFilter.push({ brand: regex });
    }


    const pipeline = [
      // Search
      {
        $match: {
          ...(keywordFilter.length > 0 && { $or: keywordFilter }),
          ...(name && { name: { $regex: new RegExp(name, 'i') } }),
          ...(category && { category: new RegExp(`^${category}$`, 'i') }),
          ...(subcategory && { subcategory: new RegExp(`^${subcategory}$`, 'i') }),
          ...(gender && { gender: new RegExp(`^${gender}$`, 'i') }),
          ...(brand && { brand: new RegExp(`^${brand}$`, 'i') }),
          ...(sizechart && {
            size: { $in: sizechart.split(',').map((s) => new RegExp(s.trim(), 'i')) },
          }),
          ...(Object.keys(priceFilter).length > 0 && { price: priceFilter }),
          ...(tags && { tags: { $in: tags.split(',').map((tag) => new RegExp(tag.trim(), 'i')) } }),
        },
      },

      // Projection
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          price: 1,
          tags: 1,
          slug:1,
          images: 1,
          brand: 1,
          description: 1,
          specifications: 1,
        },
      },

      // Sorting
      { $sort: { price: 1 } },
    ];

    const products = await Product.aggregate(pipeline);
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.log("Error in Filtered Products", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get single product
export const getSingleProduct = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Product Not Found", 404));
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.log("Error in get Single Product", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

// add product to favorites
export const addToFavorites = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productId } = req.body;

    const user = await User.findById( id );
    if (!user) return next(new ErrorHandler("User not found", 404));

    const productIndex = user.favourites.findIndex((favourite) =>
      favourite.productId.equals(productId)
    );
    let action;

    if (productIndex === -1) {
      user.favourites.push({ productId }); 
      action = "added to";
    } else {
      user.favourites.splice(productIndex, 1);
      action = "removed from";
    }
    await user.save();
    res
      .status(200)
      .json({ message: `Product ${action} favorites`, data: user.favorites });
  } catch (error) {
    console.log("Error in Add to Favourites", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get favorite products
export const getFavourite = asyncErrrorHandler(async (req, res, next) => {
  try {
    console.log("Hitted");
    const { id } = req.params;
    const user = await User.findById(id ).populate('favourites.productId');
    console.log("user Favorites:",user.favourites);
    if (!user) return next(new ErrorHandler("User Not Found", 404));
    res.status(200).json({ success: true, data: user.favourites });
  } catch (error) {
    console.log("Error in get Favorites", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//add product to cart
export const addToCart = asyncErrrorHandler(async (req, res, next) => {
  try {
    const {id} =req.params;
    const {productId,quantity,size } = req.body;

    const product = await Product.findById({_id:productId});
    if (!product) 
      return next(new ErrorHandler("Product Not Found", 404));
    

    let cart = await Cart.findOne({ user: id });
    if (!cart) {
      cart = await Cart.create({ user: id });
    }

    const existingProduct = cart.products.find(
      (item) => item.product.toString() === productId
    );

    if (existingProduct) {
      cart.products = cart.products.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      cart.products.push({ product: productId,price:product.price ,quantity:quantity,size:size });
    }

    cart.totalPrice = cart.products.reduce(
      (total, item) => total + item.quantity * product.price,
      0
    );

    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.log("Error in Add to Cart", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//get cart products
export const getCartProducts = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const cart = await Cart.findOne({ user: id }).populate('products.product');
    if (!cart) return next(new ErrorHandler("User not found", 404));
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    console.log("Error in get Cart products", error.message);
    return next(new ErrorHandler(error.message, 500));
  }
});

//update cart quantity
export const updateCartQuantity = asyncErrrorHandler(async (req, res, next) => {
  try {
    const {userId } = req.params;
    const { productId, quantity } = req.body;
    
    const cart = await Cart.findOne({user:userId});
    if (!cart) return next(new ErrorHandler("Cart not found", 404));
    
    const cartItem = cart.products.find(
      (item) => item.product.toString() === productId
    );
    if (!cartItem)
      return next(new ErrorHandler("Product not found in cart", 404));
    
    cartItem.quantity = quantity;
    cart.totalPrice = cart.products.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
    await cart.save();
    res
      .status(200)
      .json({ success: true, message: "Quantity Updated", data: cart });
  } catch (error) {
    console.log("Error in Update cart quantity");
    return next(new ErrorHandler(error.message, 500));
  }
});


//remove cart products
export const removeFromCart = asyncErrrorHandler(async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { productId } = req.body;

    if (!userId || !productId) {
      return next(new ErrorHandler('Invalid user or product ID', 400));
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return next(new ErrorHandler('Cart not found', 404));
    }

    const productIndex = cart.products.findIndex(
      (cartItem) => cartItem.product.toString() === productId
    );

    if (productIndex === -1) {
      return next(new ErrorHandler('Product not found in cart', 404));
    }

    cart.products.splice(productIndex, 1);
    await cart.save();

    const newTotalPrice = cart.products.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );
    cart.totalPrice = newTotalPrice;
    cart.save();
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
