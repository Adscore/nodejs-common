import { AdscoreError } from "../../errors/adscore-error";
import { SignatureErrorInterface } from "./signature-error.interface";

/**
 * Malformed or truncated signatures
 */
export class SignatureParseError extends AdscoreError implements SignatureErrorInterface {}
