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
    instance: new Storage({ area: "local" })
  })
  const [refreshToken, setRefreshToken] = useStorage<string>({
    key: "refreshToken",
    instance: new Storage({ area: "local" })
  })
  const [user, setUser] = useStorage<User>({
    key: "user",
    instance: new Storage({ area: "local" })
  })

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isFetchingStudents, setIsFetchingStudents] = useState(false)

  useEffect(() => {
    async function init() {
      setIsLoading(true)
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()

      if (error) {
        console.error(error)
        setIsLoading(false)
        return
      }
      if (session) {
        setUser(session.user)
        setAccessToken(session.access_token)
        setRefreshToken(session.refresh_token)
        setSelectStudentScreen(true)
        await fetchStudents()
      } else {
        console.log("No active session")
      }
      setIsLoading(false)
    }

    init()
  }, [])

  const fetchStudents = async () => {
    setIsFetchingStudents(true)
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession()
      if (!session) {
        console.error("No active session")
        return
      }

      console.log("Fetching students with token:", session.access_token)

      const response = await fetch("http://localhost:3000/api/select-student", {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json"
        }
      })
      console.log("Response status:", response.status)
      if (response.ok) {
        const studentsData = await response.json()
        console.log("Students data:", studentsData)
        setStudents(studentsData)
      } else {
        const errorText = await response.text()
        console.error("Failed to fetch students:", response.status, errorText)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setIsFetchingStudents(false)
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
    setIsAuthenticating(true)
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
      await fetchStudents()
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
    } finally {
      setIsAuthenticating(false)
    }
  }

  const handleOAuthLogin = async (provider: Provider, scopes = "email") => {
    setIsAuthenticating(true)
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          scopes,
          redirectTo: location.href
        }
      })
    } catch (error) {
      console.error("OAuth login error:", error)
      alert("Error during OAuth login. Please try again.")
    } finally {
      setIsAuthenticating(false)
    }
  }

  // TODO: make this look better
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (selectStudentScreen) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="mb-4 text-2xl font-bold">Select Student Profile</h1>
        {isFetchingStudents ? (
          <p>Loading students...</p>
        ) : (
          students.map((student) => (
            <button
              key={student.student_id}
              onClick={() => handleStudentSelect(student.student_id)}
              className="px-4 py-2 mb-2 text-white bg-blue-500 rounded hover:bg-blue-600 w-60">
              {student.name}
            </button>
          ))
        )}
      </div>
    )
  }

  return (
    <main className="absolute flex items-center justify-center w-full top-60">
      <div className="flex flex-col justify-between gap-4 w-60">
        {user && (
          <>
            <h3>
              {user.email} - {user.id}
            </h3>
            <button
              className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
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
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />

            <button
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-blue-300"
              onClick={() => handleEmailLogin("SIGNUP", username, password)}
              disabled={isAuthenticating}>
              {isAuthenticating ? "Signing up..." : "Sign up"}
            </button>
            <button
              className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 disabled:bg-green-300"
              onClick={() => handleEmailLogin("LOGIN", username, password)}
              disabled={isAuthenticating}>
              {isAuthenticating ? "Logging in..." : "Login"}
            </button>

            <button
              className="px-4 py-2 text-white bg-gray-800 rounded hover:bg-gray-900 disabled:bg-gray-500"
              onClick={() => handleOAuthLogin("github")}
              disabled={isAuthenticating}>
              {isAuthenticating ? "Signing in..." : "Sign in with GitHub"}
            </button>
          </>
        )}
      </div>
    </main>
  )
}

export default IndexOptions
