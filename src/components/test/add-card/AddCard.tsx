"use client";

import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { showToast } from "@/components/global/showToast";
import { ApiResponse } from "@/types/common/api.types";
import { Shield, User, Mail, Copy, Check } from "lucide-react";
import api from "@/utils/axios/axios";
import { extractErrorMessage } from "@/utils/axios/extractErrorMessage";

interface SuccessData {
    customerId: string;
    email: string;
    name: string;
    paymentMethodId: string;
    setupIntentId: string;
    cardDetails?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
    };
}

interface PaymentMethodDetails {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
}

export default function AddCardForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] = useState(false);
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [creatingCustomer, setCreatingCustomer] = useState(false);

    // Dialog state
    const [showDialog, setShowDialog] = useState(false);
    const [successData, setSuccessData] = useState<SuccessData | null>(null);
    const [copied, setCopied] = useState(false);

    // Step 1: Create a Stripe customer
    const createCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !name) {
            showToast.error("Email and name are required");
            return;
        }

        setCreatingCustomer(true);
        try {
            const { data } = await api.post<ApiResponse<{ customerId: string }>>(
                "/test/stripe/create-customer",
                { email, name }
            );
            if (!data?.data?.customerId) throw new Error("No customerId returned");
            setCustomerId(data.data.customerId);
            showToast.success("Customer created! Now add your card.");
        } catch (error) {
            const message = extractErrorMessage(error);
            showToast.error(message);
        } finally {
            setCreatingCustomer(false);
        }
    };

    // Step 2 & 3: Create SetupIntent and confirm card
    const handleCardSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            showToast.error("Stripe is not initialized");
            return;
        }
        if (!customerId) {
            showToast.error("No customer found. Please create a customer first.");
            return;
        }

        setLoading(true);

        try {
            // 2. Get SetupIntent client secret
            const { data } = await api.post<ApiResponse<{ clientSecret: string }>>(
                "/test/stripe/create-setup-intent",
                { customerId }
            );
            console.log(data)
            if (!data?.data?.clientSecret) throw new Error("No clientSecret returned");
            const clientSecret = data.data.clientSecret;

            // Extract SetupIntent ID from clientSecret (format: seti_xxx_secret_xxx)
            const setupIntentId = clientSecret.split("_secret_")[0];

            // 3. Confirm the card setup
            const result = await stripe.confirmCardSetup(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                },
            });

            if (result.error) {
                showToast.error(result.error.message || "Card setup failed");
                return;
            }

            // Get the payment method ID from the confirmed SetupIntent
            const paymentMethodId = result.setupIntent?.payment_method as string;
            if (!paymentMethodId) throw new Error("No payment method returned");

            // (Optional) Fetch card details from your backend
            let cardDetails;
            try {
                const pmRes = await api.post<ApiResponse<PaymentMethodDetails>>(
                    "/test/stripe/get-payment-method-details",
                    { paymentMethodId }
                );
                if (pmRes.data?.data) {
                    cardDetails = pmRes.data.data;
                }
            } catch (err) {
                console.warn("Could not fetch card details", err);
            }

            // Prepare data for the success dialog
            setSuccessData({
                customerId,
                email,
                name,
                paymentMethodId,
                setupIntentId,
                cardDetails,
            });
            setShowDialog(true);

            // Reset form (optional)
            setCustomerId(null);
            setEmail("");
            setName("");
            elements.getElement(CardElement)?.clear();
        } catch (error) {
            const message = extractErrorMessage(error);
            showToast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Copy JSON to clipboard
    const handleCopyJson = () => {
        if (!successData) return;
        const jsonString = JSON.stringify(successData, null, 2);
        navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // If customer not created yet, show the email/name form
    if (!customerId) {
        return (
            <Card className="w-full max-w-lg mx-auto shadow-2xl border-slate-200/60">
                <CardHeader>
                    <CardTitle>Create a test customer</CardTitle>
                    <CardDescription>Enter details to get started</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={createCustomer} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <User className="h-4 w-4" /> Full Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Mail className="h-4 w-4" /> Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                placeholder="test@example.com"
                                required
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={creatingCustomer}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {creatingCustomer ? "Creating..." : "Create Customer"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        );
    }

    // Customer exists – show card form
    return (
        <>
            <Card className="w-full max-w-lg mx-auto shadow-2xl border-slate-200/60">
                <CardHeader>
                    <CardTitle>Add Payment Method</CardTitle>
                    <CardDescription>Securely save a test card</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCardSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Card Information</label>
                            <div className="p-4 border rounded-xl">
                                <CardElement
                                    options={{
                                        style: {
                                            base: { fontSize: "16px", color: "#1e293b" },
                                        },
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50">
                            <Shield className="h-5 w-5 text-emerald-600" />
                            <p className="text-sm">Your card is encrypted and secure</p>
                        </div>

                        <Button
                            type="submit"
                            disabled={!stripe || loading}
                            className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? "Adding card..." : "Add Card"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Success Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>✅ Card Added Successfully</DialogTitle>
                        <DialogDescription>
                            Here is all the information about the new payment method.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="bg-slate-50 p-4 rounded-md font-mono text-sm overflow-auto max-h-96">
                        <pre className="whitespace-pre-wrap break-words">
                            {JSON.stringify(successData, null, 2)}
                        </pre>
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setShowDialog(false)}>
                            Close
                        </Button>
                        <Button onClick={handleCopyJson} className="gap-2">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            {copied ? "Copied!" : "Copy JSON"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}