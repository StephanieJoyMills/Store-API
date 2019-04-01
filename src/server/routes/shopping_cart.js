const {
  createCart,
  checkIfHasCart,
  checkIfProductInCart,
  addProductToCart,
  getCart,
  productInventory,
  checkoutCart
} = require("../../db-service");

module.exports = async function(app) {
  app.patch("/cart/:cart_id/checkout", async (req, res, next) => {
    const cartId = req.params.cart_id;

    try {
      const products = await getCart(cartId, false);

      if (products[0].id === null) {
        res.send({ err: "cart is empty" });
        return;
      }
      if (workerTrigger()) {
        res.sent({ err: "bad worker" });
      }
      await checkoutCart(products);
      res.sendStatus(204);
    } catch (err) {
      console.log(
        {
          err
        },
        "Failed to checkout cart"
      );
      next(err);
    }
  });

  app.get("/cart/:cart_id", async (req, res, next) => {
    const cartId = req.params.cart_id;

    try {
      const cart = await getCart(cartId);
      res.send(cart);
    } catch (err) {
      console.log(
        {
          err
        },
        "Failed to retrieve cart data"
      );
      next(err);
    }
  });

  app.post("/cart/create", async (req, res, next) => {
    const { name, email } = req.body;
    try {
      // check if email already attached to cart
      const hasCart = await checkIfHasCart(email);
      if (hasCart) {
        const err = { err: `${email} already has a cart` };
        console.log(err);
        res.status(400).send(err);
        return;
      }

      const cart = await createCart(name, email);
      console.log(`Cart created!`);
      res.send(cart);
    } catch (err) {
      console.log(
        {
          err
        },
        "Failed to ceate a cart"
      );
      next(err);
    }
  });

  app.post("/cart/:cart_id/product/:product_id", async (req, res, next) => {
    const cartId = req.params.cart_id;
    const productId = req.params.product_id;
    console.log(cartId);
    try {
      const currentInventory = await productInventory(productId);
      console.log(currentInventory);

      if (!currentInventory) {
        const err = { err: `Product:${productId} is an invalid item` };
        console.log(err);
        res.status(404).send(err);
      }

      if (currentInventory.inventory_count < 1) {
        const err = { err: `Product:${productId} is out of stock` };
        console.log(err);
        res.status(400).send(err);
        return;
      }
      // check if already in cart
      const inCart = await checkIfProductInCart(cartId, productId);
      if (inCart) {
        const err = { err: `Item already in cart` };
        console.log(err);
        res.status(400).send(err);
        return;
      }

      const addToCart = await addProductToCart(cartId, productId);
      res.send(addToCart);
    } catch (err) {
      console.log(
        {
          err
        },
        "Failed to add item to cart"
      );
      next(err);
    }
  });
};

function workerTrigger() {
  const cluster = require("cluster");
  if (cluster.isMaster) {
    // Master
    const worker = cluster.fork();

    worker.on("message", function(message) {
      console.log("worker got message:", message);
    });
  } else if (cluster.isWorker) {
    // Worker
    process.send("sending worker to master");
  }
}
