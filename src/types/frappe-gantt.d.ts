declare module "frappe-gantt" {
  export default class Gantt {
    constructor(
      element: string | HTMLElement,
      tasks: any[],
      options?: {
        on_click?: (task: any) => void;
        on_date_change?: (task: any, start: Date, end: Date) => void;
        on_progress_change?: (task: any, progress: number) => void;
        on_view_change?: (mode: string) => void;
        view_mode?: "Quarter Day" | "Half Day" | "Day" | "Week" | "Month";
        language?: string;
      }
    );
  }
}
