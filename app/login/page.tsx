import { AuthForm } from "@/components/auth-form";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthForm type="login" />
        </Suspense>
    );
}
