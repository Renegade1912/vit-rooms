export interface ICSObject {
    type: Component;
    params: object;
    uid: string;
    dtstamp: Date;
    start: Date;
    end: Date;
    summary: Summary;
    organizer: Organizer;
    description: string;
    val: string; // https://www.ietf.org/rfc/rfc2445.txt
}

export type Component =
    | 'VEVENT'
    | 'VTODO'
    | 'VJOURNAL'
    | 'VFREEBUSY'
    | 'VTIMEZONE'
    | 'VALARM'
    | 'STANDARD'
    | 'DAYLIGHT';

export type Summary = {
    params: object;
    val: string;
};

export type Organizer = {
    params: object;
    val: string; // email
};
