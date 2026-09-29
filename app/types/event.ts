export interface Theme {
  id: number;
  name: string;
  stylename?: string;
}

export interface EventInfo {
  id: number;
  name: string;
  weekly: boolean;
  themed: boolean;
  themeid: number;
  time: string;
}
