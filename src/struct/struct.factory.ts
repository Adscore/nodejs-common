import { InvalidArgumentError } from "../errors/invalid-argument-error";
import { substr } from "../utils/php/substr";
import { AbstractStruct } from "./abstract-struct";
import { Json, JsonType } from "./json";
import { MsgpackType } from "./msgpack";
import { Rfc3986, Rfc3986Type } from "./rfc3986";
import { Serialize, SerializeType } from "./serialize";

export class StructFactory {
  /**
   * Return Struct class
   * @param string $name
   * @return AbstractStruct
   */
  public static create(name: string | Buffer): AbstractStruct {
    switch (name.toString()) {
      case SerializeType:
      case "Serialize":
      case "serialize":
        return new Serialize();

      case "I":
      case "Igbinary":
      case "igbinary":
        throw new Error(
          '`Igbinary` is not supported in NodeJS, please use different "Response signature algorithm" in Zone Settings'
        );

      case MsgpackType:
      case "Msgpack":
      case "msgpack":
        throw new Error("Not implemented yet");

      case JsonType:
      case "Json":
      case "json":
        return new Json();

      case Rfc3986Type:
      case "Rfc3986":
      case "rfc3986":
        return new Rfc3986();

      default:
        throw new InvalidArgumentError("Unsupported struct class");
    }
  }

  /**
   * Returns Struct class basing on payload
   * @param string $payload
   * @return AbstractStruct
   */
  public static createFromPayload(payload: string): AbstractStruct {
    const header = substr(payload, 0, 1);
    return StructFactory.create(header);
  }
}
