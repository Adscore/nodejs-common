import { AdscoreError } from "../../errors/adscore-error";
import { SignatureErrorInterface } from "./signature-error.interface";

/**
 * Occurs usually when invalid decoder is applied to signature
 */
export class VersionError
  extends AdscoreError
  implements SignatureErrorInterface {}
