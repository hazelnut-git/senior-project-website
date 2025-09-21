import { Card } from "./ui/card";

interface TimeSlot {
  time: string;
  Monday?: string;
  Tuesday?: string;
  Wednesday?: string;
  Thursday?: string;
  Friday?: string;
}

interface TimetableGridProps {
  schedule: TimeSlot[];
}

export function TimetableGrid({ schedule }: TimetableGridProps) {
  const days = ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  return (
    <Card className="p-6 w-full">
      <div className="grid grid-cols-6 gap-2">
        {/* Header row */}
        {days.map((day) => (
          <div key={day} className="p-3 text-center font-medium bg-muted rounded-lg">
            {day}
          </div>
        ))}
        
        {/* Time slots and schedule */}
        {timeSlots.map((time) => {
          const scheduleSlot = schedule.find(slot => slot.time === time);
          return (
            <div key={time} className="contents">
              <div className="p-3 text-center bg-muted/50 rounded-lg font-medium">
                {time}
              </div>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                const dayKey = day as keyof Omit<TimeSlot, 'time'>;
                const courseInfo = scheduleSlot?.[dayKey];
                return (
                  <div
                    key={`${time}-${day}`}
                    className={`p-3 border-2 border-dashed border-border rounded-lg min-h-[60px] flex items-center justify-center text-center ${
                      courseInfo ? 'bg-primary/10 border-primary/30' : 'bg-background'
                    }`}
                  >
                    {courseInfo ? (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{courseInfo.split(' - ')[0]}</div>
                        <div className="text-xs text-muted-foreground">{courseInfo.split(' - ')[1]}</div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-xs">Free</div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </Card>
  );
}