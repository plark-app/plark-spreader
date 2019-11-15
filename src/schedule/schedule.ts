import Schedule from 'node-schedule';
import Jobs from './ScheduleJobs';

export const startScheduleModule = async () => {
    Schedule.scheduleJob('10 41 * * * *', Jobs.ttlPlatformJob);
};
