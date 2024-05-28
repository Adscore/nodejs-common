# nodejs-common

[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE.md)

This library provides various utilities for producing and parsing [Adscore](https://adscore.com) signatures,
generating custom request payloads, and virtually anything that might be useful for customers doing server-side
integration with the service.

## Compatibility

### V4 signature decryption

Signature V4 is not yet supported, see [Client Libs Node](https://github.com/Adscore/client-libs-node)

### Supported Signature v5 algorithms

1. `v5_0200H - OpenSSL CBC, HTTP query`
2. `v5_0200S - OpenSSL CBC, PHP serialize`
3. `v5_0201H - OpenSSL GCM, HTTP query`
4. `v5_0201S - OpenSSL GCM, PHP serialize`
5. `v5_0101H - sodium secretbox, HTTP query`
6. `v5_0101S - sodium secretbox, PHP serialize`
7. `v5_0200J - OpenSSL CBC, JSON`
8. `v5_0201J - OpenSSL GCM, JSON`
9. `v5_0101J - sodium secretbox, JSON`

### Currently supported Signature v5 algorithms

1. `v5_0101M - sodium secretbox, msgpack`
2. `v5_0200M - OpenSSL CBC, msgpack`
3. `v5_0201M - OpenSSL GCM, msgpack`
4. `v5_0101I - sodium secretbox, igbinary`
5. `v5_0200I - OpenSSL CBC, igbinary`
6. `v5_0201I - OpenSSL GCM, igbinary`

## Install

Via NPM

```bash
npm i @adscore/nodejs-common
```

Optional dependencies:

Use `npm i php-serialize` package for following algorithms:

1. `v5_0200S - OpenSSL CBC, PHP serialize`
2. `v5_0201S - OpenSSL GCM, PHP serialize`
3. `v5_0101S - sodium secretbox, PHP serialize`

Use `npm i sodium` package for following algorithms:

1. `v5_0101H - sodium secretbox, HTTP query`
2. `v5_0101S - sodium secretbox, PHP serialize`
3. `v5_0101M - sodium secretbox, msgpack`
4. `v5_0101J - sodium secretbox, JSON`

## Usage

### V5 signature decryption

V5 is in fact an encrypted payload containing various metadata about the traffic. Its decryption does not rely on IP
address nor User Agent string, so it is immune for environment changes usually preventing V4 to be even decoded.
Judge result is also included in the payload, but client doing the integration can make its own decision basing on
the metadata accompanying.

Zone has to be set explicitly to V5 signature, if you don't see the option, please contact support as we are rolling
this mode on customer's demand. The format supports a wide variety of encryption and serialization methods, some
of them are included in this repository, but it can be extended to fulfill specific needs.

It can be integrated in V4-compatible mode, not making use of any V5 features (see V4 verification):

```typescript
import {
  Signature5,
  SignatureParseError,
  VerifyError,
  VersionError,
} from "@adscore/nodejs-common/signature";
import { Judge } from "@adscore/nodejs-common/definition";
import { CryptParseError } from "@adscore/nodejs-common";
// only when using sodium based algorithms
import * as sodium from "libsodium-wrappers";

const cryptKey: Buffer = Buffer.from("<key>", "base64");
const signature: string = request.body.signature;
const userAgent: string = request.get("User-Agent") ?? "";
const ipAddresses: string[] = [request.socket.remoteAddress];

await sodium.ready; // only when using sodium based algorithms

try {
  const parser = Signature5.createFromRequest(
    signature,
    ipAddresses,
    userAgent,
    cryptKey
  );
  const result = parser.getResult();
  const humanReadable = Judge.RESULTS[result];
  const humanReadableResult =
    humanReadable["verdict"] + " (" + humanReadable["name"] + ")";

  console.log(humanReadableResult);
} catch (e) {
  if (e instanceof VersionError) {
    /*  It means that the signature is not the V5 one, check your zone settings and ensure the signatures
        are coming from the chosen zone. */
  }

  if (e instanceof CryptParseError || e instanceof SignatureParseError) {
    /*  It means that the signature metadata is malformed and cannot be parsed, or contains invalid data,
        check for corruption underway. */
  }

  if (e instanceof VerifyError) {
    /*  Signature could not be verified - see error message for details. */
  }
}
```

The first difference is that now `$cryptKey` may be also a `Closure` instance (lambda function), accepting single `int`
argument - zone ID and returning raw key as binary string.
This is useful in scenarios, where signatures coming from different zones are handled at a single point. This is not
possible for V4 signatures, as they do not carry over any zone information.

As we can see, `createFromRequest` also requires a list of IP addresses and User Agent string. This is used for
built-in verification routine, but this time the verification is completely unrelated to decryption. Client integrating
might want to replace the verification with its own implementation, so here is the extended example (without any
exception handling for readability):

```typescript
import { Signature5 } from "@adscore/nodejs-common/signature";
import * as sodium from "libsodium-wrappers";

await sodium.ready; // only when using sodium based algorithms

const signature: string = request.body.signature;
/*  An example structure holding keys for every zone supported */
const cryptKeys: Record<number, Buffer> = {
  123: Buffer.from("123456789abcdefghijklmn", "base64"),
};
const parser = new Signature5();
/*  Parsing/decryption stage */
parser.parse(signature, (zoneId: number | bigint) => {
  // Cast to number as bigint cannot be index type in TS yet, see: https://github.com/microsoft/TypeScript/issues/46395
  if (!cryptKeys[zoneId as number]) {
    throw new Error("Unsupported zone " + zoneId);
  }

  return cryptKeys[zoneId as number];
});
/*  The payload now contains a decrypted signature data which might be used to verify the signature */
const payload = parser.getPayload();
/*  We can still make use of built-in signature validator and only then getResult() is being populated */
const userAgent = request.get("User-Agent") ?? "";
const ipAddresses = [request.socket.remoteAddress];
parser.verify(ipAddresses, userAgent);
const result = parser.getResult();
```

The `result` field and its associated `getResult()` getter method return result score only after a successful `verify()`
call. This is expected behavior, to preserve compliance with V4 behavior - the result is only valid when it's proven
belonging to a visitor.
For custom integrations not relying on built-in verification routines (usually more tolerant), the result is present
also in payload retrieved via `getPayload()` call, but it's then the integrator's reponsibility to ensure whether
it's trusted or not. When desired validation is more strict than the built-in one, the `verify()` can be called first,
populating `getResult()` value, and after that any additional verification may take place.

Note: V4 signature parser also holds the payload, but it does not contain any useful informations, only timestamps and
signed strings; especially - it does not contain any Judge result value, it is derived from the signature via several
hashing/verification approaches.

## Integration

Any questions you have with custom integration, please contact our support@adscore.com. Please remember that we do
require adequate technical knowledge in order to be able to help with the integration; there are other integration
methods which do not require any, or require very little programming.
