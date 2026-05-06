


export type User = {    

    full_name: string;
    email: string;
    role?: string;
    gender: string;
    profile_picture: string;
    university: string;
    location: string;
    campus: string;
}

export type UserStoreData = {
    full_name: string;
    email: string;
    role?: string;
    gender: string;
    profile_picture: string ;
    university: string;
    location: string;
    campus: string;

    // setters
    setFullName: (value: string) => void;
    setEmail: (value: string) => void;
    setRole: (value: string) => void;
    setGender: (value: string) => void;
    setProfilePicture: (value: string) => void;
    setUniversity: (value: string) => void;
    setLocation: (value: string) => void;
    setCampus: (value: string) => void;

    clearUser: () => void;
}