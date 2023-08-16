import { useLogin } from "@hooks/api/user";
import { apiUrl } from "@lib/config";

export default function () {
    const loginMutation = useLogin();

    function loginAsGuest() {
        loginMutation.mutate();
    }

    function loginThroughCAS() {
        window.location.href = `${apiUrl}/auth/saml`;
    }

    return (
        <div>
            <button onClick={loginAsGuest}>Login as guest</button>
            <button onClick={loginThroughCAS}>Login with CAS</button>
        </div>
    );
}
