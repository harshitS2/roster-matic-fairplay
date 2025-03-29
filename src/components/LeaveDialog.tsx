
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Employee, LeaveRequest } from '@/lib/types';

interface LeaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLeave: (leave: LeaveRequest) => void;
  employee: Employee | null;
}

const LeaveDialog: React.FC<LeaveDialogProps> = ({
  isOpen,
  onClose,
  onAddLeave,
  employee,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const handleSubmit = () => {
    if (employee && selectedDate) {
      onAddLeave({
        employeeId: employee.id,
        date: selectedDate,
      });
      setSelectedDate(undefined);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Leave Request</DialogTitle>
          <DialogDescription>
            Select a date for {employee?.name}'s leave.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={!selectedDate}>
            Add Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveDialog;
