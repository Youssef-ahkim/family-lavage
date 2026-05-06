"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { getProfile } from "@/app/actions/auth";

// ─────────────────────────────────────────────────────────
// CLIENT-SIDE PROFILE CACHE
// Stores profile data in React context so navigating 
// between pages doesn't trigger a new server action call.
// Data is kept for 60s before being considered stale.
// ─────────────────────────────────────────────────────────

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  plate: string;
  role: string;
}

interface ProfileContextType {
  profile: ProfileData | null;
  isLoading: boolean;
  /** Fetch profile (returns cached if fresh, else fetches from server) */
  fetchProfile: () => Promise<ProfileData | null>;
  /** Force-clear the cache (e.g. on logout) */
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const STALE_AFTER_MS = 60 * 1000; // 60 seconds

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastFetchRef = useRef(0);
  const fetchPromiseRef = useRef<Promise<ProfileData | null> | null>(null);

  const fetchProfile = useCallback(async (): Promise<ProfileData | null> => {
    const now = Date.now();

    // Return cached data if it's still fresh
    if (profile && now - lastFetchRef.current < STALE_AFTER_MS) {
      return profile;
    }

    // Deduplicate concurrent calls (e.g., Navbar + page both call fetchProfile)
    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current;
    }

    setIsLoading(true);

    const promise = getProfile()
      .then((data) => {
        setProfile(data);
        lastFetchRef.current = Date.now();
        return data;
      })
      .catch((err) => {
        console.error("ProfileContext fetch error:", err);
        return null;
      })
      .finally(() => {
        setIsLoading(false);
        fetchPromiseRef.current = null;
      });

    fetchPromiseRef.current = promise;
    return promise;
  }, [profile]);

  const clearProfile = useCallback(() => {
    setProfile(null);
    lastFetchRef.current = 0;
    fetchPromiseRef.current = null;
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, isLoading, fetchProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
