export type ProjectRow = {
  id: string
  name: string
  createdOn: string
  status: "Missed" | "In Progress" | "New" | "Failed" | "Completed"
  deadline: string
  phase: string
  remaining: string
  percent: string
}

export const initialProjects: ProjectRow[] = [
  {
    id: "proj-1",
    name: "Dsmla Beach",
    createdOn: "March 26, 2026",
    status: "Missed",
    deadline: "July 11, 2026, 10:00 AM",
    phase: "A1-9",
    remaining: "Remaining 6",
    percent: "95.00%",
  },
  {
    id: "proj-2",
    name: "AI-Driven Opportunity Intelligence Platform (RFP_G).pdf",
    createdOn: "March 24, 2026",
    status: "In Progress",
    deadline: "May 15, 2026, 11:59 PM UTC",
    phase: "A1-3",
    remaining: "Remaining 2",
    percent: "90.00%",
  },
  {
    id: "proj-3",
    name: "REQUEST FOR PROPOSAL (RFP).docx",
    createdOn: "March 23, 2026",
    status: "New",
    deadline: "March 24, 2026, 12:00 AM UTC",
    phase: "A1-1",
    remaining: "Remaining 5",
    percent: "8.00%",
  },
  {
    id: "proj-4",
    name: "RFP_Dep Trans Retail Platform (G).pdf",
    createdOn: "March 18, 2026",
    status: "New",
    deadline: "March 18, 2026, 11:59 PM UTC",
    phase: "A1-7",
    remaining: "Remaining 3",
    percent: "25.00%",
  },
  {
    id: "proj-5",
    name: "RFP - Edge and Platform (G).pdf",
    createdOn: "March 18, 2026",
    status: "Failed",
    deadline: "March 18, 2026",
    phase: "A1-4",
    remaining: "Remaining 1",
    percent: "0.00%",
  },
  {
    id: "proj-6",
    name: "DC - Digital Records Modernization System",
    createdOn: "March 17, 2026",
    status: "Completed",
    deadline: "March 17, 2026",
    phase: "A1-1",
    remaining: "Complete",
    percent: "100.00%",
  },
]
