import type { Provider, User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import { supabase } from "~core/supabase"

import "./style.css"

function IndexOptions() {

  const [selectStudentScreen, setSelectStudentScreen] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [accessToken, setAccessToken] = useStorage<string>({
    key: "accessToken",
    instance: new Storage({
      area: "local"
    })
  })
  const [refreshToken, setRefreshToken] = useStorage<string>({
    key: "refreshToken",
    instance: new Storage({
      area: "local"
    })
  })
  const [user, setUser] = useStorage<User>({
    key: "user",
    instance: new Storage({
      area: "local"
    })
  })

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [data, setData] = useState<any>(null)


  useEffect(() => {
    async function init() {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error(error)
        return
      }
      if (session) {
        setUser(session.user)
        setAccessToken(session.access_token)
        setRefreshToken(session.refresh_token)
        setSelectStudentScreen(true)
        fetchStudents()
      } else {
        console.log("No active session")
        // Redirect to login or show login form
      }
    }

    init()
  }, [])

  const fetchStudents = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('No active session')
        return
      }

      console.log('Fetching students with token:', session.access_token)

      const response = await fetch('http://localhost:3000/api/select-student', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      console.log('Response status:', response.status)
      if (response.ok) {
        const studentsData = await response.json()
        console.log('Students data:', studentsData)
        setStudents(studentsData)
      } else {
        const errorText = await response.text()
        console.error('Failed to fetch students:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const handleStudentSelect = (studentId: string) => {
    sendToBackground({
      name: "init-session",
      body: {
        refresh_token: refreshToken,
        access_token: accessToken,
        student_id: studentId
      }
    })
    setSelectStudentScreen(false)
  }

  const handleEmailLogin = async (
    type: "LOGIN" | "SIGNUP",
    username: string,
    password: string
  ) => {
    try {
      const {
        error,
        data: { user }
      } =
        type === "LOGIN"
          ? await supabase.auth.signInWithPassword({
              email: username,
              password
            })
          : await supabase.auth.signUp({ email: username, password })
      setData(data)
      fetchStudents()
      setSelectStudentScreen(true)
      if (error) {
        alert("Error with auth: " + error.message)
      } else if (!user) {
        alert("Signup successful, confirmation mail should be sent soon!")
      } else {
        setUser(user)
      }
    } catch (error) {
      console.log("error", error)
      alert(error.error_description || error)
    }
  }

  const handleOAuthLogin = async (provider: Provider, scopes = "email") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        scopes,
        redirectTo: location.href
      }
    })
  }

  if (selectStudentScreen) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Select Student Profile</h1>
        {students.map((student) => (
          <button
            key={student.id}
            onClick={() => handleStudentSelect(student.id)}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-2 w-60"
          >
            {student.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <main className="flex justify-center items-center w-full absolute top-60">
      <div className="flex flex-col w-60 justify-between gap-4">
        {user && (
          <>
            <h3>
              {user.email} - {user.id}
            </h3>
            <button
              className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              onClick={() => {
                supabase.auth.signOut()
                setUser(null)
              }}>
              Logout
            </button>
          </>
        )}
        {!user && (
          <>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              placeholder="Your Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />

            <button
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              onClick={(e) => {
                handleEmailLogin("SIGNUP", username, password)
              }}>
              Sign up
            </button>
            <button
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              onClick={(e) => {
                handleEmailLogin("LOGIN", username, password)
              }}>
              Login
            </button>

            <button
              className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900"
              onClick={(e) => {
                handleOAuthLogin("github")
              }}>
              Sign in with GitHub
            </button>
          </>
        )}
      </div>
    </main>
  )
}

export default IndexOptions
