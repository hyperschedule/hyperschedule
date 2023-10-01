//import { useGuestLogin } from "@hooks/api/user";
import useStore from "@hooks/store";
import { useUserStore } from "@hooks/store/user";
import { pick } from "@lib/store";

export default function Login(props: { continuation?: () => void }) {
    //const loginMutation = useGuestLogin();
    const confirm = useUserStore((store) => store.confirmGuest);
    const setPopup = useStore((store) => store.setPopup);

    //function loginAsGuest() {
    //    void loginMutation.mutateAsync().then(() => setPopup(null));
    //}

    function loginThroughCAS() {
        window.location.href = `${__API_URL__}/auth/saml`;
    }

    function confirmGuest() {
        confirm();
        setPopup(null);
        props.continuation?.();
    }

    return (
        <div>
            {/*<button onClick={loginAsGuest}>Login as guest</button>*/}
            <button onClick={loginThroughCAS}>Login with CAS</button>
            <button onClick={confirmGuest}>Proceed as guest</button>
        </div>
    );
}
