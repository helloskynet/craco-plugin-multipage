import validate from "./validate";

const validateSchema = (schema, options) => {
  validate(schema, options, {
    name: "craco-plugin-multipage",
  });
};

export default validateSchema;
