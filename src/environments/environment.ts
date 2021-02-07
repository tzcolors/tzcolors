// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  tzColorsContract: 'KT1HUpMGp2yH81smMhV54qDg9Kzhhs5C7q3T',
  tzColorsAuctionContract: 'KT1QRs3Q2vTDu6JJX1XeDJPCbkX8BHRuGs1E',
  rpcUrl: 'https://testnet-tezos.giganode.io',
  appName: 'tzcolors',
  proxyUrl: 'https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=',
  colorsBigmapUrl:
    'https://better-call.dev/v1/bigmap/delphinet/60541/keys?q=&offset=0&size=100',
  auctionBigmapUrl:
    'https://better-call.dev/v1/bigmap/delphinet/60539/keys?q=&offset=0&size=100',
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
