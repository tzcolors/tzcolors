// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  tzColorsContract: 'KT1NiEWQgGmkyXbXFjViXbLghia6neMMyia3',
  tzColorsAuctionContract: 'KT1NqoJ7FubjmmBu75wHvTVBZ2WDeJdXQfRP',
  rpcUrl: 'https://testnet-tezos.giganode.io',
  appName: 'TzColors',
  proxyUrl: 'https://cors-proxy.airgap.prod.gke.papers.tech/proxy?url=',
  colorsBigmapUrl:
    'https://better-call.dev/v1/bigmap/delphinet/53849/keys?q=&offset=0',
  auctionBigmapUrl:
    'https://better-call.dev/v1/bigmap/delphinet/53847/keys?q=&offset=0',
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
