import { SignatureErrorInterface } from "./signature-error.interface";

/**
 * Malformed or truncated signatures
 */
export class SignatureParseError extends Error implements SignatureErrorInterface {}
