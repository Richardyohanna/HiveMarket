import { ImageSourcePropType } from "react-native";

export type UserStore = {
    fullName: string;
    email: string;
    role?: string;
    profilePicture: ImageSourcePropType;
    university: string;
    location: string;
}