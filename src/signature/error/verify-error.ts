import { AdscoreError } from "../../errors/adscore-error";
import { SignatureErrorInterface } from "./signature-error.interface";

/**
 * Invalid or outdated signatures
 */
export class VerifyError extends AdscoreError implements SignatureErrorInterface {}
