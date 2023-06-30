import Mongoose from "../configs/connection.js";
const { model, Schema } = Mongoose;

const schemaOptions = {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
};
const categoriesSchema = new Schema(
  {
    name: String,
  },
  schemaOptions
);

export default model("Categories", categoriesSchema);
