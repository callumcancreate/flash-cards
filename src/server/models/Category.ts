import client from "../db";
import Resource from "./Resource";
import CategoryType from "../../types/Category";

export default class Category extends Resource {
  name: string;
  categoryId?: number;

  constructor(props: CategoryType) {
    super(props);
    const { values, errors } = this.validate(props);
    for (let key in values) this[key] = values[key];
  }

  async save() {
    if (this.categoryId) return this.patch();
    const { rows, rowCount } = await client.query(
      `
        INSERT INTO categories (name)
        VALUES ($1)
        RETURNING category_id "categoryId"
      `,
      [this.name]
    );
    if (!rowCount) throw new Error("Something went wrong");
    this.categoryId = rows[0].categoryId;
    console.log(this);
  }

  async patch() {
    console.log("PAtch");
    console.log(this);
  }
}

const cat = new Category({ name: "Test Cat" });
console.log(cat);
cat.save().then(res => cat.patch());
