import { getAuth } from "firebase/auth";
import { app } from "./firebase";

// Initialize Firebase Authentication
export const auth = getAuth(app);

