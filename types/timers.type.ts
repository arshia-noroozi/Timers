export type TimerType = {
  id: string;
  x: number;
  y: number;
  duration: string;
  scale?: number;
  shape?: "circle" | "rectangle";
  start?: string | null;
};

export type World = {
  id: string;
  name: string;
  scale?: number;
  translateX?: number;
  translateY?: number;
  timers: TimerType[];
};

export type StoredTimer = {
  id: string;
  start: string;
  duration: string;
  notificationId: string;
};
