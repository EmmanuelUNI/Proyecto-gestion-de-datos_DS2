import React, { useState } from 'react';
import { LogOut, Plus, Edit2, Search, Trash2, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:8880';

const validaciones = {
  email: (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : 'Email inválido';
  },
  telefono: (value) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(value) ? null : 'Teléfono debe tener 10 dígitos';
  },
  documento: (value) => {
    const regex = /^[0-9]{5,15}$/;
    return regex.test(value) ? null : 'Documento debe tener entre 5 y 15 dígitos';
  },
  nombre: (value) => {
    return value && value.trim().length >= 2 ? null : 'Mínimo 2 caracteres';
  },
  requerido: (value) => {
    return value && value.trim() ? null : 'Este campo es requerido';
  },
  fecha: (value) => {
    if (!value) return 'Fecha requerida';
    const fecha = new Date(value);
    const hoy = new Date();
    if (fecha > hoy) return 'La fecha no puede ser futura';
    const edad = hoy.getFullYear() - fecha.getFullYear();
    if (edad > 120) return 'Fecha inválida';
    return null;
  }
};

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

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
  const [erroresCrear, setErroresCrear] = useState({});

  const [nroDocConsulta, setNroDocConsulta] = useState('');
  const [personaConsultada, setPersonaConsultada] = useState(null);
  const [formModificar, setFormModificar] = useState({});
  const [erroresModificar, setErroresModificar] = useState({});

  const [filtroLogs, setFiltroLogs] = useState({ tipo_operacion: '', documento: '' });
  const [logs, setLogs] = useState([]);

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage('Complete todos los campos', 'error');
      return;
    }

    const emailError = validaciones.email(email);
    if (emailError) {
      showMessage(emailError, 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        setToken(data.access_token);
        setUserEmail(email);
        setCurrentView('menu');
        showMessage('Login exitoso');
      } else {
        showMessage(data.detail || 'Credenciales inválidas', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUserEmail('');
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
    setPersonaConsultada(null);
    setNroDocConsulta('');
  };

  const validarFormCrear = () => {
    const errores = {};

    if (!formCrear.primer_nombre.trim()) errores.primer_nombre = 'Primer nombre requerido';
    else if (validaciones.nombre(formCrear.primer_nombre)) errores.primer_nombre = validaciones.nombre(formCrear.primer_nombre);

    if (!formCrear.apellidos.trim()) errores.apellidos = 'Apellidos requeridos';
    else if (validaciones.nombre(formCrear.apellidos)) errores.apellidos = validaciones.nombre(formCrear.apellidos);

    if (!formCrear.fecha_nacimiento) errores.fecha_nacimiento = 'Fecha de nacimiento requerida';
    else if (validaciones.fecha(formCrear.fecha_nacimiento)) errores.fecha_nacimiento = validaciones.fecha(formCrear.fecha_nacimiento);

    if (!formCrear.genero) errores.genero = 'Género requerido';

    if (!formCrear.correo) errores.correo = 'Correo requerido';
    else if (validaciones.email(formCrear.correo)) errores.correo = validaciones.email(formCrear.correo);

    if (!formCrear.celular) errores.celular = 'Celular requerido';
    else if (validaciones.telefono(formCrear.celular)) errores.celular = validaciones.telefono(formCrear.celular);

    if (!formCrear.nro_doc) errores.nro_doc = 'Número de documento requerido';
    else if (validaciones.documento(formCrear.nro_doc)) errores.nro_doc = validaciones.documento(formCrear.nro_doc);

    if (!formCrear.tipo_doc) errores.tipo_doc = 'Tipo de documento requerido';

    setErroresCrear(errores);
    return Object.keys(errores).length === 0;
  };

  const handleCrearPersona = async () => {
    if (!validarFormCrear()) {
      showMessage('Por favor corrija los errores en el formulario', 'error');
      return;
    }

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
        setErroresCrear({});
      } else {
        showMessage(data.detail || 'Error al crear persona', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const handleConsultarPersona = async () => {
    if (!nroDocConsulta.trim()) {
      showMessage('Ingrese un número de documento', 'error');
      return;
    }

    const docError = validaciones.documento(nroDocConsulta);
    if (docError) {
      showMessage(docError, 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/personas/consultar/${nroDocConsulta}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.data) {
        const persona = Array.isArray(data.data) ? data.data[0] : data.data;
        setPersonaConsultada(persona);
        showMessage('Persona encontrada');
      } else {
        showMessage(data.detail || 'Persona no encontrada', 'error');
        setPersonaConsultada(null);
      }
    } catch (error) {
      showMessage('Error de conexión: ' + error.message, 'error');
      setPersonaConsultada(null);
    }
    setLoading(false);
  };

  const validarFormModificar = () => {
    const errores = {};

    if (formModificar.primer_nombre !== undefined && formModificar.primer_nombre.trim() === '') {
      errores.primer_nombre = 'No puede estar vacío';
    } else if (formModificar.primer_nombre && validaciones.nombre(formModificar.primer_nombre)) {
      errores.primer_nombre = validaciones.nombre(formModificar.primer_nombre);
    }

    if (formModificar.apellidos !== undefined && formModificar.apellidos.trim() === '') {
      errores.apellidos = 'No puede estar vacío';
    } else if (formModificar.apellidos && validaciones.nombre(formModificar.apellidos)) {
      errores.apellidos = validaciones.nombre(formModificar.apellidos);
    }

    if (formModificar.correo && validaciones.email(formModificar.correo)) {
      errores.correo = validaciones.email(formModificar.correo);
    }

    if (formModificar.celular && validaciones.telefono(formModificar.celular)) {
      errores.celular = validaciones.telefono(formModificar.celular);
    }

    setErroresModificar(errores);
    return Object.keys(errores).length === 0;
  };

  const handleModificarPersona = async () => {
    if (Object.keys(formModificar).length === 0) {
      showMessage('No hay cambios para guardar', 'error');
      return;
    }

    if (!validarFormModificar()) {
      showMessage('Por favor corrija los errores en el formulario', 'error');
      return;
    }

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
        setErroresModificar({});
        setPersonaConsultada(null);
        setNroDocConsulta('');
      } else {
        showMessage(data.detail || 'Error al modificar', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const handleEliminarPersona = async () => {
    if (!window.confirm(`¿Está seguro de eliminar a ${personaConsultada.primer_nombre} ${personaConsultada.apellidos}?`)) {
      return;
    }

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
        const data = await response.json();
        showMessage(data.detail || 'Error al eliminar', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const handleConsultarLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroLogs.tipo_operacion) params.append('tipo_operacion', filtroLogs.tipo_operacion);
      if (filtroLogs.documento) params.append('documento', filtroLogs.documento);

      const response = await fetch(`${API_URL}/logs?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        const logsData = data.data || [];
        setLogs(Array.isArray(logsData) ? logsData : []);
        showMessage(`Se encontraron ${logsData.length} registros`);
      } else {
        showMessage(data.detail || 'Error al consultar logs', 'error');
        setLogs([]);
      }
    } catch (error) {
      showMessage('Error de conexión: ' + error.message, 'error');
      setLogs([]);
    }
    setLoading(false);
  };

  const Button = ({ onClick, children, variant = 'primary', disabled = false, className = '' }) => {
    const baseStyle = 'px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2';
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed',
      danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed',
      secondary: 'bg-gray-300 text-black hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed'
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

  const Input = ({ label, type = 'text', value, onChange, error, required = false, placeholder = '', ...props }) => (
    <div>
      <label className="block text-gray-700 mb-2 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-600'
        }`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
    </div>
  );

  const Select = ({ label, value, onChange, options, error, required = false }) => (
    <div>
      <label className="block text-gray-700 mb-2 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-600'
        }`}
      >
        <option value="">Seleccione...</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="text-red-500 text-sm mt-1 flex items-center gap-1"><AlertCircle size={14} /> {error}</p>}
    </div>
  );

  const Alert = ({ message, type }) => {
    if (!message) return null;
    const isError = type === 'error';
    return (
      <div className={`p-4 rounded-lg flex items-center gap-2 ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
        {isError ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
        <span>{message}</span>
      </div>
    );
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Gestión de Personas</h1>
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="correo@ejemplo.com"
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </Button>
          </div>
          {message && <div className="mt-4"><Alert message={message} type={messageType} /></div>}
        </div>
      </div>
    );
  }

  if (currentView === 'menu') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-lg">
          <div>
            <h1 className="text-2xl font-bold">Sistema de Gestión de Personas</h1>
            <p className="text-sm opacity-90">Usuario: {userEmail}</p>
          </div>
          <Button variant="danger" onClick={handleLogout}>
            <LogOut size={20} /> Salir
          </Button>
        </div>
        <div className="max-w-6xl mx-auto p-6">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Menú Principal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button onClick={() => setCurrentView('crear')} className="bg-green-500 hover:bg-green-600 text-white p-8 rounded-lg text-center font-bold transition-all transform hover:scale-105 shadow-lg">
              <Plus size={48} className="mx-auto mb-3" />
              <span className="text-lg">Crear Personas</span>
            </button>
            <button onClick={() => setCurrentView('consultar')} className="bg-blue-500 hover:bg-blue-600 text-white p-8 rounded-lg text-center font-bold transition-all transform hover:scale-105 shadow-lg">
              <Search size={48} className="mx-auto mb-3" />
              <span className="text-lg">Consultar Datos</span>
            </button>
            <button onClick={() => setCurrentView('modificar')} className="bg-orange-500 hover:bg-orange-600 text-white p-8 rounded-lg text-center font-bold transition-all transform hover:scale-105 shadow-lg">
              <Edit2 size={48} className="mx-auto mb-3" />
              <span className="text-lg">Modificar Datos</span>
            </button>
            <button onClick={() => setCurrentView('eliminar')} className="bg-red-500 hover:bg-red-600 text-white p-8 rounded-lg text-center font-bold transition-all transform hover:scale-105 shadow-lg">
              <Trash2 size={48} className="mx-auto mb-3" />
              <span className="text-lg">Eliminar Personas</span>
            </button>
            <button onClick={() => setCurrentView('logs')} className="bg-gray-600 hover:bg-gray-700 text-white p-8 rounded-lg text-center font-bold transition-all transform hover:scale-105 shadow-lg">
              <FileText size={48} className="mx-auto mb-3" />
              <span className="text-lg">Consultar Logs</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'crear') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-blue-600 text-white p-4">
          <Button variant="secondary" onClick={() => setCurrentView('menu')} className="mb-4">
            ← Volver al Menú
          </Button>
          <h1 className="text-2xl font-bold">Crear Nueva Persona</h1>
        </div>
        <div className="max-w-3xl mx-auto p-6">
          <Card title="Formulario de Registro">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Input
                label="Primer Nombre"
                value={formCrear.primer_nombre}
                onChange={(e) => setFormCrear({...formCrear, primer_nombre: e.target.value})}
                error={erroresCrear.primer_nombre}
                required
              />
              <Input
                label="Segundo Nombre"
                value={formCrear.segundo_nombre}
                onChange={(e) => setFormCrear({...formCrear, segundo_nombre: e.target.value})}
              />
              <Input
                label="Apellidos"
                value={formCrear.apellidos}
                onChange={(e) => setFormCrear({...formCrear, apellidos: e.target.value})}
                error={erroresCrear.apellidos}
                required
              />
              <Input
                label="Fecha de Nacimiento"
                type="date"
                value={formCrear.fecha_nacimiento}
                onChange={(e) => setFormCrear({...formCrear, fecha_nacimiento: e.target.value})}
                error={erroresCrear.fecha_nacimiento}
                required
              />
              <Select
                label="Género"
                value={formCrear.genero}
                onChange={(e) => setFormCrear({...formCrear, genero: e.target.value})}
                options={[
                  { value: 'M', label: 'Masculino' },
                  { value: 'F', label: 'Femenino' },
                  { value: 'O', label: 'Otro' }
                ]}
                error={erroresCrear.genero}
                required
              />
              <Select
                label="Tipo de Documento"
                value={formCrear.tipo_doc}
                onChange={(e) => setFormCrear({...formCrear, tipo_doc: e.target.value})}
                options={[
                  { value: 'CC', label: 'Cédula de Ciudadanía' },
                  { value: 'TI', label: 'Tarjeta de Identidad' },
                  { value: 'CE', label: 'Cédula de Extranjería' },
                  { value: 'PA', label: 'Pasaporte' }
                ]}
                error={erroresCrear.tipo_doc}
                required
              />
              <Input
                label="Número de Documento"
                value={formCrear.nro_doc}
                onChange={(e) => setFormCrear({...formCrear, nro_doc: e.target.value})}
                error={erroresCrear.nro_doc}
                required
                placeholder="1234567890"
              />
              <Input
                label="Correo Electrónico"
                type="email"
                value={formCrear.correo}
                onChange={(e) => setFormCrear({...formCrear, correo: e.target.value})}
                error={erroresCrear.correo}
                required
                placeholder="correo@ejemplo.com"
              />
              <Input
                label="Celular"
                value={formCrear.celular}
                onChange={(e) => setFormCrear({...formCrear, celular: e.target.value})}
                error={erroresCrear.celular}
                required
                placeholder="3001234567"
              />
            </div>
            <Button onClick={handleCrearPersona} disabled={loading} className="w-full">
              {loading ? 'Guardando...' : 'Crear Persona'}
            </Button>
          </Card>
          {message && <Alert message={message} type={messageType} />}
        </div>
      </div>
    );
  }

  if (currentView === 'consultar') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-blue-600 text-white p-4">
          <Button variant="secondary" onClick={() => setCurrentView('menu')} className="mb-4">
            ← Volver al Menú
          </Button>
          <h1 className="text-2xl font-bold">Consultar Datos Personales</h1>
        </div>
        <div className="max-w-2xl mx-auto p-6">
          <Card title="Buscar Persona">
            <div className="flex gap-4">
              <Input
                label="Número de Documento"
                value={nroDocConsulta}
                onChange={(e) => setNroDocConsulta(e.target.value)}
                placeholder="1234567890"
                className="flex-1"
              />
              <div className="flex items-end">
                <Button onClick={handleConsultarPersona} disabled={loading}>
                  <Search size={20} /> {loading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </div>
          </Card>
          {personaConsultada && (
            <Card title="Información de la Persona">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre Completo</p>
                  <p className="font-semibold">{personaConsultada.primer_nombre} {personaConsultada.segundo_nombre} {personaConsultada.apellidos}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Documento</p>
                  <p className="font-semibold">{personaConsultada.tipo_doc} {personaConsultada.nro_doc}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Correo</p>
                  <p className="font-semibold">{personaConsultada.correo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Celular</p>
                  <p className="font-semibold">{personaConsultada.celular}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                  <p className="font-semibold">{personaConsultada.fecha_nacimiento}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Género</p>
                  <p className="font-semibold">{personaConsultada.genero === 'M' ? 'Masculino' : personaConsultada.genero === 'F' ? 'Femenino' : 'Otro'}</p>
                </div>
              </div>
            </Card>
          )}
          {message && <Alert message={message} type={messageType} />}
        </div>
      </div>
    );
  }

  if (currentView === 'modificar') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-blue-600 text-white p-4">
          <Button variant="secondary" onClick={() => {
            setCurrentView('menu');
            setPersonaConsultada(null);
            setFormModificar({});
            setNroDocConsulta('');
          }} className="mb-4">
            ← Volver al Menú
          </Button>
          <h1 className="text-2xl font-bold">Modificar Datos Personales</h1>
        </div>
        <div className="max-w-3xl mx-auto p-6">
          {!personaConsultada ? (
            <Card title="Buscar Persona">
              <div className="flex gap-4">
                <Input
                  label="Número de Documento"
                  value={nroDocConsulta}
                  onChange={(e) => setNroDocConsulta(e.target.value)}
                  placeholder="1234567890"
                  className="flex-1"
                />
                <div className="flex items-end">
                  <Button onClick={handleConsultarPersona} disabled={loading}>
                    <Search size={20} /> {loading ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <Card title="Datos Actuales">
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="font-semibold text-lg mb-2">{personaConsultada.primer_nombre} {personaConsultada.segundo_nombre} {personaConsultada.apellidos}</p>
                  <p className="text-sm text-gray-600">Documento: {personaConsultada.tipo_doc} {personaConsultada.nro_doc}</p>
                </div>
              </Card>
              <Card title="Modificar Información">
                <p className="text-sm text-gray-600 mb-4">Solo complete los campos que desea modificar</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Input
                    label="Primer Nombre"
                    value={formModificar.primer_nombre || ''}
                    onChange={(e) => setFormModificar({...formModificar, primer_nombre: e.target.value})}
                    error={erroresModificar.primer_nombre}
                    placeholder={personaConsultada.primer_nombre}
                  />
                  <Input
                    label="Segundo Nombre"
                    value={formModificar.segundo_nombre || ''}
                    onChange={(e) => setFormModificar({...formModificar, segundo_nombre: e.target.value})}
                    placeholder={personaConsultada.segundo_nombre || 'Sin segundo nombre'}
                  />
                  <Input
                    label="Apellidos"
                    value={formModificar.apellidos || ''}
                    onChange={(e) => setFormModificar({...formModificar, apellidos: e.target.value})}
                    error={erroresModificar.apellidos}
                    placeholder={personaConsultada.apellidos}
                  />
                  <Input
                    label="Correo Electrónico"
                    type="email"
                    value={formModificar.correo || ''}
                    onChange={(e) => setFormModificar({...formModificar, correo: e.target.value})}
                    error={erroresModificar.correo}
                    placeholder={personaConsultada.correo}
                  />
                  <Input
                    label="Celular"
                    value={formModificar.celular || ''}
                    onChange={(e) => setFormModificar({...formModificar, celular: e.target.value})}
                    error={erroresModificar.celular}
                    placeholder={personaConsultada.celular}
                  />
                  <Select
                    label="Género"
                    value={formModificar.genero || ''}
                    onChange={(e) => setFormModificar({...formModificar, genero: e.target.value})}
                    options={[
                      { value: 'M', label: 'Masculino' },
                      { value: 'F', label: 'Femenino' },
                      { value: 'O', label: 'Otro' }
                    ]}
                  />
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleModificarPersona} disabled={loading} className="flex-1">
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                  <Button variant="secondary" onClick={() => {
                    setPersonaConsultada(null);
                    setFormModificar({});
                    setErroresModificar({});
                    setNroDocConsulta('');
                  }} className="flex-1">
                    Buscar Otra Persona
                  </Button>
                </div>
              </Card>
            </>
          )}
          {message && <Alert message={message} type={messageType} />}
        </div>
      </div>
    );
  }

  if (currentView === 'eliminar') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-blue-600 text-white p-4">
          <Button variant="secondary" onClick={() => {
            setCurrentView('menu');
            setPersonaConsultada(null);
            setNroDocConsulta('');
          }} className="mb-4">
            ← Volver al Menú
          </Button>
          <h1 className="text-2xl font-bold">Eliminar Personas</h1>
        </div>
        <div className="max-w-2xl mx-auto p-6">
          <Card title="Buscar Persona a Eliminar">
            <div className="flex gap-4">
              <Input
                label="Número de Documento"
                value={nroDocConsulta}
                onChange={(e) => setNroDocConsulta(e.target.value)}
                placeholder="1234567890"
                className="flex-1"
              />
              <div className="flex items-end">
                <Button onClick={handleConsultarPersona} disabled={loading}>
                  <Search size={20} /> {loading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </div>
          </Card>
          {personaConsultada && (
            <Card title="Confirmar Eliminación">
              <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg mb-4">
                <p className="text-red-800 font-semibold mb-2">⚠️ Esta acción no se puede deshacer</p>
                <div className="space-y-2 text-sm">
                  <p><strong>Nombre:</strong> {personaConsultada.primer_nombre} {personaConsultada.segundo_nombre} {personaConsultada.apellidos}</p>
                  <p><strong>Documento:</strong> {personaConsultada.tipo_doc} {personaConsultada.nro_doc}</p>
                  <p><strong>Correo:</strong> {personaConsultada.correo}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="danger" onClick={handleEliminarPersona} disabled={loading} className="flex-1">
                  {loading ? 'Eliminando...' : 'Confirmar Eliminación'}
                </Button>
                <Button variant="secondary" onClick={() => {
                  setPersonaConsultada(null);
                  setNroDocConsulta('');
                }} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </Card>
          )}
          {message && <Alert message={message} type={messageType} />}
        </div>
      </div>
    );
  }

  if (currentView === 'logs') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-blue-600 text-white p-4">
          <Button variant="secondary" onClick={() => setCurrentView('menu')} className="mb-4">
            ← Volver al Menú
          </Button>
          <h1 className="text-2xl font-bold">Consultar Logs del Sistema</h1>
        </div>
        <div className="max-w-6xl mx-auto p-6">
          <Card title="Filtros de Búsqueda">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Select
                label="Tipo de Operación"
                value={filtroLogs.tipo_operacion}
                onChange={(e) => setFiltroLogs({...filtroLogs, tipo_operacion: e.target.value})}
                options={[
                  { value: 'CREAR', label: 'Crear' },
                  { value: 'CONSULTAR', label: 'Consultar' },
                  { value: 'MODIFICAR', label: 'Modificar' },
                  { value: 'ELIMINAR', label: 'Eliminar' }
                ]}
              />
              <Input
                label="Número de Documento"
                value={filtroLogs.documento}
                onChange={(e) => setFiltroLogs({...filtroLogs, documento: e.target.value})}
                placeholder="1234567890"
              />
              <div className="flex items-end">
                <Button onClick={handleConsultarLogs} disabled={loading} className="w-full">
                  <Search size={20} /> {loading ? 'Buscando...' : 'Buscar Logs'}
                </Button>
              </div>
            </div>
            <Button variant="secondary" onClick={() => {
              setFiltroLogs({ tipo_operacion: '', documento: '' });
              handleConsultarLogs();
            }} className="w-full">
              Mostrar Todos los Logs
            </Button>
          </Card>
          {logs.length > 0 ? (
            <Card title={`Registros Encontrados (${logs.length})`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-3 text-left font-semibold">Operación</th>
                      <th className="p-3 text-left font-semibold">Usuario</th>
                      <th className="p-3 text-left font-semibold">Documento</th>
                      <th className="p-3 text-left font-semibold">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            log.tipo_operacion === 'CREAR' ? 'bg-green-100 text-green-800' :
                            log.tipo_operacion === 'MODIFICAR' ? 'bg-orange-100 text-orange-800' :
                            log.tipo_operacion === 'ELIMINAR' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {log.tipo_operacion}
                          </span>
                        </td>
                        <td className="p-3">{log.usuario_email}</td>
                        <td className="p-3">{log.documento_afectado}</td>
                        <td className="p-3">{new Date(log.fecha_transaccion).toLocaleString('es-CO')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card title="Sin Resultados">
              <p className="text-center text-gray-500 py-8">No se encontraron registros con los filtros seleccionados</p>
            </Card>
          )}
          {message && <Alert message={message} type={messageType} />}
        </div>
      </div>
    );
  }

  return null;
}