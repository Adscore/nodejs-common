import { SignatureErrorInterface } from "./signature-error.interface";

/**
 * Occurs usually when invalid decoder is applied to signature
 */
export class VersionError extends Error implements SignatureErrorInterface {}
