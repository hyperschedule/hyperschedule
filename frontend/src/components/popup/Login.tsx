import useStore from "@hooks/store";
import { useUserStore } from "@hooks/store/user";

export default function Login(props: { continuation?: () => void }) {
    const confirm = useUserStore((store) => store.confirmGuest);
    const setPopup = useStore((store) => store.setPopup);

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
