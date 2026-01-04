import { useState, useEffect, useCallback } from "react";
import { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getUserErrorMessage } from "@/utils/error";
import { LoginFormInput, SignUpFormInput } from "../domain";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [user, setUser] = useState<User | null>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (e: AuthChangeEvent, session: Session | null) => {
        try {
          if (!session?.user) {
            setUser(null);
          } else {
            setUser(session.user);
          }

          setError(null);
        } catch (error) {
          setError(getUserErrorMessage(error));
        } finally {
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up new user
  const signup = useCallback(
    async (data: SignUpFormInput): Promise<User | null> => {
      try {
        const { email, password } = data;
        const {
          data: { user },
          error,
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: data.first_name,
              last_name: data.last_name,
            },
          },
        });
        if (error) {
          throw error;
        }
        return user;
      } catch (error) {
        setError(getUserErrorMessage(error));
        throw error;
      }
    },
    []
  );

  // Sign in existing user
  const login = useCallback(
    async (data: LoginFormInput): Promise<User | null> => {
      try {
        setIsLoading(true);
        const { email, password } = data;
        const {
          data: { user },
          error,
        } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        return user;
      } catch (error) {
        setError(getUserErrorMessage(error));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Sign out current user
  const signOut = useCallback(async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      router.replace("/auth/login");
    } catch (error) {
      setError(getUserErrorMessage(error));
      throw error;
    }
  }, [router]);

  // Send password reset email
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      await supabase.auth.resetPasswordForEmail(email);
    } catch (error) {
      setError(getUserErrorMessage(error));

      throw error;
    }
  }, []);

  // Update user password
  const updatePassword = useCallback(
    async (newPassword: string): Promise<void> => {
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch (error) {
        setError(getUserErrorMessage(error));

        throw error;
      }
    },
    []
  );

  // Reauthenticate user
  const reauthenticate = useCallback(async (): Promise<void> => {
    try {
      await supabase.auth.reauthenticate();
    } catch (error) {
      setError(getUserErrorMessage(error));
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if user is authenticated
  const isAuthenticated = user !== null;

  return {
    user,
    isLoading,
    error,
    isAuthenticated,

    signup,
    login,
    signOut,
    resetPassword,
    updatePassword,
    reauthenticate,
    clearError,
  };
}

export type UseAuthReturn = ReturnType<typeof useAuth>;
