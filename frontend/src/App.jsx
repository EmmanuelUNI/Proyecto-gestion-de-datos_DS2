import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Edit2, Search, Trash2, FileText, MessageSquare } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Crear Personas
  const [formCrear, setFormCrear] = useState({
    primer_nombre: '',
    segundo_nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    genero: '',
    correo: '',
    celular: '',
    nro_doc: '',
    tipo_doc: ''
  });

  // Consultar/Modificar/Eliminar
  const [nroDocConsulta, setNroDocConsulta] = useState('');
  const [personaConsultada, setPersonaConsultada] = useState(null);
  const [formModificar, setFormModificar] = useState({});

  // Consulta Natural
  const [queryNatural, setQueryNatural] = useState('');
  const [resultadoNatural, setResultadoNatural] = useState(null);

  // Logs
  const [filtroLogs, setFiltroLogs] = useState({ tipo: '', documento: '', fecha: '' });
  const [logs, setLogs] = useState([]);

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  // LOGIN
  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, dbName: 'diseo_de_software_ii_908c0f07a5' })
      });
      const data = await response.json();
      if (data.accessToken) {
        setToken(data.accessToken);
        setCurrentView('menu');
        showMessage('Login exitoso');
      } else {
        showMessage('Credenciales inválidas', 'error');
      }
    } catch (error) {
      showMessage('Error en login: ' + error.message, 'error');
    }
    setLoading(false);
  };

  // LOGOUT
  const handleLogout = () => {
    setToken(null);
    setCurrentView('login');
    setFormCrear({
      primer_nombre: '',
      segundo_nombre: '',
      apellidos: '',
      fecha_nacimiento: '',
      genero: '',
      correo: '',
      celular: '',
      nro_doc: '',
      tipo_doc: ''
    });
  };

  // CREAR PERSONA
  const handleCrearPersona = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/personas/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formCrear)
      });
      const data = await response.json();
      if (response.ok) {
        showMessage('Persona creada exitosamente');
        setFormCrear({
          primer_nombre: '',
          segundo_nombre: '',
          apellidos: '',
          fecha_nacimiento: '',
          genero: '',
          correo: '',
          celular: '',
          nro_doc: '',
          tipo_doc: ''
        });
      } else {
        showMessage(data.detail || 'Error al crear persona', 'error');
      }
    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    }
    setLoading(false);
  };

  // CONSULTAR PERSONA
  const handleConsultarPersona = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/personas/consultar/${nroDocConsulta}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setPersonaConsultada(data.data);
        showMessage('Persona consultada exitosamente');
      } else {
        showMessage(data.detail || 'Persona no encontrada', 'error');
        setPersonaConsultada(null);
      }
    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    }
    setLoading(false);
  };

  // MODIFICAR PERSONA
  const handleModificarPersona = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/personas/modificar/${nroDocConsulta}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formModificar)
      });
      const data = await response.json();
      if (response.ok) {
        showMessage('Persona modificada exitosamente');
        setFormModificar({});
        setPersonaConsultada(null);
      } else {
        showMessage(data.detail || 'Error al modificar', 'error');
      }
    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    }
    setLoading(false);
  };

  // ELIMINAR PERSONA
  const handleEliminarPersona = async () => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta persona?')) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/personas/eliminar/${nroDocConsulta}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        showMessage('Persona eliminada exitosamente');
        setPersonaConsultada(null);
        setNroDocConsulta('');
      } else {
        showMessage('Error al eliminar', 'error');
      }
    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    }
    setLoading(false);
  };

  // CONSULTA NATURAL
  const handleConsultaNatural = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/consulta-natural`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: queryNatural })
      });
      const data = await response.json();
      setResultadoNatural(data);
      showMessage('Consulta realizada');
    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    }
    setLoading(false);
  };

  // CONSULTAR LOGS
  const handleConsultarLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroLogs.tipo) params.append('tipo', filtroLogs.tipo);
      if (filtroLogs.documento) params.append('documento', filtroLogs.documento);
      if (filtroLogs.fecha) params.append('fecha', filtroLogs.fecha);

      const response = await fetch(`${API_URL}/logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setLogs(Array.isArray(data) ? data : data.data || []);
      showMessage('Logs cargados');
    } catch (error) {
      showMessage('Error: ' + error.message, 'error');
    }
    setLoading(false);
  };

  // COMPONENTES DE UI
  const Button = ({ onClick, children, variant = 'primary', disabled = false, className = '' }) => {
    const baseStyle = 'px-4 py-2 rounded-lg font-semibold transition-colors';
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
      secondary: 'bg-gray-300 text-black hover:bg-gray-400'
    };
    return (
      <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
        {children}
      </button>
    );
  };

  const Card = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">{title}</h2>
      {children}
    </div>
  );

  // VISTAS
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Gestión de Personas</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Contraseña:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </Button>
          </div>
          {message && <div className={`mt-4 p-3 rounded text-center text-white ${messageType === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{message}</div>}
        </div>
      </div>
    );
  }

  if (currentView === 'menu') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">APLICACIÓN GESTIÓN DE DATOS PERSONALES</h1>
          <Button variant="danger" onClick={handleLogout}>
            <LogOut size={20} className="inline mr-2" /> Salir
          </Button>
        </div>
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">MENÚ PRINCIPAL</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button onClick={() => setCurrentView('crear')} className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg text-center font-bold transition-colors">
              <Plus size={32} className="mx-auto mb-2" /> Crear Personas
            </button>
            <button onClick={() => setCurrentView('consultar')} className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg text-center font-bold transition-colors">
              <Search size={32} className="mx-auto mb-2" /> Consultar Datos Personales
            </button>
            <button onClick={() => setCurrentView('modificar')} className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-lg text-center font-bold transition-colors">
              <Edit2 size={32} className="mx-auto mb-2" /> Modificar Datos Personales
            </button>
            <button onClick={() => setCurrentView('natural')} className="bg-purple-500 hover:bg-purple-600 text-white p-6 rounded-lg text-center font-bold transition-colors">
              <MessageSquare size={32} className="mx-auto mb-2" /> Consulta en Lenguaje Natural
            </button>
            <button onClick={() => setCurrentView('eliminar')} className="bg-red-500 hover:bg-red-600 text-white p-6 rounded-lg text-center font-bold transition-colors">
              <Trash2 size={32} className="mx-auto mb-2" /> Borrar Personas
            </button>
            <button onClick={() => setCurrentView('logs')} className="bg-gray-500 hover:bg-gray-600 text-white p-6 rounded-lg text-center font-bold transition-colors">
              <FileText size={32} className="mx-auto mb-2" /> Consultar Log
            </button>
          </div>
        </div>
      </div>
    );
  }

  // CREAR PERSONA VIEW
  if (currentView === 'crear') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-blue-600 text-white p-4">
          <Button variant="secondary" onClick={() => setCurrentView('menu')} className="mb-4">← Volver al Menú</Button>
          <h1 className="text-2xl font-bold">Crear Nueva Persona</h1>
        </div>
        <div className="max-w-2xl mx-auto p-6">
          <Card title="Formulario de Registro">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Primer Nombre*" required value={formCrear.primer_nombre} onChange={(e) => setFormCrear({...formCrear, primer_nombre: e.target.value})} className="px-4 py-2 border rounded-lg" />
                <input placeholder="Segundo Nombre" value={formCrear.segundo_nombre} onChange={(e) => setFormCrear({...formCrear, segundo_nombre: e.target.value})} className="px-4 py-2 border rounded-lg" />
                <input placeholder="Apellidos*" required value={formCrear.apellidos} onChange={(e) => setFormCrear({...formCrear, apellidos: e.target.value})} className="px-4 py-2 border rounded-lg" />
                <input type="date" required value={formCrear.fecha_nacimiento} onChange={(e) => setFormCrear({...formCrear, fecha_nacimiento: e.target.value})} className="px-4 py-2 border rounded-lg" />
                <select required value={formCrear.genero} onChange={(e) => setFormCrear({...formCrear, genero: e.target.value})} className="px-4 py-2 border rounded-lg">
                  <option value="">Seleccionar Género</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
                <select required value={formCrear.tipo_doc} onChange={(e) => setFormCrear({...formCrear, tipo_doc: e.target.value})} className="px-4 py-2 border rounded-lg">
                  <option value="">Tipo de Documento</option>
                  <option value="CC">Cédula de Ciudadanía</option>
                  <option value="TI">Tarjeta de Identidad</option>
                  <option value="CE">Cédula Extranjería</option>
                </select>
                <input placeholder="Número Documento*" required value={formCrear.nro_doc} onChange={(e) => setFormCrear({...formCrear, nro_doc: e.target.value})} className="px-4 py-2 border rounded-lg" />
                <input type="email" placeholder="Correo*" required value={formCrear.correo} onChange={(e) => setFormCrear({...formCrear, correo: e.target.value})} className="px-4 py-2 border rounded-lg" />
                <input type="tel" placeholder="Celular*" required value={formCrear.celular} onChange={(e) => setFormCrear({...formCrear, celular: e.target.value})} className="px-4 py-2 border rounded-lg" />
              </div>
              <Button onClick={handleCrearPersona} disabled={loading} className="w-full">
                {loading ? 'Cargando...' : 'Crear Persona'}
              </Button>
            </div>
          </Card>
          {message && <div className={`p-3 rounded text-center text-white ${messageType === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{message}</div>}
        </div>
      </div>
    );
  }

  // CONSULTAR PERSONA VIEW
  if (currentView === 'consultar') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-blue-600 text-white p-4">
          <Button variant="secondary" onClick={() => setCurrentView('menu')} className="mb-4">← Volver al Menú</Button>
          <h1 className="text-2xl font-bold">Consultar Datos Personales</h1>
        </div>
        <div className="max-w-2xl mx-auto p-6">
          <Card title="Buscar Persona">
            <div className="space-y-4">
              <input placeholder="Número de Documento" value={nroDocConsulta} onChange={(e) => setNroDocConsulta(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
              <Button onClick={handleConsultarPersona} disabled={loading} className="w-full">
                {loading ? 'Buscando...' : 'Consultar'}
              </Button>
            </div>
          </Card>
          {personaConsultada && (
            <Card title="Información de la Persona">
              <div className="space-y-2">
                <p><strong>Nombre:</strong> {personaConsultada.primer_nombre} {personaConsultada.segundo_nombre} {personaConsultada.apellidos}</p>
                <p><strong>Documento:</strong> {personaConsultada.nro_doc}</p>
                <p><strong>Correo:</strong> {personaConsultada.correo}</p>
                <p><strong>Celular:</strong> {personaConsultada.celular}</p>
                <p><strong>Fecha Nacimiento:</strong> {personaConsultada.fecha_nacimiento}</p>
                <p><strong>Género:</strong> {personaConsultada.genero}</p>
              </div>
            </Card>
          )}
          {message && <div className={`p-3 rounded text-center text-white ${messageType === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{message}</div>}
        </div>
      </div>
    );
  }

  // MODIFICAR PERSONA VIEW
  if (currentView === 'modificar') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-blue-600 text-white p-4">
          <Button variant="secondary" onClick={() => setCurrentView('menu')} className="mb-4">← Volver al Menú</Button>
          <h1 className="text-2xl font-bold">Modificar Datos Personales</h1>
        </div>
        <div className="max-w-2xl mx-auto p-6">
          {!personaConsultada ? (
            <Card title="Buscar Persona">
              <div className="space-y-4">
                <input placeholder="Número de Documento" value={nroDocConsulta} onChange={(e) => setNroDocConsulta(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                <Button onClick={handleConsultarPersona} disabled={loading} className="w-full">
                  {loading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <Card title="Modificar Información">
                <div className="space-y-4">
                  <input placeholder="Primer Nombre" value={formModificar.primer_nombre || ''} onChange={(e) => setFormModificar({...formModificar, primer_nombre: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  <input placeholder="Segundo Nombre" value={formModificar.segundo_nombre || ''} onChange={(e) => setFormModificar({...formModificar, segundo_nombre: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  <input placeholder="Apellidos" value={formModificar.apellidos || ''} onChange={(e) => setFormModificar({...formModificar, apellidos: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  <input type="email" placeholder="Correo" value={formModificar.correo || ''} onChange={(e) => setFormModificar({...formModificar, correo: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  <input type="tel" placeholder="Celular" value={formModificar.celular || ''} onChange={(e) => setFormModificar({...formModificar, celular: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  <Button onClick={handleModificarPersona} disabled={loading} className="w-full">
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </Card>
              <Button variant="secondary" onClick={() => {setPersonaConsultada(null); setFormModificar({});}} className="w-full">
                Buscar Otra Persona
              </Button>
            </>
          )}
          {message && <div className={`p-3 rounded text-center text-white ${messageType === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{message}</div>}
        </div>
      </div>
    );
  }

  // ELIMINAR PERSONA VIEW
  if (currentView === 'eliminar') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-blue-600 text-white p-4">
          <Button variant="secondary" onClick={() => setCurrentView('menu')} className="mb-4">← Volver al Menú</Button>
          <h1 className="text-2xl font-bold">Borrar Personas</h1>
        </div>
        <div className="max-w-2xl mx-auto p-6">
          <Card title="Eliminar Persona">
            <div className="space-y-4">
              <input placeholder="Número de Documento" value={nroDocConsulta} onChange={(e) => setNroDocConsulta(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
              <Button onClick={handleConsultarPersona} disabled={loading} className="w-full">
                {loading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </Card>
          {personaConsultada && (
            <Card title="Información de la Persona">
              <div className="space-y-2 mb-4">
                <p><strong>Nombre:</strong> {personaConsultada.primer_nombre} {personaConsultada.apellidos}</p>
                <p><strong>Documento:</strong> {personaConsultada.nro_doc}</p>
              </div>
              <Button variant="danger" onClick={handleEliminarPersona} disabled={loading} className="w-full">
                {loading ? 'Eliminando...' : 'Confirmar Eliminación'}
              </Button>
              <Button variant="secondary" onClick={() => {setPersonaConsultada(null); setNroDocConsulta('');}} className="w-full mt-2">
                Cancelar
              </Button>
            </Card>
          )}
          {message && <div className={`p-3 rounded text-center text-white ${messageType === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{message}</div>}
        </div>
      </div>
    );
  }

  // CONSULTA NATURAL VIEW
  if (currentView === 'natural') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-blue-600 text-white p-4">
          <Button variant="secondary" onClick={() => setCurrentView('menu')} className="mb-4">← Volver al Menú</Button>
          <h1 className="text-2xl font-bold">Consulta en Lenguaje Natural</h1>
        </div>
        <div className="max-w-2xl mx-auto p-6">
          <Card title="Realizar Consulta">
            <div className="space-y-4">
              <textarea placeholder="Escriba su consulta en lenguaje natural..." value={queryNatural} onChange={(e) => setQueryNatural(e.target.value)} className="w-full px-4 py-2 border rounded-lg h-24" required />
              <Button onClick={handleConsultaNatural} disabled={loading} className="w-full">
                {loading ? 'Procesando...' : 'Enviar Consulta'}
              </Button>
            </div>
          </Card>
          {resultadoNatural && (
            <Card title="Resultado">
              <pre className="bg-gray-50 p-4 rounded overflow-auto">{JSON.stringify(resultadoNatural, null, 2)}</pre>
            </Card>
          )}
          {message && <div className={`p-3 rounded text-center text-white ${messageType === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{message}</div>}
        </div>
      </div>
    );
  }

  // LOGS VIEW
  if (currentView === 'logs') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-blue-600 text-white p-4">
          <Button variant="secondary" onClick={() => setCurrentView('menu')} className="mb-4">← Volver al Menú</Button>
          <h1 className="text-2xl font-bold">Consultar Log</h1>
        </div>
        <div className="max-w-4xl mx-auto p-6">
          <Card title="Filtros de Búsqueda">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <input placeholder="Tipo de Operación" value={filtroLogs.tipo} onChange={(e) => setFiltroLogs({...filtroLogs, tipo: e.target.value})} className="px-4 py-2 border rounded-lg" />
                <input placeholder="Número Documento" value={filtroLogs.documento} onChange={(e) => setFiltroLogs({...filtroLogs, documento: e.target.value})} className="px-4 py-2 border rounded-lg" />
                <input type="date" value={filtroLogs.fecha} onChange={(e) => setFiltroLogs({...filtroLogs, fecha: e.target.value})} className="px-4 py-2 border rounded-lg" />
              </div>
              <Button onClick={handleConsultarLogs} disabled={loading} className="w-full">
                {loading ? 'Cargando...' : 'Buscar Logs'}
              </Button>
            </div>
          </Card>
          {logs.length > 0 && (
            <Card title="Registros de Log">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2 text-left">Operación</th>
                      <th className="p-2 text-left">Usuario</th>
                      <th className="p-2 text-left">Documento</th>
                      <th className="p-2 text-left">Descripción</th>
                      <th className="p-2 text-left">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50">
                        <td className="p-2">{log.tipo_operacion}</td>
                        <td className="p-2">{log.usuario_email}</td>
                        <td className="p-2">{log.documento}</td>
                        <td className="p-2">{log.descripcion}</td>
                        <td className="p-2">{log.fecha}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
          {message && <div className={`p-3 rounded text-center text-white ${messageType === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{message}</div>}
        </div>
      </div>
    );
  }
}