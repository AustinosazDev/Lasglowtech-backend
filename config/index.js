const config = {
email_pass:process.env.EMAIL_PASSWORD,
email_port:process.env.EMAIL_PORT,
email_user: process.env.EMAIL_USER,
flutterwave_secret_key: process.env.FLUTTERWAVE_SECRET_KEY,
flutterwave_public_key: process.env.FLUTTERWAVE_PUBLIC_KEY,
flutterwave_encryption_key: process.env.FLUTTERWAVE_ENCRYPTION_KEY,
flutterwave_webhook_hash: process.env.FLUTTERWAVE_WEBHOOK_HASH,
 

    // mailchip configuration
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: process.env.MAILCHIMP_SERVER_PREFIX,
    listid: process.env.MAILCHIMP_LIST_ID,
   
    // jt token pass
    // config.js

    secret: process.env.JWT_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,


    // database connection
    port: process.env.PORT,
    local_client_app: process.env.LOCAL_CLIENT_APP,
    local_server_app: process.env.LOCAL_SERVER_APP,
    remote_client_app: process.env.REMOTE_CLIENT_APP,
    remote_server_api: process.env.REMOTE_SERVER_API,

    database_host: process.env.DATABASE_HOST,
    database_user: process.env.DATABASE_USER,
    database_password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    database_port: process.env.DATABASE_PORT,




    allowedDomains: (process.env.NODE_ENV === 'production' ?
        [
            process.env.REMOTE_CLIENT_APP,
            process.env.REMOTE_SERVER_API, // allow browser access to API URL)
        ].filter(Boolean) :
        [
            process.env.LOCAL_CLIENT_APP,
            process.env.LOCAL_SERVER_API,
        ].filter(Boolean))
};

module.exports = config;
