import { Literal, Fn, Col } from "sequelize/types/utils";
import { ServerRoute } from "@hapi/hapi"
import { Joi } from '../../config/routeImporter';
type RouteType = ServerRoute & {
  options: {
    validate: {
      validator: typeof Joi
    }
  }
}
type AttributeElement = string | [Literal, string] | [Fn, string] | [Col, string]
export {
  RouteType,
  AttributeElement
}