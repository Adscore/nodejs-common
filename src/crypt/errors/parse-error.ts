import { CryptErrorInterface } from "./crypt-error-interface";

export class CryptParseError extends Error implements CryptErrorInterface {}
