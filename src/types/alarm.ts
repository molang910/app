export interface AlarmConfig {
  enabled: boolean;
  morningEnabled: boolean;
  afternoonEnabled: boolean;
  nightEnabled: boolean;
  notifyBeforeMinutes: number; // 0 (정각), 5, 10, 15
  soundEnabled: boolean;
  browserNotification: boolean;
}

export interface ActiveAlarmAlert {
  id: string;
  type: 'morning' | 'afternoon' | 'night';
  title: string;
  message: string;
  time: string;
  icon: string;
  timestamp: number;
}
