import { AdscoreError } from "../../errors/adscore-error";
import { CryptErrorInterface } from "./crypt-error-interface";

export class EncryptError extends AdscoreError implements CryptErrorInterface {}
