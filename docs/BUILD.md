# Build Notes

## Release Build

```sh
npm install
npm run build:release
npm run test:deeplx
```

`build:release` performs the following:

1. Verifies `vendor/Translate.response.v1.7.5.bundle.js` against the official
   Universal v1.7.5 SHA-256.
2. Inserts the restored `DeepLX()` method at an exact, validated class-method
   boundary.
3. Copies official Universal v1.7.5 and YouTube v1.5.11 bundles unchanged.
4. Rewrites only `script-providers.url` values in the two official complete
   `.stoverride` inputs to target this fork's release.
5. Rejects generated configurations that retain an official DualSubs release
   URL.

The Stash contract test runs the generated bundle in a minimal simulated Stash
`$httpClient` runtime. It verifies a DeepLX request's method, endpoint,
Authorization header, JSON body, `code/data` response parser, and completed
subtitle response.

## Full Upstream Source Build

`npm run build` remains the upstream Rspack command. It currently cannot finish
from publicly available source because the v1.7.5 gitlink
`src/protobuf@7343c3d657ba2877a329f2cee98011829bf71242` points to the deleted
or private `DualSubs/protobuf` repository. The fork retains the upstream
submodule declaration and does not substitute generated protobuf code.

The package dependencies `NSNanoCat/URL v1.2.5` and `NSNanoCat/util v1.8.10`
are resolved from public GitHub codeload tarballs, so `npm install` does not
require a GitHub Packages token.
