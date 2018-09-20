import admin, { messaging, app } from 'firebase-admin';
import { config } from 'config';

export { BerryNotifier } from './berry-notifier';

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

/**
 * @param {admin.app.App} app
 * @returns {Promise<void>}
 *
 * @deprecated
 * @template
 */
export const sendTestMessage = async (app: app.App): Promise<void> => {
    const TEST_TOKEN =
        "e-tZP8BiYT0:APA91bEhpMSx3Z95MBWicQX1Qa" +
        "It46XGqG6xwBPptpaNPH7ONrEBTjJAZynwu6-D" +
        "LTZVX17iwhOJCl92SSdtpFpkIV5W1EtJk_d4Ax" +
        "U-tcB70F4Ph22HIVpBhZbMkwjgN7gn6TaaRR2b";

    // const FAIL_TOKEN = 'terswfwjio3irwe';

    const message: messaging.Message = {
        data: {
            title: 'My title!',
            description: 'My information!',
        },
        notification: {
            title: 'My title!',
            body: 'Yep yep yep!',
        },
        token: TEST_TOKEN,
    };

    try {
        const response = await app.messaging().send(message);

        console.log('Successfully sent message:', response);
    } catch (error) {
        console.error('Error on send message', error);
    }
};
