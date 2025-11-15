import React, { useState, useEffect } from 'react';
import { LogOut, Plus, Edit2, Search, Trash2, FileText, AlertCircle, CheckCircle, User, Mail, Phone, Calendar, CreditCard, Users, Upload, X, UserPlus, Lock } from 'lucide-react';

const API_URL = '';

// Imagen placeholder SVG en Base64
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e5e7eb'/%3E%3Cpath d='M100 85c-13.8 0-25 11.2-25 25s11.2 25 25 25 25-11.2 25-25-11.2-25-25-25zm0 40c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15z' fill='%239ca3af'/%3E%3Cpath d='M140 150c0-22.1-17.9-40-40-40s-40 17.9-40 40v10h80v-10z' fill='%239ca3af'/%3E%3C/svg%3E";

const validaciones = {
  email: (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : 'Email inválido';
  },
  telefono: (value) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(value) ? null : 'Celular debe tener exactamente 10 dígitos';
  },
  documento: (value) => {
    const regex = /^[0-9]{1,10}$/;
    if (!regex.test(value)) return 'Documento debe ser numérico y máximo 10 dígitos';
    return null;
  },
  primerNombre: (value) => {
    if (!value || value.trim().length === 0) return 'Primer nombre requerido';
    if (/\d/.test(value)) return 'El nombre no puede contener números';
    if (value.length > 30) return 'Máximo 30 caracteres';
    return null;
  },
  segundoNombre: (value) => {
    if (!value || value.trim().length === 0) return null;
    if (/\d/.test(value)) return 'El nombre no puede contener números';
    if (value.length > 30) return 'Máximo 30 caracteres';
    return null;
  },
  apellidos: (value) => {
    if (!value || value.trim().length === 0) return 'Apellidos requeridos';
    if (/\d/.test(value)) return 'Los apellidos no pueden contener números';
    if (value.length > 60) return 'Máximo 60 caracteres';
    return null;
  },
  fecha: (value) => {
    if (!value) return 'Fecha de nacimiento requerida';
    const fecha = new Date(value);
    const hoy = new Date();
    if (fecha > hoy) return 'La fecha no puede ser futura';
    const edad = hoy.getFullYear() - fecha.getFullYear();
    if (edad > 120) return 'Fecha inválida';
    if (edad < 0) return 'Fecha inválida';
    return null;
  },
  foto: (file) => {
    if (!file) return 'Foto requerida';
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) return 'La foto no debe superar los 2MB';
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) return 'Formato inválido. Use JPG, PNG o GIF';
    return null;
  },
  password: (value) => {
    if (!value || value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return null;
  },
  nombre: (value) => {
    if (!value || value.trim().length === 0) return 'Nombre completo requerido';
    if (value.length > 100) return 'Máximo 100 caracteres';
    return null;
  },
  codigo: (value) => {
    if (!value || value.trim().length === 0) return 'Código requerido';
    if (!/^[0-9]{6}$/.test(value)) return 'El código debe tener 6 dígitos';
    return null;
  }
};

const Button = ({ onClick, children, variant = 'primary', disabled = false, className = '' }) => {
  const baseStyle = 'px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl';
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed',
    danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed',
    success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed'
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-xl p-8 mb-6 transform transition-all duration-300 hover:shadow-2xl border border-gray-100 animate-fadeIn ${className}`}>
    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
      <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
      {title}
    </h2>
    {children}
  </div>
);

const Input = ({ label, type = 'text', value, onChange, error, required = false, placeholder = '', icon: Icon, maxLength, ...props }) => (
  <div className="group">
    <label className="block text-gray-700 mb-2 font-semibold text-sm">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
          <Icon size={20} />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
          error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-200 focus:ring-blue-600 focus:border-blue-600 bg-gray-50 hover:bg-white'
        }`}
        {...props}
      />
      {maxLength && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
          {value?.length || 0}/{maxLength}
        </div>
      )}
    </div>
    {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-slideDown"><AlertCircle size={14} /> {error}</p>}
  </div>
);

const Select = ({ label, value, onChange, options, error, required = false, icon: Icon }) => (
  <div className="group">
    <label className="block text-gray-700 mb-2 font-semibold text-sm">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10">
          <Icon size={20} />
        </div>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 appearance-none bg-gray-50 hover:bg-white ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-600 focus:border-blue-600'
        }`}
      >
        <option value="">Seleccione...</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-slideDown"><AlertCircle size={14} /> {error}</p>}
  </div>
);

const ImageUpload = ({ label, value, onChange, error, required = false }) => {
  const [preview, setPreview] = useState(value || null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file) => {
    if (!file) return;

    const validationError = validaciones.foto(file);
    if (validationError) {
      onChange(null, validationError);
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setPreview(base64String);
      onChange(base64String, null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    setPreview(null);
    onChange(null, null);
  };

  return (
    <div className="group">
      <label className="block text-gray-700 mb-2 font-semibold text-sm">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
            isDragging 
              ? 'border-blue-600 bg-blue-50' 
              : error 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 bg-gray-50 hover:border-blue-600 hover:bg-blue-50'
          }`}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={(e) => handleFileChange(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className={`mx-auto mb-4 ${error ? 'text-red-500' : 'text-gray-400'}`} size={48} />
            <p className="text-gray-600 font-semibold mb-2">
              Haga clic para seleccionar o arrastre una imagen
            </p>
            <p className="text-sm text-gray-500">JPG, PNG o GIF - Máximo 2MB</p>
          </label>
        </div>
      ) : (
        <div className="relative border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
          <img src={preview} alt="Vista previa" className="w-full h-64 object-contain rounded-lg mb-4" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-6 right-6 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
          >
            <X size={20} />
          </button>
          <p className="text-sm text-gray-600 text-center">Imagen cargada correctamente</p>
        </div>
      )}
      
      {error && <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-slideDown"><AlertCircle size={14} /> {error}</p>}
    </div>
  );
};

const Alert = ({ message, type }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div className={`p-4 rounded-xl flex items-center gap-3 animate-slideDown shadow-lg ${isError ? 'bg-red-50 text-red-700 border-2 border-red-200' : 'bg-green-50 text-green-700 border-2 border-green-200'}`}>
      {isError ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
      <span className="font-semibold">{message}</span>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, delay = 0 }) => (
  <div 
    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 animate-slideUp"
    style={{ 
      borderColor: color,
      animationDelay: `${delay}ms`
    }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="p-4 rounded-xl" style={{ backgroundColor: color + '20' }}>
        <Icon size={32} style={{ color }} />
      </div>
    </div>
  </div>
);

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [stats, setStats] = useState({ total: 0, created: 0, modified: 0, consulted: 0 });

  // Estados para registro
  const [registroEmail, setRegistroEmail] = useState('');
  const [registroPassword, setRegistroPassword] = useState('');
  const [registroNombre, setRegistroNombre] = useState('');
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
  const [esperandoCodigo, setEsperandoCodigo] = useState(false);
  const [emailRegistrado, setEmailRegistrado] = useState('');
  const [erroresRegistro, setErroresRegistro] = useState({});

  const [formCrear, setFormCrear] = useState({
    primer_nombre: '',
    segundo_nombre: '',
    apellidos: '',
    fecha_nacimiento: '',
    genero: '',
    correo: '',
    celular: '',
    nro_doc: '',
    tipo_doc: '',
    foto: ''
  });
  const [erroresCrear, setErroresCrear] = useState({});

  const [nroDocConsulta, setNroDocConsulta] = useState('');
  const [personaConsultada, setPersonaConsultada] = useState(null);
  const [formModificar, setFormModificar] = useState({});
  const [erroresModificar, setErroresModificar] = useState({});

  const [filtroLogs, setFiltroLogs] = useState({ tipo_operacion: '', documento: '' });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (token && currentView === 'menu') {
      fetchStats();
    }
  }, [token, currentView]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.data) {
        const logsData = Array.isArray(data.data) ? data.data : [];
        setStats({
          total: logsData.length,
          created: logsData.filter(l => l.tipo_operacion === 'CREAR').length,
          modified: logsData.filter(l => l.tipo_operacion === 'MODIFICAR').length,
          consulted: logsData.filter(l => l.tipo_operacion === 'CONSULTAR').length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const validarFormRegistro = () => {
    const errores = {};

    const errorEmail = validaciones.email(registroEmail);
    if (errorEmail) errores.email = errorEmail;

    const errorPassword = validaciones.password(registroPassword);
    if (errorPassword) errores.password = errorPassword;

    const errorNombre = validaciones.nombre(registroNombre);
    if (errorNombre) errores.nombre = errorNombre;

    setErroresRegistro(errores);
    return Object.keys(errores).length === 0;
  };

  const handleSignup = async () => {
    if (!validarFormRegistro()) {
      showMessage('Por favor corrija los errores en el formulario', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registroEmail,
          password: registroPassword,
          name: registroNombre
        })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Usuario creado. Revise su email para el código de verificación');
        setEmailRegistrado(registroEmail);
        setEsperandoCodigo(true);
      } else {
        showMessage(data.detail || 'Error al crear usuario', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión: ' + error.message, 'error');
    }
    setLoading(false);
  };

  const handleVerifyEmail = async () => {
    const errorCodigo = validaciones.codigo(codigoVerificacion);
    if (errorCodigo) {
      showMessage(errorCodigo, 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailRegistrado,
          code: codigoVerificacion
        })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('Email verificado correctamente. Ya puede iniciar sesión');
        // Resetear estados de registro
        setRegistroEmail('');
        setRegistroPassword('');
        setRegistroNombre('');
        setCodigoVerificacion('');
        setEsperandoCodigo(false);
        setEmailRegistrado('');
        setErroresRegistro({});
        setCurrentView('login');
      } else {
        showMessage(data.detail || 'Código incorrecto', 'error');
      }
    } catch (error) {
      showMessage('Error de conexión: ' + error.message, 'error');
    }
    setLoading(false);
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
      showMessage('Error de conexión', 'error');
      console.error('Error:', error);
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
      tipo_doc: '',
      foto: ''
    });
    setPersonaConsultada(null);
    setNroDocConsulta('');
  };

  const validarFormCrear = () => {
    const errores = {};

    const errorPrimerNombre = validaciones.primerNombre(formCrear.primer_nombre);
    if (errorPrimerNombre) errores.primer_nombre = errorPrimerNombre;

    const errorSegundoNombre = validaciones.segundoNombre(formCrear.segundo_nombre);
    if (errorSegundoNombre) errores.segundo_nombre = errorSegundoNombre;

    const errorApellidos = validaciones.apellidos(formCrear.apellidos);
    if (errorApellidos) errores.apellidos = errorApellidos;

    const errorFecha = validaciones.fecha(formCrear.fecha_nacimiento);
    if (errorFecha) errores.fecha_nacimiento = errorFecha;

    if (!formCrear.genero) errores.genero = 'Género requerido';

    if (!formCrear.correo) errores.correo = 'Correo requerido';
    else if (validaciones.email(formCrear.correo)) errores.correo = validaciones.email(formCrear.correo);

    if (!formCrear.celular) errores.celular = 'Celular requerido';
    else if (validaciones.telefono(formCrear.celular)) errores.celular = validaciones.telefono(formCrear.celular);

    if (!formCrear.nro_doc) errores.nro_doc = 'Número de documento requerido';
    else if (validaciones.documento(formCrear.nro_doc)) errores.nro_doc = validaciones.documento(formCrear.nro_doc);

    if (!formCrear.tipo_doc) errores.tipo_doc = 'Tipo de documento requerido';

    if (!formCrear.foto) errores.foto = 'Foto requerida';

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
          tipo_doc: '',
          foto: ''
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

    if (formModificar.primer_nombre !== undefined) {
      const error = validaciones.primerNombre(formModificar.primer_nombre);
      if (error) errores.primer_nombre = error;
    }

    if (formModificar.segundo_nombre !== undefined) {
      const error = validaciones.segundoNombre(formModificar.segundo_nombre);
      if (error) errores.segundo_nombre = error;
    }

    if (formModificar.apellidos !== undefined) {
      const error = validaciones.apellidos(formModificar.apellidos);
      if (error) errores.apellidos = error;
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

  // VISTA DE LOGIN Y REGISTRO
  if (!token) {
    if (currentView === 'signup' && !esperandoCodigo) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md relative z-10 border border-white/20 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-green-600 to-green-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
                <UserPlus size={40} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Crear Cuenta</h1>
              <p className="text-gray-600 font-medium">Regístrese en el sistema</p>
            </div>

            <div className="space-y-5">
              <Input
                label="Nombre Completo"
                type="text"
                value={registroNombre}
                onChange={(e) => setRegistroNombre(e.target.value)}
                error={erroresRegistro.nombre}
                required
                placeholder="Juan Pérez García"
                icon={User}
                maxLength={100}
              />
              <Input
                label="Correo Electrónico"
                type="email"
                value={registroEmail}
                onChange={(e) => setRegistroEmail(e.target.value)}
                error={erroresRegistro.email}
                required
                placeholder="correo@ejemplo.com"
                icon={Mail}
              />
              <Input
                label="Contraseña"
                type="password"
                value={registroPassword}
                onChange={(e) => setRegistroPassword(e.target.value)}
                error={erroresRegistro.password}
                required
                placeholder="Mínimo 6 caracteres"
                icon={Lock}
              />
              <Button onClick={handleSignup} disabled={loading} className="w-full text-lg py-4" variant="success">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Crear Cuenta
                  </>
                )}
              </Button>
              <Button onClick={() => setCurrentView('login')} variant="secondary" className="w-full text-lg py-4">
                ← Volver al Login
              </Button>
            </div>

            {message && <div className="mt-6"><Alert message={message} type={messageType} /></div>}
          </div>
        </div>
      );
    }

    if (esperandoCodigo) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md relative z-10 border border-white/20 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Mail size={40} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Verificar Email</h1>
              <p className="text-gray-600 font-medium">Se envió un código a:</p>
              <p className="text-purple-600 font-bold mt-1">{emailRegistrado}</p>
            </div>

            <div className="space-y-5">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-purple-800 text-center">
                  💡 Revise su bandeja de entrada o spam
                </p>
              </div>
              <Input
                label="Código de Verificación"
                type="text"
                value={codigoVerificacion}
                onChange={(e) => setCodigoVerificacion(e.target.value)}
                required
                placeholder="123456"
                icon={Lock}
                maxLength={6}
                onKeyPress={(e) => e.key === 'Enter' && handleVerifyEmail()}
              />
              <Button onClick={handleVerifyEmail} disabled={loading} className="w-full text-lg py-4" variant="success">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Verificar Email
                  </>
                )}
              </Button>
              <Button 
                onClick={() => {
                  setEsperandoCodigo(false);
                  setCodigoVerificacion('');
                  setCurrentView('login');
                }} 
                variant="secondary" 
                className="w-full text-lg py-4"
              >
                Cancelar
              </Button>
            </div>

            {message && <div className="mt-6"><Alert message={message} type={messageType} /></div>}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md relative z-10 border border-white/20 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
              <Users size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Sistema de Gestión</h1>
            <p className="text-gray-600 font-medium">Plataforma de Datos Personales</p>
          </div>

          <div className="space-y-5">
            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="correo@ejemplo.com"
              icon={Mail}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              icon={Lock}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} disabled={loading} className="w-full text-lg py-4">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Cargando...
                </>
              ) : (
                <>
                  <LogOut size={20} className="rotate-180" />
                  Iniciar Sesión
                </>
              )}
            </Button>
            <Button onClick={() => setCurrentView('signup')} variant="success" className="w-full text-lg py-4">
              <UserPlus size={20} />
              Crear Cuenta Nueva
            </Button>
          </div>

          {message && <div className="mt-6"><Alert message={message} type={messageType} /></div>}

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">Sistema de Gestión de Datos</p>
            <p className="text-xs text-gray-400 mt-1">Seguro y Confiable</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <Users size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Sistema de Gestión de Personas</h1>
                <p className="text-blue-200 text-sm flex items-center gap-2 mt-1">
                  <User size={16} />
                  {userEmail}
                </p>
              </div>
            </div>
            <Button variant="danger" onClick={handleLogout}>
              <LogOut size={20} /> Cerrar Sesión
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total de Operaciones" value={stats.total} icon={FileText} color="#3B82F6" delay={0} />
            <StatCard title="Personas Creadas" value={stats.created} icon={Plus} color="#10B981" delay={100} />
            <StatCard title="Modificaciones" value={stats.modified} icon={Edit2} color="#F59E0B" delay={200} />
            <StatCard title="Consultas" value={stats.consulted} icon={Search} color="#8B5CF6" delay={300} />
          </div>

          <h2 className="text-3xl font-bold mb-6 text-gray-800">Panel de Control</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button 
              onClick={() => setCurrentView('crear')} 
              className="group bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-10 rounded-2xl text-center font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl animate-slideUp"
              style={{ animationDelay: '0ms' }}
            >
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus size={48} />
              </div>
              <span className="text-xl">Crear Personas</span>
              <p className="text-green-100 text-sm mt-2 opacity-90">Registrar nuevas personas en el sistema</p>
            </button>

            <button 
              onClick={() => setCurrentView('consultar')} 
              className="group bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white p-10 rounded-2xl text-center font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl animate-slideUp"
              style={{ animationDelay: '100ms' }}
            >
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Search size={48} />
              </div>
              <span className="text-xl">Consultar Datos</span>
              <p className="text-blue-100 text-sm mt-2 opacity-90">Buscar información de personas</p>
            </button>

            <button 
              onClick={() => setCurrentView('modificar')} 
              className="group bg-gradient-to-br from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white p-10 rounded-2xl text-center font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl animate-slideUp"
              style={{ animationDelay: '200ms' }}
            >
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Edit2 size={48} />
              </div>
              <span className="text-xl">Modificar Datos</span>
              <p className="text-orange-100 text-sm mt-2 opacity-90">Actualizar información existente</p>
            </button>

            <button 
              onClick={() => setCurrentView('eliminar')} 
              className="group bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white p-10 rounded-2xl text-center font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl animate-slideUp"
              style={{ animationDelay: '300ms' }}
            >
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Trash2 size={48} />
              </div>
              <span className="text-xl">Eliminar Personas</span>
              <p className="text-red-100 text-sm mt-2 opacity-90">Remover registros del sistema</p>
            </button>

            <button 
              onClick={() => setCurrentView('logs')} 
              className="group bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white p-10 rounded-2xl text-center font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl animate-slideUp"
              style={{ animationDelay: '400ms' }}
            >
              <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileText size={48} />
              </div>
              <span className="text-xl">Consultar Logs</span>
              <p className="text-purple-100 text-sm mt-2 opacity-90">Historial de operaciones</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'crear') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 shadow-xl">
          <Button variant="secondary" onClick={() => setCurrentView('menu')} className="mb-4">
            ← Volver al Menú
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Plus size={32} />
            Crear Nueva Persona
          </h1>
          <p className="text-green-100 mt-2">Complete el formulario para registrar una nueva persona</p>
        </div>

        <div className="max-w-5xl mx-auto p-8">
          <Card title="Formulario de Registro">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Input
                label="Primer Nombre"
                value={formCrear.primer_nombre}
                onChange={(e) => setFormCrear({...formCrear, primer_nombre: e.target.value})}
                error={erroresCrear.primer_nombre}
                required
                icon={User}
                placeholder="Juan"
                maxLength={30}
              />
              <Input
                label="Segundo Nombre"
                value={formCrear.segundo_nombre}
                onChange={(e) => setFormCrear({...formCrear, segundo_nombre: e.target.value})}
                error={erroresCrear.segundo_nombre}
                icon={User}
                placeholder="Carlos (opcional)"
                maxLength={30}
              />
              <Input
                label="Apellidos"
                value={formCrear.apellidos}
                onChange={(e) => setFormCrear({...formCrear, apellidos: e.target.value})}
                error={erroresCrear.apellidos}
                required
                icon={User}
                placeholder="Pérez García"
                maxLength={60}
              />
              <Input
                label="Fecha de Nacimiento"
                type="date"
                value={formCrear.fecha_nacimiento}
                onChange={(e) => setFormCrear({...formCrear, fecha_nacimiento: e.target.value})}
                error={erroresCrear.fecha_nacimiento}
                required
                icon={Calendar}
              />
              <Select
                label="Género"
                value={formCrear.genero}
                onChange={(e) => setFormCrear({...formCrear, genero: e.target.value})}
                options={[
                  { value: 'Masculino', label: 'Masculino' },
                  { value: 'Femenino', label: 'Femenino' },
                  { value: 'No binario', label: 'No binario' },
                  { value: 'Prefiero no reportar', label: 'Prefiero no reportar' }
                ]}
                error={erroresCrear.genero}
                required
                icon={User}
              />
              <Select
                label="Tipo de Documento"
                value={formCrear.tipo_doc}
                onChange={(e) => setFormCrear({...formCrear, tipo_doc: e.target.value})}
                options={[
                  { value: 'Tarjeta de identidad', label: 'Tarjeta de identidad' },
                  { value: 'Cédula', label: 'Cédula' }
                ]}
                error={erroresCrear.tipo_doc}
                required
                icon={CreditCard}
              />
              <Input
                label="Número de Documento"
                value={formCrear.nro_doc}
                onChange={(e) => setFormCrear({...formCrear, nro_doc: e.target.value})}
                error={erroresCrear.nro_doc}
                required
                placeholder="1234567890"
                icon={CreditCard}
                maxLength={10}
              />
              <Input
                label="Correo Electrónico"
                type="email"
                value={formCrear.correo}
                onChange={(e) => setFormCrear({...formCrear, correo: e.target.value})}
                error={erroresCrear.correo}
                required
                placeholder="correo@ejemplo.com"
                icon={Mail}
              />
              <Input
                label="Celular"
                value={formCrear.celular}
                onChange={(e) => setFormCrear({...formCrear, celular: e.target.value})}
                error={erroresCrear.celular}
                required
                placeholder="3001234567"
                icon={Phone}
                maxLength={10}
              />
            </div>
            
            <div className="mb-8">
              <ImageUpload
                label="Foto"
                value={formCrear.foto}
                onChange={(base64, error) => {
                  setFormCrear({...formCrear, foto: base64});
                  if (error) {
                    setErroresCrear({...erroresCrear, foto: error});
                  } else {
                    const newErrors = {...erroresCrear};
                    delete newErrors.foto;
                    setErroresCrear(newErrors);
                  }
                }}
                error={erroresCrear.foto}
                required
              />
            </div>

            <Button onClick={handleCrearPersona} disabled={loading} className="w-full text-lg py-4">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Plus size={24} />
                  Crear Persona
                </>
              )}
            </Button>
          </Card>
          {message && <Alert message={message} type={messageType} />}
        </div>
      </div>
    );
  }

  if (currentView === 'consultar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 shadow-xl">
          <Button variant="secondary" onClick={() => setCurrentView('menu')} className="mb-4">
            ← Volver al Menú
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Search size={32} />
            Consultar Datos Personales
          </h1>
          <p className="text-blue-100 mt-2">Busque información de personas registradas</p>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          <Card title="Buscar Persona">
            <div className="flex gap-4">
              <Input
                label="Número de Documento"
                value={nroDocConsulta}
                onChange={(e) => setNroDocConsulta(e.target.value)}
                placeholder="1234567890"
                className="flex-1"
                icon={CreditCard}
                onKeyPress={(e) => e.key === 'Enter' && handleConsultarPersona()}
              />
              <div className="flex items-end">
                <Button onClick={handleConsultarPersona} disabled={loading} className="px-8">
                  <Search size={20} /> {loading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </div>
          </Card>

          {personaConsultada && (
            <Card title="Información de la Persona" className="border-l-4 border-blue-600">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl mb-6">
                <div className="flex items-start gap-6">
                  <img 
                    src={personaConsultada.foto || PLACEHOLDER_IMAGE} 
                    alt="Foto de perfil" 
                    className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {personaConsultada.primer_nombre} {personaConsultada.segundo_nombre} {personaConsultada.apellidos}
                    </h3>
                    <p className="text-blue-700 font-semibold">{personaConsultada.tipo_doc} {personaConsultada.nro_doc}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="text-blue-600" size={20} />
                    <p className="text-sm text-gray-600 font-semibold">Correo Electrónico</p>
                  </div>
                  <p className="font-semibold text-gray-800 ml-8">{personaConsultada.correo}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="text-green-600" size={20} />
                    <p className="text-sm text-gray-600 font-semibold">Celular</p>
                  </div>
                  <p className="font-semibold text-gray-800 ml-8">{personaConsultada.celular}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="text-purple-600" size={20} />
                    <p className="text-sm text-gray-600 font-semibold">Fecha de Nacimiento</p>
                  </div>
                  <p className="font-semibold text-gray-800 ml-8">{personaConsultada.fecha_nacimiento}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="text-orange-600" size={20} />
                    <p className="text-sm text-gray-600 font-semibold">Género</p>
                  </div>
                  <p className="font-semibold text-gray-800 ml-8">{personaConsultada.genero}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-gradient-to-r from-orange-600 to-orange-800 text-white p-6 shadow-xl">
          <Button variant="secondary" onClick={() => {
            setCurrentView('menu');
            setPersonaConsultada(null);
            setFormModificar({});
            setNroDocConsulta('');
          }} className="mb-4">
            ← Volver al Menú
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Edit2 size={32} />
            Modificar Datos Personales
          </h1>
          <p className="text-orange-100 mt-2">Actualice la información de personas registradas</p>
        </div>

        <div className="max-w-5xl mx-auto p-8">
          {!personaConsultada ? (
            <Card title="Buscar Persona">
              <div className="flex gap-4">
                <Input
                  label="Número de Documento"
                  value={nroDocConsulta}
                  onChange={(e) => setNroDocConsulta(e.target.value)}
                  placeholder="1234567890"
                  className="flex-1"
                  icon={CreditCard}
                  onKeyPress={(e) => e.key === 'Enter' && handleConsultarPersona()}
                />
                <div className="flex items-end">
                  <Button onClick={handleConsultarPersona} disabled={loading} className="px-8">
                    <Search size={20} /> {loading ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <Card title="Datos Actuales" className="border-l-4 border-orange-600">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl">
                  <div className="flex items-start gap-6">
                    <img 
                      src={personaConsultada.foto || PLACEHOLDER_IMAGE} 
                      alt="Foto de perfil" 
                      className="w-24 h-24 rounded-xl object-cover border-4 border-white shadow-lg"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-2xl mb-3 text-gray-800">
                        {personaConsultada.primer_nombre} {personaConsultada.segundo_nombre} {personaConsultada.apellidos}
                      </p>
                      <div className="flex items-center gap-2 text-orange-800">
                        <CreditCard size={20} />
                        <p className="font-semibold">Documento: {personaConsultada.tipo_doc} {personaConsultada.nro_doc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Modificar Información">
                <p className="text-sm text-gray-600 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-200">
                  💡 <strong>Instrucción:</strong> Solo complete los campos que desea modificar. Los campos vacíos no serán actualizados.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Input
                    label="Primer Nombre"
                    value={formModificar.primer_nombre || ''}
                    onChange={(e) => setFormModificar({...formModificar, primer_nombre: e.target.value})}
                    error={erroresModificar.primer_nombre}
                    placeholder={personaConsultada.primer_nombre}
                    icon={User}
                    maxLength={30}
                  />
                  <Input
                    label="Segundo Nombre"
                    value={formModificar.segundo_nombre || ''}
                    onChange={(e) => setFormModificar({...formModificar, segundo_nombre: e.target.value})}
                    error={erroresModificar.segundo_nombre}
                    placeholder={personaConsultada.segundo_nombre || 'Sin segundo nombre'}
                    icon={User}
                    maxLength={30}
                  />
                  <Input
                    label="Apellidos"
                    value={formModificar.apellidos || ''}
                    onChange={(e) => setFormModificar({...formModificar, apellidos: e.target.value})}
                    error={erroresModificar.apellidos}
                    placeholder={personaConsultada.apellidos}
                    icon={User}
                    maxLength={60}
                  />
                  <Input
                    label="Correo Electrónico"
                    type="email"
                    value={formModificar.correo || ''}
                    onChange={(e) => setFormModificar({...formModificar, correo: e.target.value})}
                    error={erroresModificar.correo}
                    placeholder={personaConsultada.correo}
                    icon={Mail}
                  />
                  <Input
                    label="Celular"
                    value={formModificar.celular || ''}
                    onChange={(e) => setFormModificar({...formModificar, celular: e.target.value})}
                    error={erroresModificar.celular}
                    placeholder={personaConsultada.celular}
                    icon={Phone}
                    maxLength={10}
                  />
                  <Select
                    label="Género"
                    value={formModificar.genero || ''}
                    onChange={(e) => setFormModificar({...formModificar, genero: e.target.value})}
                    options={[
                      { value: 'Masculino', label: 'Masculino' },
                      { value: 'Femenino', label: 'Femenino' },
                      { value: 'No binario', label: 'No binario' },
                      { value: 'Prefiero no reportar', label: 'Prefiero no reportar' }
                    ]}
                    icon={User}
                  />
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleModificarPersona} disabled={loading} className="flex-1 text-lg py-4">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                  <Button variant="secondary" onClick={() => {
                    setPersonaConsultada(null);
                    setFormModificar({});
                    setErroresModificar({});
                    setNroDocConsulta('');
                  }} className="flex-1 text-lg py-4">
                    <Search size={20} />
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 shadow-xl">
          <Button variant="secondary" onClick={() => {
            setCurrentView('menu');
            setPersonaConsultada(null);
            setNroDocConsulta('');
          }} className="mb-4">
            ← Volver al Menú
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Trash2 size={32} />
            Eliminar Personas
          </h1>
          <p className="text-red-100 mt-2">⚠️ Esta acción es permanente y no se puede deshacer</p>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          <Card title="Buscar Persona a Eliminar">
            <div className="flex gap-4">
              <Input
                label="Número de Documento"
                value={nroDocConsulta}
                onChange={(e) => setNroDocConsulta(e.target.value)}
                placeholder="1234567890"
                className="flex-1"
                icon={CreditCard}
                onKeyPress={(e) => e.key === 'Enter' && handleConsultarPersona()}
              />
              <div className="flex items-end">
                <Button onClick={handleConsultarPersona} disabled={loading} className="px-8">
                  <Search size={20} /> {loading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </div>
          </Card>

          {personaConsultada && (
            <Card title="Confirmar Eliminación" className="border-l-4 border-red-600">
              <div className="bg-red-50 border-2 border-red-300 p-6 rounded-xl mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertCircle className="text-red-600" size={32} />
                  </div>
                  <div>
                    <p className="text-red-800 font-bold text-lg">⚠️ Advertencia: Esta acción no se puede deshacer</p>
                    <p className="text-red-700 text-sm">Los datos serán eliminados permanentemente del sistema</p>
                  </div>
                </div>
                <div className="space-y-3 bg-white p-4 rounded-lg">
                  <div className="flex justify-center mb-4">
                    <img 
                      src={personaConsultada.foto || PLACEHOLDER_IMAGE} 
                      alt="Foto de perfil" 
                      className="w-24 h-24 rounded-xl object-cover border-4 border-gray-200 shadow-lg"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="text-gray-600" size={20} />
                    <p><strong>Nombre:</strong> {personaConsultada.primer_nombre} {personaConsultada.segundo_nombre} {personaConsultada.apellidos}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-gray-600" size={20} />
                    <p><strong>Documento:</strong> {personaConsultada.tipo_doc} {personaConsultada.nro_doc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="text-gray-600" size={20} />
                    <p><strong>Correo:</strong> {personaConsultada.correo}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="danger" onClick={handleEliminarPersona} disabled={loading} className="flex-1 text-lg py-4">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={20} />
                      Confirmar Eliminación
                    </>
                  )}
                </Button>
                <Button variant="secondary" onClick={() => {
                  setPersonaConsultada(null);
                  setNroDocConsulta('');
                }} className="flex-1 text-lg py-4">
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 shadow-xl">
          <Button variant="secondary" onClick={() => setCurrentView('menu')} className="mb-4">
            ← Volver al Menú
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileText size={32} />
            Consultar Logs del Sistema
          </h1>
          <p className="text-purple-100 mt-2">Historial completo de operaciones realizadas</p>
        </div>

        <div className="max-w-7xl mx-auto p-8">
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
                icon={CreditCard}
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
            <Card title={`Registros Encontrados: ${logs.length} operaciones`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                    <tr>
                      <th className="p-4 text-left font-bold rounded-tl-xl">Operación</th>
                      <th className="p-4 text-left font-bold">Usuario</th>
                      <th className="p-4 text-left font-bold">Documento</th>
                      <th className="p-4 text-left font-bold rounded-tr-xl">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-purple-50 transition-colors animate-fadeIn" style={{ animationDelay: `${idx * 50}ms` }}>
                        <td className="p-4">
                          <span className={`px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 ${
                            log.tipo_operacion === 'CREAR' ? 'bg-green-100 text-green-800' :
                            log.tipo_operacion === 'MODIFICAR' ? 'bg-orange-100 text-orange-800' :
                            log.tipo_operacion === 'ELIMINAR' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {log.tipo_operacion === 'CREAR' && <Plus size={16} />}
                            {log.tipo_operacion === 'MODIFICAR' && <Edit2 size={16} />}
                            {log.tipo_operacion === 'ELIMINAR' && <Trash2 size={16} />}
                            {log.tipo_operacion === 'CONSULTAR' && <Search size={16} />}
                            {log.tipo_operacion}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-gray-700">{log.usuario_email}</td>
                        <td className="p-4 font-mono text-gray-800">{log.documento_afectado}</td>
                        <td className="p-4 text-gray-600">{new Date(log.fecha_transaccion).toLocaleString('es-CO')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card title="Sin Resultados">
              <div className="text-center py-12">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={40} className="text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg">No se encontraron registros con los filtros seleccionados</p>
              </div>
            </Card>
          )}
          {message && <Alert message={message} type={messageType} />}
        </div>
      </div>
    );
  }

  return null;
}