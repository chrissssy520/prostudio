"use client"

import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/") // Pag success, balik sa dashboard
    } catch (err: any) {
      setError("Invalid credentials. Please try again.")
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white font-sans">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 p-10 border border-white/10 rounded-2xl bg-[#111] w-full max-w-md">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tighter">Admin Login</h1>
          <p className="text-gray-400 text-sm">Enter your credentials to manage projects.</p>
        </div>
        
        {error && <p className="text-red-500 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Email Address</label>
          <input 
            type="email" 
            required
            className="p-3 bg-black border border-white/10 rounded-lg focus:border-red-500 outline-none transition-all"
            onChange={(e) => setEmail(e.target.value)} 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Password</label>
          <input 
            type="password" 
            required
            className="p-3 bg-black border border-white/10 rounded-lg focus:border-red-500 outline-none transition-all"
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>

        <button type="submit" className="bg-red-600 p-3 rounded-lg font-bold hover:bg-red-700 mt-4 transition-colors">
          Sign In to Dashboard
        </button>
      </form>
    </div>
  )
}   