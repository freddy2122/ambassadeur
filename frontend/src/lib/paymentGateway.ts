import { apiRequest } from "@/lib/api";

export type PaymentGatewayConfig = {
  driver: string;
  label: string;
};

const DEFAULT_CONFIG: PaymentGatewayConfig = {
  driver: "geniuspay",
  label: "Genius Pay",
};

export async function fetchPaymentGatewayConfig(): Promise<PaymentGatewayConfig> {
  const res = await apiRequest<PaymentGatewayConfig>("/payments/config");
  if (res.error || !res.data) {
    return DEFAULT_CONFIG;
  }

  return {
    driver: res.data.driver || DEFAULT_CONFIG.driver,
    label: res.data.label || DEFAULT_CONFIG.label,
  };
}
