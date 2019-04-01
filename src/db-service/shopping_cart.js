const { knex } = require("./knex");

exports.createCart = async (name, email) => {
  const result = await knex("shopping_carts")
    .insert({
      owner_name: name,
      owner_email: email
    })
    .returning(["id", "owner_email", "owner_name"]);
  return result[0];
};

exports.checkIfHasCart = async (email) => {
  const result = await knex("shopping_carts")
    .select("id")
    .where({ owner_email: email });
  return result.length > 0 ? true : false;
};

exports.addProductToCart = async (cartId, productId) => {
  const result = await knex("cart_products")
    .insert({
      shopping_cart_id: cartId,
      product_id: productId
    })
    .returning("*");
  return result[0];
};

exports.checkIfProductInCart = async (cartId, productId) => {
  const result = await knex("cart_products")
    .select("*")
    .where({ shopping_cart_id: cartId, product_id: productId });
  return result.length > 0 ? true : false;
};

exports.getCart = async (cartId, format = true) => {
  const rows = await knex("shopping_carts")
    .where("shopping_carts.id", cartId)
    .leftJoin(
      "cart_products",
      "shopping_carts.id",
      "cart_products.shopping_cart_id"
    )
    .leftJoin("products", "cart_products.product_id", "products.id")
    .select(
      "shopping_carts.id as cart_id",
      "shopping_carts.owner_email",
      "shopping_carts.owner_name",
      "products.*"
    );

  if (format) {
    let cartData = {
      owner_email: rows[0].owner_email,
      owner_name: rows[0].owner_name,
      shopping_cart_id: rows[0].id
    };

    let total = 0;

    let products =
      rows[0].id === null
        ? null
        : rows.map((row) => {
            let price = row.price;
            total += price;
            return {
              title: row.title,
              id: row.product_id,
              price,
              inventory: row.inventory_count
            };
          });
    return Object.assign({ products, total }, cartData);
  } else return rows;
};

// I was unsure how to handle item that had no inventory so for now I am leaving them in the cart :)
exports.checkoutCart = async (products) => {
  let queries = products.map((product) => {
    knex.transaction(function(t) {
      return knex("products")
        .transacting(t)
        .where({ id: product.id })
        .andWhere("inventory_count", ">", 0)
        .update({
          inventory_count: product.inventory_count - 1
        })
        .then(function() {
          if (product.inventory_count > 0) {
            return knex("cart_products")
              .transacting(t)
              .where({
                product_id: product.id
              })
              .returning("*")
              .del();
          }
        })
        .then(t.commit)
        .catch(t.rollback);
    });
  });
  return Promise.all(queries);
};

exports.productInventory = async (id) => {
  const rows = await knex("products")
    .select("inventory_count")
    .where({ id });
  return rows[0] || false;
};
