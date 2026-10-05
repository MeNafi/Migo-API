import config from "../config";
import { AppError } from "../utils/AppError";
import httpStatus from "http-status";

const baseUrl = () =>
  config.sslcommerz.is_live
    ? "https://securepay.sslcommerz.com"
    : "https://sandbox.sslcommerz.com";

export const isSslConfigured = () =>
  Boolean(config.sslcommerz.store_id && config.sslcommerz.store_password);

export const initSslCheckout = async (payload: {
  tranId: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productName?: string;
}) => {
  if (!isSslConfigured()) {
    throw new AppError(
      httpStatus.SERVICE_UNAVAILABLE,
      "SSLCommerz credentials are missing. Add SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWORD in .env"
    );
  }

  const body = new URLSearchParams({
    store_id: config.sslcommerz.store_id,
    store_passwd: config.sslcommerz.store_password,
    total_amount: payload.amount.toFixed(2),
    currency: payload.currency || "BDT",
    tran_id: payload.tranId,
    success_url: config.sslcommerz.success_url,
    fail_url: config.sslcommerz.fail_url,
    cancel_url: config.sslcommerz.cancel_url,
    ipn_url: config.sslcommerz.ipn_url,
    cus_name: payload.customerName,
    cus_email: payload.customerEmail,
    cus_phone: payload.customerPhone || "01700000000",
    cus_add1: "Dhaka",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    shipping_method: "NO",
    product_name: payload.productName || "Migo ride contribution",
    product_category: "RideShare",
    product_profile: "general",
  });

  const response = await fetch(`${baseUrl()}/gwprocess/v4/api.php`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const json = (await response.json()) as {
    status?: string;
    GatewayPageURL?: string;
    sessionkey?: string;
    failedreason?: string;
  };

  if (json.status !== "SUCCESS" || !json.GatewayPageURL) {
    throw new AppError(
      httpStatus.BAD_GATEWAY,
      json.failedreason || "Failed to initialize SSLCommerz checkout",
      json
    );
  }

  return {
    gatewayUrl: json.GatewayPageURL,
    sessionKey: json.sessionkey,
    raw: json,
  };
};

export const validateSslTransaction = async (valId: string) => {
  if (!isSslConfigured()) {
    throw new AppError(httpStatus.SERVICE_UNAVAILABLE, "SSLCommerz credentials are missing");
  }

  const url = `${baseUrl()}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(
    valId
  )}&store_id=${encodeURIComponent(config.sslcommerz.store_id)}&store_passwd=${encodeURIComponent(
    config.sslcommerz.store_password
  )}&format=json`;

  const response = await fetch(url);
  const json = (await response.json()) as {
    status?: string;
    tran_id?: string;
    amount?: string;
    currency?: string;
    val_id?: string;
    card_type?: string;
  };
  return json;
};
