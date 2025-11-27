import { Navigate } from "react-router-dom";
import { paths } from "./paths";
import {useAuth} from "../hooks/useAuth";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

export const ProtectedRoute = ({children} : ProtectedRouteProps) => {
    const {user, loading} = useAuth();

    if(loading) {
        return (
            <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                height: "100vh",
                fontSize: "18px",
                color: "#666"
            }}>
                Carregando...
            </div>
        );
    }

    if(!user){
        return <Navigate to={paths.login} replace />;
    }

    return <>{children}</>;
}