import admin, { app } from 'firebase-admin';
import { config } from 'config';

export { PlarkNotifier } from './plark-notifier';

export const configureFirebase = (): app.App => {

    const fbAdminCert = config.get<FirebaseAdminCert>('firebase.admin_cert');
    if (!fbAdminCert) {
        throw new Error();
    }

    return admin.initializeApp({
        credential: admin.credential.cert(fbAdminCert),
        databaseURL: "https://berrywallet-spreader.firebaseio.com",
    });
};
