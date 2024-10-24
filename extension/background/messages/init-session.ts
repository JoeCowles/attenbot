import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { supabase } from "~core/supabase"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log(event, session)
  })

  await supabase.auth.setSession(req.body)

  const storage = new Storage({ area: "local" })
  await storage.set("selectedStudentId", req.body.student_id)
  console.log("Selected student ID:", req.body.student_id)
  res.send({ success: true })
}

export default handler
