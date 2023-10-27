let COOKIE_DOMAIN: string;
if (process.env.NODE_ENV === "production") COOKIE_DOMAIN = ".hyperschedule.io";
else COOKIE_DOMAIN = "localhost";
export { COOKIE_DOMAIN };
