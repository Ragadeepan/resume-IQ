import { HttpError } from "../utils/httpError.js";

export const validateRequest = (schema, source = "body") => (req, res, next) => {
  const parsed = schema.safeParse(req[source]);

  if (!parsed.success) {
    next(
      new HttpError(400, "Validation failed", {
        fieldErrors: parsed.error.flatten().fieldErrors
      })
    );
    return;
  }

  req[source] = parsed.data;
  next();
};

