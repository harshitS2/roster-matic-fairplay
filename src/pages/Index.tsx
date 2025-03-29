
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import RosterHeader from '@/components/RosterHeader';
import EmployeeList from '@/components/EmployeeList';
import RosterCalendar from '@/components/RosterCalendar';
import LeaveDialog from '@/components/LeaveDialog';
import { Employee, LeaveRequest, RosterMonth } from '@/lib/types';
import { defaultEmployees, generateRoster } from '@/lib/roster-utils';
import { exportRosterToExcel } from '@/lib/excel-utils';

const Index = () => {
  const { toast } = useToast();
  const currentDate = new Date();
  
  // State
  const [month, setMonth] = useState<number>(currentDate.getMonth());
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [employees, setEmployees] = useState<Employee[]>(defaultEmployees);
  const [roster, setRoster] = useState<RosterMonth | null>(null);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Handlers
  const handleGenerateRoster = () => {
    try {
      const generatedRoster = generateRoster(year, month, employees, leaves);
      setRoster(generatedRoster);
      
      toast({
        title: "Roster Generated",
        description: `Shift schedule for ${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year} has been created.`,
      });
    } catch (error) {
      console.error("Error generating roster:", error);
      
      toast({
        variant: "destructive",
        title: "Generation Error",
        description: "Failed to generate the roster. Please try again.",
      });
    }
  };
  
  const handleExportRoster = () => {
    if (!roster) {
      toast({
        variant: "destructive",
        title: "Export Error",
        description: "Please generate a roster before exporting.",
      });
      return;
    }
    
    try {
      exportRosterToExcel(roster, employees);
      
      toast({
        title: "Export Successful",
        description: "The roster has been exported to Excel.",
      });
    } catch (error) {
      console.error("Error exporting roster:", error);
      
      toast({
        variant: "destructive",
        title: "Export Error",
        description: "Failed to export the roster. Please try again.",
      });
    }
  };
  
  const handleAddLeaveRequest = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setIsLeaveDialogOpen(true);
    }
  };
  
  const handleAddLeave = (leave: LeaveRequest) => {
    setLeaves([...leaves, leave]);
    
    toast({
      title: "Leave Added",
      description: `Leave has been added for ${selectedEmployee?.name}.`,
    });
  };
  
  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <RosterHeader
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
        onGenerate={handleGenerateRoster}
        onExport={handleExportRoster}
      />
      
      <EmployeeList 
        employees={employees} 
        onAddLeave={handleAddLeaveRequest} 
      />
      
      <RosterCalendar 
        roster={roster} 
        employees={employees} 
      />
      
      <LeaveDialog
        isOpen={isLeaveDialogOpen}
        onClose={() => setIsLeaveDialogOpen(false)}
        onAddLeave={handleAddLeave}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default Index;
