import {createContext,useState} from "react";

const UserType = createContext();

const UserContext = ({children}) => {
    const [userId,setUserId] = useState("");
    const backendUrl="http://192.168.0.244:8000"
    return (
        <UserType.Provider value={{userId,setUserId,backendUrl}}>
            {children}
        </UserType.Provider>
    )
}

export {UserType,UserContext}