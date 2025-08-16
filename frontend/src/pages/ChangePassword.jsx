import React, { useState } from 'react';
import api from '../services/api';
import Button from '../components/Button';

function ChangePassword() {
  const [oldPassword, setOld] = useState("")
  const [newPassword, setNew] = useState("")
  const [msg, setMsg] = useState("")
  const [err, setErr] = useState("")
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault()
    setErr(""); setMsg("")
    setIsLoading(true);
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword })
      setMsg("Password updated.")
      setOld(""); setNew("")
    } catch (e) {
      setErr(e.response?.data?.message || e.message)
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="max-w-md mx-auto p-4">
      <form className="card flex flex-col gap-3" onSubmit={submit}>
        <h2 className="text-xl font-semibold">Change Password</h2>
        {msg && <div className="text-green-700 text-sm">{msg}</div>}
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <input type="password" placeholder="Old Password" value={oldPassword} onChange={e=>setOld(e.target.value)} />
        <input type="password" placeholder="New Password" value={newPassword} onChange={e=>setNew(e.target.value)} />
        <Button className="bg-gray-900 text-white" type="submit" isLoading={isLoading}>Update</Button>
      </form>
    </div>
  )
}

export default ChangePassword;
