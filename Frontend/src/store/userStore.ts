import { create } from "zustand";
import { UserStore } from "../types/User";

const initialState: UserStore = {
    fullName: "",
    email: "",
    role: "exlorer",   
    profilePicture: require("../../assets/images/HomeScreen/profilePicture.png "),
    university: "",
    location: "",
}
export const userStore = create<UserStore>((set, get) => ({
    ...initialState,

    setFullName: (value: string) => set({fullName: value}),
    setEmail: (value: string) => set({email: value}),
    setRole: (value: string) => set({role: value}),
    setProfilePicture: (value: any) => set({profilePicture: value}),
    setUniversity: (value: string) => set({university: value}),
    setLocation: (value: string) => set({location: value}),

    updateProfilePicture: (newPicture: any) => set({profilePicture: newPicture}),
}))