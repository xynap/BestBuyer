import { SNS } from "aws-sdk";
import { ChromiumBrowser, chromium } from "playwright-core";

const DEFAULT_TIMEOUT = 60 * 1000;
const NOTIFICATION_COOLDOWN = 5 * 60 * 1000;
const PHONE_NUMBERS = process.env.PHONE_NUMBERS?.split(",") || [];
const PRODUCT_SKUS = process.env.PRODUCT_SKUS?.split(",") || [];

const products = new Map<string, number>();
const sns = new SNS();

const checkProducts = async (browser: ChromiumBrowser) => {
  for (const productSku of PRODUCT_SKUS) {
    const lastDetected = products.get(productSku);

    if (!lastDetected || lastDetected + NOTIFICATION_COOLDOWN < Date.now()) {
      const page = await browser.newPage();
      page.setDefaultTimeout(DEFAULT_TIMEOUT);

      try {
        console.log(`Checking product SKU ${productSku} ...`);
        await page.goto(`https://www.bestbuy.com/site/${productSku}.p`, {
          waitUntil: "domcontentloaded"
        });

        const button = await page.$(".add-to-cart-button");
        if (button && (await button.textContent()) === "Add to Cart") {
          console.log(`Product SKU ${productSku} is in stock!`);
          const productName = await page.textContent(".sku-title");

          await Promise.all(
            PHONE_NUMBERS.map(phoneNumber =>
              sns
                .publish({
                  Message: `${productName} is in stock!\n\nbestbuy://site/${productSku}.p`,
                  PhoneNumber: phoneNumber
                })
                .promise()
            )
          );

          products.set(productSku, Date.now());
        }
      } catch (e) {
        console.error(`Failed to check product SKU ${productSku}.`, e);
      } finally {
        page.close();
      }
    }
  }

  setTimeout(() => checkProducts(browser));
};

(async () => {
  console.log("Launching browser ...");
  const browser = await chromium.launch();

  setTimeout(() => checkProducts(browser));
})();
