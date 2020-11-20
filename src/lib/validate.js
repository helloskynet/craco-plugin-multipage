import Ajv from "ajv";
import AjvKeywords from "ajv-keywords";
import PluginError from "./pluginError";

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  $data: true,
});

AjvKeywords(ajv, ["instanceof"]);

function validateObject(schema, options) {
  const compiledSchema = ajv.compile(schema);
  const valid = compiledSchema(options);
  if (valid) {
    return [];
  }
  return compiledSchema.errors ? filterErrors(compiledSchema.errors) : [];
}

function filterErrors(errors) {
  let newErrors = [];

  for (const error of errors) {
    const { dataPath } = error;
    let children = [];
    newErrors = newErrors.filter((oldError) => {
      if (oldError.dataPath.includes(dataPath)) {
        if (oldError.children) {
          children = children.concat(oldError.children.slice(0));
        }
        oldError.children = undefined;
        children.push(oldError);
        return false;
      }
      return true;
    });

    if(children.length){
      error.children = children;
    }
    newErrors.push(error);
  }
  return newErrors;
}

function validate(schema, options, configuration) {
  const errors = validateObject(schema, options);
  if (errors.length > 0) {
    throw new PluginError(errors, schema, configuration);
  }
}

export default validate;
