function indent(str, prefix) {
  return str.replace(/\n(?!$)/g, `\n${prefix}`);
}

class PluginError extends Error {
  constructor(errors, schema, configuration) {
    super();

    this.name = "pluginError";

    this.errors = errors;

    this.headerName = configuration.name;

    this.baseDataPath = configuration.baseDataPath || "configuration";

    const header = `Invalid ${this.baseDataPath} object. ${
      this.headerName
    } has been initialized using ${getArticle(this.baseDataPath)} ${
      this.baseDataPath
    } object that does not match the API schema.\n`;

    this.message = `${header}${this.formatValidationErrors(errors)}`;

    Error.captureStackTrace(this, this.constructor);
  }
  formatValidationErrors(errors) {
    return errors
      .map((error) => {
        let formattedError = this.formatValidationError(error);

        return ` - ${formattedError}`;
      })
      .join("\n");
  }

  formatValidationError(error) {
    const { keyword, dataPath: errorDataPath } = error;

    const dataPath = `${this.baseDataPath}${errorDataPath}`;
    switch (keyword) {
      case "type": {
        const { parentSchema, params } = error; // eslint-disable-next-line default-case

        switch (params.type) {
          case "string":
            return `${dataPath} should be a ${this.getSchemaPartText(
              parentSchema
            )}`;

          case "boolean":
            return `${dataPath} should be a ${this.getSchemaPartText(
              parentSchema
            )}`;

          case "object":
            return `${dataPath} should be an object:${this.getSchemaPartText(
              parentSchema
            )}`;

          default:
            return `${dataPath} should be:\n${this.getSchemaPartText(
              parentSchema
            )}`;
        }
      }
      case "anyOf": {
        const { parentSchema, children } = error;

        return `${dataPath} should be one of these:\n${this.getSchemaPartText(
          parentSchema
        )}\nDetails:\n${children
          .map(
            (nestedError) =>
              ` * ${indent(this.formatValidationError(nestedError), "   ")}`
          )
          .join("\n")}`;
      }

      case "instanceof": {
        const { parentSchema } = error;
        return `${dataPath} should be an instance of ${this.getSchemaPartText(
          parentSchema
        )}`;
      }

      case "additionalProperties": {
        const { params, parentSchema } = error;
        const { additionalProperty } = params;
        return `${dataPath} has an unknown property '${additionalProperty}'. These properties are valid:\n${this.getSchemaPartText(
          parentSchema
        )}`;
      }
    }
  }
  getSchemaPartText(schema) {
    if (schema.anyOf) {
      return "";
    }
    if (schema.type) {
      return schema.type;
    }
    let str = "{";
    if (schema.properties) {
      Object.keys().forEach((item) => {
        str += item + "?,";
      });
    }
    if (schema.instanceof) {
      const { instanceof: value } = schema;
      const values = !Array.isArray(value) ? [value] : value;
      str += values
        .map((item) => (item === "Function" ? "function" : item))
        .join(" | ");
    }

    return `${str} }`;
  }
}

function getArticle(type) {
  if (/^[aeiou]/i.test(type)) {
    return "an";
  }

  return "a";
}

export default PluginError;
