"use client";

import { use } from "react";
import { EmployeeProfile } from "@/components/employee/EmployeeProfile";

export default function TeamMemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  
  return (
    <div className="w-full">
      <EmployeeProfile employeeId={unwrappedParams.id} />
    </div>
  );
}
