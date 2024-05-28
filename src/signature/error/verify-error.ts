import { SignatureErrorInterface } from "./signature-error.interface";

/**
 * Invalid or outdated signatures
 */
export class VerifyError extends Error implements SignatureErrorInterface {}
