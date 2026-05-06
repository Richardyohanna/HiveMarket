import { create } from "zustand";
import { User, UserStoreData } from "../types/User";

const initialState: User = {
    full_name: "",
    email: "",
    role: "",   
    gender: "",
    profile_picture: "",
    university: "",
    location: "",
    campus: "",
}
export const userStore = create<UserStoreData>((set, get) => ({
    ...initialState,

    setFullName: (value: string) => set({full_name: value}),
    setEmail: (value: string) => set({email: value}),
    setRole: (value: string) => set({role: value}),
    setGender: (value: string) => set({gender: value}),
    setProfilePicture: (value: string) => set({profile_picture: value}),
    setUniversity: (value: string) => set({university: value}),
    setLocation: (value: string) => set({location: value}),
    setCampus: (value: string) => set({campus: value}),

     clearUser: () => set({ ...initialState }),
}))