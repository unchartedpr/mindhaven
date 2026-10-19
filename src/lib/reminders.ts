/**
 * Daily check-in reminders as a calendar file.
 *
 * Browsers can't reliably fire a notification when an app is closed without a push server —
 * which would mean MindHaven collecting a push subscription for every user, contradicting
 * "nothing leaves your device". A recurring calendar event the user imports themselves gives
 * a dependable reminder with no server, no account, and no tracking.
 */

export const DEFAULT_REMINDER_TIME = '20:00'

export function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value)
}

function icsEscape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** RFC 5545 requires lines of at most 75 octets; fold longer ones with CRLF + space. */
function fold(line: string): string {
  if (line.length <= 73) return line
  const parts: string[] = []
  let rest = line
  while (rest.length > 73) {
    parts.push(rest.slice(0, 73))
    rest = ' ' + rest.slice(73)
  }
  parts.push(rest)
  return parts.join('\r\n')
}

function stamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
}

export function buildReminderICS(opts: { time: string; url: string; now?: Date; uid?: string }): string {
  const { time, url, now = new Date(), uid = `${now.getTime()}@mindhaven` } = opts
  if (!isValidTime(time)) throw new Error('Invalid time')
  const [hh, mm] = time.split(':')

  // Start tomorrow, in "floating" local time so it fires at the same wall-clock time wherever the user is.
  const start = new Date(now)
  start.setDate(start.getDate() + 1)
  const p = (n: number) => String(n).padStart(2, '0')
  const dtstart = `${start.getFullYear()}${p(start.getMonth() + 1)}${p(start.getDate())}T${hh}${mm}00`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MindHaven//Daily check-in//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${dtstart}`,
    'DURATION:PT10M',
    'RRULE:FREQ=DAILY',
    `SUMMARY:${icsEscape('MindHaven check-in')}`,
    `DESCRIPTION:${icsEscape(`Take a minute to check in with yourself. ${url}`)}`,
    `URL:${url}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsEscape('MindHaven check-in')}`,
    'TRIGGER:PT0S',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}
