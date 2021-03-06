exports.up = async function(knex, Promise) {
  const exists = await knex.schema.hasTable("products");
  if (!exists) {
    return knex.schema
      .createTable("products", function(table) {
        table
          .uuid("id")
          .defaultTo(knex.raw("uuid_generate_v4()"))
          .primary();
        table
          .string("title")
          .notNullable()
          .unique();
        table.decimal("price", 14, 2).notNullable();
        table.integer("inventory_count", 14, 2).notNullable();
        table
          .timestamp("created_at")
          .notNullable()
          .defaultTo(knex.fn.now());
        table
          .timestamp("updated_at")
          .notNullable()
          .defaultTo(knex.fn.now());
      })
      .raw(`ALTER TABLE products ADD CHECK (inventory_count >= 0);`)
      .raw(
        `CREATE OR REPLACE FUNCTION update_row_modified_function_()
            RETURNS TRIGGER
            AS
            $$
            BEGIN
            NEW.updated_at = now();
            RETURN NEW;
            END;
            $$
            language 'plpgsql';
            `
      )
      .raw(
        `CREATE TRIGGER row_mod_on_set_slots_trigger_
            BEFORE UPDATE
            ON products
            FOR EACH ROW
            EXECUTE PROCEDURE update_row_modified_function_();
            `
      );
  }
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists("products");
};
