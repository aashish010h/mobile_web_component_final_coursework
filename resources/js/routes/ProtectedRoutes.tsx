// import { useAuthStore } from "@/store/useAuthStore";
// import { JSX } from "react";
// import { Navigate } from "react-router-dom";

// export default function ProtectedRoute({ children }: { children: JSX.Element }) {
//   const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

//   if (!isAuthenticated) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// }
