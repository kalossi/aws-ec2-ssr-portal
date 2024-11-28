//.pages/register.tsx
import { useState } from 'react';

export default function Register() {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
    console.log("handleSubmit triggered!");

    const formData = new FormData(e.target as HTMLFormElement);

    // Convert FormData to an object for logging
    const formObject: Record<string, string> = {};
    formData.forEach((value, key) => {
      formObject[key] = value.toString();
    });
    console.log('Form data before submit:', formObject);

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formObject),
    });

    const data = await response.json();
    alert(data.message || data.error);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" id="username" name="username" placeholder="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
      <input type="password" id="password" name="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
      <button type="submit">Register</button>
    </form>
  );

}
