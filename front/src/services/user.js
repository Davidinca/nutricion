export async function fetchUserRole() {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  const response = await fetch('http://127.0.0.1:8000/api/usuarios/roles/', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error('No autorizado');

  const data = await response.json();
  // data es un array, tomamos el primer objeto
  if (Array.isArray(data) && data.length > 0) {
    return data[0]; // objeto con rol y permisos
  }
  return null;
}
