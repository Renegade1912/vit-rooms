export interface ScheduleBody {
    name: string;
    date: string;
    width: number;
    height: number;
    events: {
        desc: string;
        start: string;
        end: string;
    }[];
}

export interface EmergencyBody {
    width: number;
    height: number;
}

export interface NotConfiguredBody extends EmergencyBody {
    url: string;
}
