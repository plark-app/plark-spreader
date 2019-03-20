import Schedule from 'node-schedule';

import Jobs from './schedule-jobs';

export const startSheduleModule = async () => {
    Schedule.scheduleJob('10 41 * * * *', Jobs.ttlPlatform);
};
