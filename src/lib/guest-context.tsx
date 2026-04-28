import { createContext, useContext } from "react";

interface GuestContextValue {
  guestMode: boolean;
  exitGuestMode: () => void;
}

export const GuestContext = createContext<GuestContextValue>({ guestMode: false, exitGuestMode: () => {} });
export const useGuestMode = () => useContext(GuestContext);
