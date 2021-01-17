# BestBuyer
A simple bot that notifies you when a product is in stock at Best Buy.

## Developing locally
Make sure the Playwright Chromium binary is installed locally. One way to do this is:
```bash
npm install playwright-chromium
```

Get the SKU from the Best Buy [product page](https://www.bestbuy.com/site/6429440.p) and set it as an environment variable:
```bash
export PRODUCT_SKUS='<Best Buy SKUs>'
```

Start the bot:
```bash
npm start
```

## Deploying to production
Make sure AWS CDK is setup by following the [getting started](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html#getting_started_prerequisites) and [bootstrapping](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html#bootstrapping-howto) guides. You'll also need to install [Docker](https://www.docker.com/products/docker-desktop).

Get the SKU from the Best Buy [product page](https://www.bestbuy.com/site/6429440.p).

Deploy the bot to your account:
```bash
npm run deploy --sku='<Best Buy SKUs>' --phone='<E.164 formatted phone numbers>'
```

You can watch multiple SKUs, or send notifications to multiple phone numbers, by providing comma delimited lists.
