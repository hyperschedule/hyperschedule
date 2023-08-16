import { useLogin } from "@hooks/api/user";
import { apiUrl } from "@lib/config";
import useStore from "@hooks/store";

export default function Login() {
    const loginMutation = useLogin();
    const setPopup = useStore((store) => store.setPopup);

    function loginAsGuest() {
        void loginMutation.mutateAsync().then(() => setPopup(null));
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
