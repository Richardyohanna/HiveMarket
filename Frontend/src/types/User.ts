


export type User = {    

    id: string;
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

    id: string;
    full_name: string;
    email: string;
    role?: string;
    gender: string;
    profile_picture: string ;
    university: string;
    location: string;
    campus: string;

    // setters
    setUserId: (value: string) => void;
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