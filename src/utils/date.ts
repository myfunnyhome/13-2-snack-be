import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

const KST = 'Asia/Seoul';

export function getKstDate() {
  return dayjs().tz(KST);
}
