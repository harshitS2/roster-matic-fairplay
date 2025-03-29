
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, FileDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface RosterHeaderProps {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onExport: () => void;
  onGenerate: () => void;
}

const RosterHeader: React.FC<RosterHeaderProps> = ({
  month,
  year,
  onMonthChange,
  onYearChange,
  onExport,
  onGenerate
}) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const prevMonth = () => {
    if (month === 0) {
      onMonthChange(11);
      onYearChange(year - 1);
    } else {
      onMonthChange(month - 1);
    }
  };
  
  const nextMonth = () => {
    if (month === 11) {
      onMonthChange(0);
      onYearChange(year + 1);
    } else {
      onMonthChange(month + 1);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">Attendance Shift Roster Maker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-between items-center">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Select value={month.toString()} onValueChange={(value) => onMonthChange(parseInt(value))}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={year.toString()} onValueChange={(value) => onYearChange(parseInt(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 2).map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={onGenerate} className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Generate Roster
            </Button>
            <Button onClick={onExport} variant="outline" className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RosterHeader;
