function install(): void {
    self.addEventListener("install", () => {
        // eslint-disable-next-line no-console
        console.log("service worker installed");
    });
}

install();
