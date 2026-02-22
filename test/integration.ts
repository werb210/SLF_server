import axios from "axios";
import crypto from "crypto";

const payload = {
  id: "integration-test-1",
  product_family: "LOC",
  raw_payload: { amount: 12345 },
};

const signature = crypto
  .createHmac("sha256", process.env.HMAC_SECRET!)
  .update(JSON.stringify(payload))
  .digest("hex");

(async () => {
  const res = await axios.post("http://localhost:4001/deals", payload, {
    headers: {
      "x-api-key": process.env.API_KEY,
      "x-signature": signature,
      "x-idempotency-key": "test-key-1",
    },
  });

  console.log(res.data);
})();
