// @ts-nocheck
const startPayment = async () => {
  try {
    if (!isSignedIn || !user) {
      const shouldLogin = confirm("Please login to unlock premium features. Would you like to login now?");
      if (shouldLogin) {
        openSignIn();
      }
      return;
    }

    const clerkUserId = user.id;
    console.log("Clerk user ID:", clerkUserId);

    // 1️⃣ Create order
    const res = await fetch(
      "https://gopbaibklcxxccqinfli.supabase.co/functions/v1/create-razorpay-order",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 49900 }),
      }
    );

    const order = await res.json();
    if (!order.orderId) throw new Error("Order creation failed");

    // 2️⃣ Razorpay Checkout
    const rzp = new window.Razorpay({
      key: order.key || "rzp_test_Rx2I5u0o0EHnwe",
      amount: order.amount,
      currency: order.currency,
      name: "Finxbox Portfolio Pro",
      description: "Premium Portfolio Management (₹499)",
      order_id: order.orderId,
      handler: async (response) => {
        console.log("Payment success response:", response);
        
        // 3️⃣ Verify payment
        try {
          const verifyRes = await fetch(
            "https://gopbaibklcxxccqinfli.supabase.co/functions/v1/verify-razorpay-payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                clerk_user_id: clerkUserId, // Use clerk_user_id
              }),
            }
          );

          const verifyData = await verifyRes.json();
          console.log("Verification response:", verifyData);
          
          if (verifyData.success) {
            alert("🎉 Premium unlocked! Welcome to Portfolio Pro.");
            setIsPremium(true);
            setShowUpgradeModal(false);
            // Refresh page to update premium status
            setTimeout(() => window.location.reload(), 1500);
          } else {
            alert(`Payment verification failed: ${verifyData.error || "Unknown error"}`);
          }
        } catch (verifyError) {
          console.error("Verification error:", verifyError);
          alert("Verification failed. Please contact support with payment ID: " + response.razorpay_payment_id);
        }
      },
      prefill: {
        name: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        contact: user.primaryPhoneNumber?.phoneNumber || "",
      },
      theme: { 
        color: "#6366f1",
        hide_topbar: false 
      },
      modal: {
        ondismiss: function() {
          console.log("Checkout closed by user");
        }
      }
    });

    rzp.on('payment.failed', function (response) {
      console.error("Payment failed:", response.error);
      alert(`Payment failed: ${response.error.description || "Unknown error"}`);
    });

    rzp.open();
    
  } catch (err) {
    console.error("Payment error:", err);
    alert("Payment failed. Please try again.");
  }
};