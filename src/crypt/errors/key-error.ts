import { AdscoreError } from "../../errors/adscore-error";
import { CryptErrorInterface } from "./crypt-error-interface";

export class KeyError extends AdscoreError implements CryptErrorInterface {}

