import { AdscoreError } from "../../errors/adscore-error";
import { CryptErrorInterface } from "./crypt-error-interface";

export class DecryptError extends AdscoreError implements CryptErrorInterface {}

