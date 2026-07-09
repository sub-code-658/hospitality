import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/axios";
import { useToast } from "../components/Toast";
import LoadingSpinner from "../components/LoadingSpinner";

export default function PaymentCallbackPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const data = searchParams.get("data");
    if (!data) {
      addToast("No payment data received", "error");
      setVerifying(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await api.post("/payments/verify", { encodedData: data });
        if (res.data.success) {
          setSuccess(true);
          addToast("Payment completed successfully!", "success");
        } else {
          addToast("Payment verification failed", "error");
        }
      } catch (error) {
        addToast(
          error.response?.data?.message || "Verification failed",
          "error",
        );
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-[color:var(--text-main)]/70 text-[color:var(--text-primary)]/70 text-sm">
          {t(
            "common.verifying_transaction_with_ese",
            "Verifying transaction with eSewa...",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="card p-8 max-w-md w-full text-center animate-scale-in">
        {success ? (
          <>
            <div className="w-16 h-16 rounded-full bg-[color:var(--surface-raised)] text-[color:var(--text-main)] flex items-center justify-center mx-auto mb-6 border border-green-500/30">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="font-serif text-3xl text-[color:var(--text-main)] text-[color:var(--text-primary)] mb-3">
              {t("common.payment_successful", "Payment Successful")}
            </h1>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
              {t(
                "common.your_transaction_has_been_secu",
                "Your transaction has been securely processed and verified. The worker will be notified.",
              )}
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="font-serif text-3xl text-[color:var(--text-main)] text-[color:var(--text-primary)] mb-3">
              {t("common.payment_failed", "Payment Failed")}
            </h1>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
              {t(
                "common.we_could_not_verify_your_payme",
                "We could not verify your payment. Please contact support or try again.",
              )}
            </p>
          </>
        )}
        <button
          onClick={() => navigate("/dashboard")}
          className="btn-primary w-full py-3.5"
        >
          {t("common.return_to_dashboard", "Return to Dashboard")}
        </button>
      </div>
    </div>
  );
}
