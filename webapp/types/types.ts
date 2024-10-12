// Student type definition
export interface Student {
    student_id: string;
    name: string;
    parent_id: string;
    filters: string[];
}
  
// Response type for API calls
export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
  }
  
  // Specific response types
  export type StudentsResponse = ApiResponse<Student[]>;
  export type StudentResponse = ApiResponse<Student>;
  
  // Request types for API calls
  export interface AddStudentRequest {
    name: string;
  }
  
  export interface UpdateStudentFiltersRequest {
    student_id: string;
    filters: string[];
  }
  
  export interface DeleteStudentRequest {
    student_id: string;
  }

  export interface Video {
    id: string;
    title: string;
    timestamp: string;
    image: string;
  }
