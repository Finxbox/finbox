import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/clerk-react";

export const useSubscription = () => {
  const { user } = useUser();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchSubscription = async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("is_premium")
        .eq("id", user.id)
        .single();

      setIsPremium(data?.is_premium || false);
      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  return { isPremium, loading };
};
