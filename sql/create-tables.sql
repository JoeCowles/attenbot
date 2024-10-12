-- Create the 'parents' table
CREATE TABLE parents (
    auth_id UUID PRIMARY KEY,
    email TEXT NOT NULL
);

-- Create the 'students' table
CREATE TABLE students (
    student_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES parents(auth_id),
    filters TEXT[]
);

-- Create the 'videos' table with your changes
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    student_id UUID REFERENCES students(student_id),
    image TEXT,
    title TEXT
);

-- Enable Row-Level Security (RLS) on all tables
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the 'parents' table

-- Select policy
CREATE POLICY "Parents can select their own data" ON parents
FOR SELECT
USING (auth_id = auth.uid());

-- Insert policy
CREATE POLICY "Parents can insert their own data" ON parents
FOR INSERT
WITH CHECK (auth_id = auth.uid());

-- Update policy
CREATE POLICY "Parents can update their own data" ON parents
FOR UPDATE
USING (auth_id = auth.uid())
WITH CHECK (auth_id = auth.uid());

-- Delete policy
CREATE POLICY "Parents can delete their own data" ON parents
FOR DELETE
USING (auth_id = auth.uid());

-- Create RLS policies for the 'students' table

-- Select policy
CREATE POLICY "Parents can select their students" ON students
FOR SELECT
USING (parent_id = auth.uid());

-- Insert policy
CREATE POLICY "Parents can insert their students" ON students
FOR INSERT
WITH CHECK (parent_id = auth.uid());

-- Update policy
CREATE POLICY "Parents can update their students" ON students
FOR UPDATE
USING (parent_id = auth.uid())
WITH CHECK (parent_id = auth.uid());

-- Delete policy
CREATE POLICY "Parents can delete their students" ON students
FOR DELETE
USING (parent_id = auth.uid());

-- Create RLS policies for the 'videos' table

-- Select policy
CREATE POLICY "Parents can select videos of their students" ON videos
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM students
        WHERE students.student_id = videos.student_id
          AND students.parent_id = auth.uid()
    )
);

-- Insert policy
CREATE POLICY "Parents can insert videos for their students" ON videos
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM students
        WHERE students.student_id = videos.student_id
          AND students.parent_id = auth.uid()
    )
);

-- Update policy
CREATE POLICY "Parents can update videos of their students" ON videos
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM students
        WHERE students.student_id = videos.student_id
          AND students.parent_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM students
        WHERE students.student_id = videos.student_id
          AND students.parent_id = auth.uid()
    )
);

-- Delete policy
CREATE POLICY "Parents can delete videos of their students" ON videos
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM students
        WHERE students.student_id = videos.student_id
          AND students.parent_id = auth.uid()
    )
);
