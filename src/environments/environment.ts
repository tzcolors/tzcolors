// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  tzColorsContract: 'KT1FyaDqiMQWg7Exo7VUiXAgZbd2kCzo3d4s',
  tzColorsAuctionContract: 'KT1CpeSQKdkhWi4pinYcseCFKmDhs5M74BkU',
  rpcUrl: 'https://mainnet-tezos.giganode.io',
  appName: 'tzcolors',
  colorsBigmapUrl:
    'https://bcd-proxy.prod.gke.papers.tech/v1/bigmap/mainnet/411/keys?q=&offset=0&size=10000',
  auctionBigmapUrl:
    'https://bcd-proxy.prod.gke.papers.tech/v1/bigmap/mainnet/409/keys?q=&offset=0&size=10000',
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
