
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Employee, RosterMonth, ShiftType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getDatesInMonth } from '@/lib/roster-utils';

interface RosterCalendarProps {
  roster: RosterMonth | null;
  employees: Employee[];
}

const RosterCalendar: React.FC<RosterCalendarProps> = ({ roster, employees }) => {
  if (!roster) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Roster</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12 text-muted-foreground">
          No roster generated yet. Please select a month and year, then click "Generate Roster".
        </CardContent>
      </Card>
    );
  }

  const dates = getDatesInMonth(roster.year, roster.month);
  
  // Function to get shift for a specific employee and date
  const getShift = (employeeId: string, date: Date) => {
    return roster.assignments.find(
      a => a.employeeId === employeeId && 
           a.date.getDate() === date.getDate() && 
           a.date.getMonth() === date.getMonth() && 
           a.date.getFullYear() === date.getFullYear()
    )?.shiftType || ShiftType.Off;
  };
  
  // Function to get background color based on shift type
  const getShiftBg = (shiftType: ShiftType) => {
    switch (shiftType) {
      case ShiftType.Morning:
        return 'bg-shift-morning text-white';
      case ShiftType.Afternoon:
        return 'bg-shift-afternoon text-white';
      case ShiftType.Night:
        return 'bg-shift-night text-white';
      case ShiftType.Leave:
        return 'bg-destructive text-white';
      default:
        return 'bg-gray-100';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Monthly Roster - {format(new Date(roster.year, roster.month, 1), 'MMMM yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="flex space-x-4 mb-4">
          <Badge className="bg-shift-morning text-white">M - Morning</Badge>
          <Badge className="bg-shift-afternoon text-white">A - Afternoon</Badge>
          <Badge className="bg-shift-night text-white">N - Night</Badge>
          <Badge className="bg-destructive text-white">L - Leave</Badge>
          <Badge className="bg-gray-100 text-gray-800">O - Off</Badge>
        </div>
        
        <Table className="min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-white z-10">Employee</TableHead>
              {dates.map((date) => (
                <TableHead 
                  key={date.toString()} 
                  className={cn(
                    "text-center min-w-[50px]", 
                    date.getDay() === 0 || date.getDay() === 6 ? "bg-gray-50" : ""
                  )}
                >
                  <div className="flex flex-col items-center">
                    <span>{format(date, 'd')}</span>
                    <span className="text-xs text-gray-500">{format(date, 'EEE')}</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="sticky left-0 bg-white z-10 font-medium">
                  {employee.name}
                </TableCell>
                {dates.map((date) => {
                  const shift = getShift(employee.id, date);
                  return (
                    <TableCell 
                      key={`${employee.id}-${date.toString()}`} 
                      className={cn(
                        "text-center", 
                        getShiftBg(shift),
                        "font-semibold"
                      )}
                    >
                      {shift}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RosterCalendar;
