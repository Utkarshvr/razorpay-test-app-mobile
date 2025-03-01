import RazorpayCheckout from "react-native-razorpay";
import { Button, StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosInstance";

export default function TabOneScreen() {
  const [plans, setPlans] = useState([]);

  const fetchPlans = async () => {
    try {
      const { data } = await axiosInstance.get("/razorpay/plans");
      setPlans(data.items.filter((pl: any) => pl.id === "plan_ONnZ8V0e9HDcea"));
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchPlans();
  }, []);

  const onSubscribe = async (plan: any) => {
    try {
      const { data } = await axiosInstance.post("/razorpay/subscriptions", {
        plan_id: "plan_ONnZ8V0e9HDcea",
        userId: "user_2oAUxwAW5cAKEGosiRA358rhTgE",
      });
      console.log(data);

      if (data.short_url) {
        handlePaymentVerify(data, plan);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePaymentVerify = (data: any, plan: any) => {
    console.log(data.id, process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID);
    const options = {
      key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID!,
      subscription_id: data.id,
      name: plan.item.name,
      description: plan.item.description,
      amount: plan.item.amount,
      currency: "INR",

      theme: {
        color: "#5f63b8",
      },
    };

    RazorpayCheckout.open(options)
      .then(async (response) => {
        console.log(response);
        const { data: verifyData } = await axiosInstance.post(
          "payment/verify-subscription",
          {
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }
        );
        console.log({ verifyData });
      })
      .catch((error) => {
        // handle failure
        console.log(error);
        alert(`Error: ${error.code} | ${error.description}`);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plans</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />

      {plans.map((plan: any) => (
        <View key={plan.item.id} style={styles.card}>
          <Text style={{ fontSize: 24 }}>{plan.item.name}</Text>
          <Text style={{ fontSize: 18 }}>{plan.item.description}</Text>
          <Text style={{ fontSize: 16, fontWeight: "bold" }}>
            {plan.item.amount / 100}rs {plan.period}
          </Text>
          <Button title="Subscribe" onPress={() => onSubscribe(plan)} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  card: {
    gap: 4,
    backgroundColor: "#222",
    padding: 8,
    borderRadius: 12,
    width: "100%",
  },
});
