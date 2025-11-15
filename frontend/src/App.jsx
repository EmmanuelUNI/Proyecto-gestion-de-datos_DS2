import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Plus, Edit2, Search, Trash2, FileText, AlertCircle, CheckCircle, User, Mail, Phone, Calendar, CreditCard, Users, Upload, X, UserPlus, Lock, ChevronRight, Database, Settings, BarChart3, Shield, MessageCircle, Send, Bot, Sparkles, Eye, EyeOff } from 'lucide-react';

const API_URL = '';

// Imagen placeholder SVG en Base64
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f8fafc'/%3E%3Cpath d='M100 85c-13.8 0-25 11.2-25 25s11.2 25 25 25 25-11.2 25-25-11.2-25-25-25zm0 40c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15z' fill='%23cbd5e1'/%3E%3Cpath d='M140 150c0-22.1-17.9-40-40-40s-40 17.9-40 40v10h80v-10z' fill='%23cbd5e1'/%3E%3C/svg%3E";

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
    if (!value) return 'Contraseña requerida';
    if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
    if (!/[A-Z]/.test(value)) return 'Debe contener al menos una letra mayúscula';
    if (!/[a-z]/.test(value)) return 'Debe contener al menos una letra minúscula';
    if (!/[0-9]/.test(value)) return 'Debe contener al menos un número';
    if (!/[!@#$_.-]/.test(value)) return 'Debe contener al menos un símbolo (!, @, #, $, _, -, .)';
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

// Función para formatear texto con Markdown
const formatMessageWithMarkdown = (text) => {
  if (!text) return null;

  // Procesar encabezados
  text = text.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mb-4 text-slate-800">$1</h1>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold mb-3 text-slate-800">$1</h2>');
  text = text.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold mb-2 text-slate-800">$1</h3>');

  // Procesar negritas
  text = text.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-slate-800">$1</strong>');

  // Procesar listas ordenadas
  text = text.replace(/^\d+\.\s+(.*$)/gim, '<li class="ml-4 mb-2 text-slate-700">$1</li>');
  
  // Procesar listas con asteriscos
  text = text.replace(/^\*\s+(.*$)/gim, '<li class="ml-4 mb-2 text-slate-700">$1</li>');

  // Agrupar listas ordenadas
  text = text.replace(/(<li class="ml-4 mb-2 text-slate-700">.*<\/li>)+/gim, (match) => {
    return `<ol class="list-decimal ml-6 mb-4 space-y-2">${match}</ol>`;
  });

  // Agrupar listas con asteriscos
  text = text.replace(/(<li class="ml-4 mb-2 text-slate-700">.*<\/li>)+/gim, (match) => {
    return `<ul class="list-disc ml-6 mb-4 space-y-2">${match}</ul>`;
  });

  // Procesar saltos de línea
  text = text.replace(/\n/g, '<br>');

  // Procesar texto normal
  text = text.replace(/^(?!<[hou])(.*$)/gim, '<p class="mb-3 text-slate-700 leading-relaxed">$1</p>');

  return <div dangerouslySetInnerHTML={{ __html: text }} />;
};

const Button = ({ onClick, children, variant = 'primary', disabled = false, className = '', size = 'md', ...props }) => {
  const baseStyle = 'rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 shadow-lg hover:shadow-xl border border-transparent';
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed border-blue-500/20',
    danger: 'bg-gradient-to-r from-rose-600 to-red-700 text-white hover:from-rose-700 hover:to-red-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed border-rose-500/20',
    secondary: 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed border-slate-500/20',
    success: 'bg-gradient-to-r from-emerald-600 to-green-700 text-white hover:from-emerald-700 hover:to-green-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed border-emerald-500/20',
    warning: 'bg-gradient-to-r from-amber-600 to-orange-700 text-white hover:from-amber-700 hover:to-orange-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed border-amber-500/20',
    outline: 'bg-white text-slate-700 border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200'
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ title, children, className = '', variant = 'default', icon: Icon }) => (
  <div className={`bg-white rounded-2xl shadow-lg p-8 mb-6 transform transition-all duration-300 hover:shadow-xl border border-slate-100 animate-fadeIn ${className}`}>
    {title && (
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
            <Icon size={20} />
          </div>
        )}
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      </div>
    )}
    {children}
  </div>
);

const Input = ({ label, type = 'text', value, onChange, error, required = false, placeholder = '', icon: Icon, maxLength, ...props }) => (
  <div className="group">
    <label className="block text-slate-700 mb-2 font-semibold text-sm">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300">
          <Icon size={20} />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
          error 
            ? 'border-rose-500 focus:ring-rose-500 bg-rose-50' 
            : 'border-slate-300 focus:ring-blue-600 focus:border-blue-600 bg-slate-50 hover:bg-white'
        }`}
        {...props}
      />
      {maxLength && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
          {value?.length || 0}/{maxLength}
        </div>
      )}
    </div>
    {error && (
      <p className="text-rose-500 text-sm mt-2 flex items-center gap-1 animate-slideDown">
        <AlertCircle size={14} /> 
        {error}
      </p>
    )}
  </div>
);

// Nuevo componente PasswordInput con validación visual mejorada
const PasswordInput = ({ label, value, onChange, error, required = false, placeholder = '', showPasswordRequirements = false }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[!@#$_.-]/.test(password)
    };
    return requirements;
  };

  const requirements = validatePassword(value);
  const allValid = Object.values(requirements).every(Boolean);

  return (
    <div className="group">
      <label className="block text-slate-700 mb-2 font-semibold text-sm">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300">
          <Lock size={20} />
        </div>
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!touched) setTouched(true);
          }}
          placeholder={placeholder}
          className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 ${
            error 
              ? 'border-rose-500 focus:ring-rose-500 bg-rose-50' 
              : touched && !allValid
                ? 'border-amber-500 focus:ring-amber-500 bg-amber-50'
                : 'border-slate-300 focus:ring-blue-600 focus:border-blue-600 bg-slate-50 hover:bg-white'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-300"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      
      {showPasswordRequirements && (
        <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700 mb-2">Requisitos de contraseña:</p>
          <div className="space-y-1 text-xs">
            <div className={`flex items-center gap-2 ${requirements.length ? 'text-emerald-600' : 'text-slate-500'}`}>
              <div className={`w-2 h-2 rounded-full ${requirements.length ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              Al menos 8 caracteres
            </div>
            <div className={`flex items-center gap-2 ${requirements.uppercase ? 'text-emerald-600' : 'text-slate-500'}`}>
              <div className={`w-2 h-2 rounded-full ${requirements.uppercase ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              Una letra mayúscula (A-Z)
            </div>
            <div className={`flex items-center gap-2 ${requirements.lowercase ? 'text-emerald-600' : 'text-slate-500'}`}>
              <div className={`w-2 h-2 rounded-full ${requirements.lowercase ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              Una letra minúscula (a-z)
            </div>
            <div className={`flex items-center gap-2 ${requirements.number ? 'text-emerald-600' : 'text-slate-500'}`}>
              <div className={`w-2 h-2 rounded-full ${requirements.number ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              Un número (0-9)
            </div>
            <div className={`flex items-center gap-2 ${requirements.symbol ? 'text-emerald-600' : 'text-slate-500'}`}>
              <div className={`w-2 h-2 rounded-full ${requirements.symbol ? 'bg-emerald-500' : 'bg-slate-400'}`} />
              Un símbolo (! @ # $ _ - .)
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-rose-500 text-sm mt-2 flex items-center gap-1 animate-slideDown">
          <AlertCircle size={14} /> 
          {error}
        </p>
      )}
    </div>
  );
};

const Select = ({ label, value, onChange, options, error, required = false, icon: Icon }) => (
  <div className="group">
    <label className="block text-slate-700 mb-2 font-semibold text-sm">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300 z-10">
          <Icon size={20} />
        </div>
      )}
      <select
        value={value}
        onChange={onChange}
        className={`w-full ${Icon ? 'pl-12' : 'pl-4'} pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-300 appearance-none bg-slate-50 hover:bg-white ${
          error 
            ? 'border-rose-500 focus:ring-rose-500' 
            : 'border-slate-300 focus:ring-blue-600 focus:border-blue-600'
        }`}
      >
        <option value="">Seleccione...</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    {error && (
      <p className="text-rose-500 text-sm mt-2 flex items-center gap-1 animate-slideDown">
        <AlertCircle size={14} /> 
        {error}
      </p>
    )}
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
      <label className="block text-slate-700 mb-2 font-semibold text-sm">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
            isDragging 
              ? 'border-blue-500 bg-blue-50 shadow-inner' 
              : error 
                ? 'border-rose-500 bg-rose-50' 
                : 'border-slate-300 bg-slate-50 hover:border-blue-500 hover:bg-blue-50'
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
            <Upload className={`mx-auto mb-4 ${error ? 'text-rose-500' : 'text-slate-400'} transition-colors duration-300`} size={48} />
            <p className="text-slate-600 font-semibold mb-2">
              Haga clic para seleccionar o arrastre una imagen
            </p>
            <p className="text-sm text-slate-500">JPG, PNG o GIF - Máximo 2MB</p>
          </label>
        </div>
      ) : (
        <div className="relative border-2 border-slate-200 rounded-xl p-4 bg-slate-50 transition-all duration-300">
          <img src={preview} alt="Vista previa" className="w-full h-64 object-contain rounded-lg mb-4" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-4 right-4 bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition-colors shadow-lg transform hover:scale-110"
          >
            <X size={20} />
          </button>
          <p className="text-sm text-slate-600 text-center">Imagen cargada correctamente</p>
        </div>
      )}
      
      {error && (
        <p className="text-rose-500 text-sm mt-2 flex items-center gap-1 animate-slideDown">
          <AlertCircle size={14} /> 
          {error}
        </p>
      )}
    </div>
  );
};

const Alert = ({ message, type }) => {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div className={`p-4 rounded-xl flex items-center gap-3 animate-slideDown shadow-lg border-l-4 ${
      isError 
        ? 'bg-rose-50 text-rose-700 border-rose-500' 
        : 'bg-emerald-50 text-emerald-700 border-emerald-500'
    }`}>
      {isError ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
      <span className="font-semibold">{message}</span>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, delay = 0 }) => (
  <div 
    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 animate-slideUp group cursor-pointer"
    style={{ 
      borderColor: color,
      animationDelay: `${delay}ms`
    }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-600 text-sm font-medium mb-2">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
      <div className="p-4 rounded-xl transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: color + '20' }}>
        <Icon size={32} style={{ color }} />
      </div>
    </div>
  </div>
);

// Breadcrumb modificado - texto blanco sin efectos hover
const Breadcrumb = ({ items }) => (
  <nav className="flex items-center space-x-2 text-sm text-white mb-6">
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <ChevronRight size={16} className="text-white/70" />}
        <span className={`${index === items.length - 1 ? 'text-white font-semibold' : 'text-white/90'}`}>
          {item}
        </span>
      </React.Fragment>
    ))}
  </nav>
);

const ViewHeader = ({ title, subtitle, gradient, breadcrumbItems, icon: Icon, onBack }) => (
  <div className={`bg-gradient-to-r ${gradient} text-white p-6 shadow-xl`}>
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Icon size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="text-white/80 mt-2">{subtitle}</p>
            </div>
          </div>
        </div>
        {onBack && (
          <Button onClick={onBack} variant="outline" size="md">
            ← Volver al Menú
          </Button>
        )}
      </div>
    </div>
  </div>
);

// Componente de mensaje del chat actualizado con Markdown
const ChatMessage = ({ message, isUser }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}>
    <div className={`flex items-start gap-3 max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`p-3 rounded-full ${isUser ? 'bg-gradient-to-r from-blue-600 to-indigo-700' : 'bg-gradient-to-r from-purple-600 to-violet-700'} shadow-lg`}>
        {isUser ? <User size={20} className="text-white" /> : <Bot size={20} className="text-white" />}
      </div>
      <div className={`px-6 py-4 rounded-2xl shadow-md ${
        isUser 
          ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white' 
          : 'bg-white text-slate-800 border border-slate-200'
      }`}>
        <p className="text-sm font-medium mb-1 opacity-80">{isUser ? 'Tú' : 'Asistente IA'}</p>
        <div className="whitespace-pre-wrap leading-relaxed">
          {isUser ? message : formatMessageWithMarkdown(message)}
        </div>
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

  // Estados para el chat RAG
  const [chatMessages, setChatMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (token && currentView === 'menu') {
      fetchStats();
    }
  }, [token, currentView]);

  // Auto-scroll del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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
        // Eliminado: showMessage('Login exitoso');
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
    setChatMessages([]);
    setCurrentQuestion('');
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

  // Nueva función para enviar pregunta al chat RAG
  const handleSendQuestion = async () => {
    if (!currentQuestion.trim()) {
      showMessage('Por favor ingrese una pregunta', 'error');
      return;
    }

    // Agregar la pregunta del usuario al chat
    const userMessage = currentQuestion;
    setChatMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setCurrentQuestion('');
    setChatLoading(true);

    try {
      const response = await fetch(`${API_URL}/consulta-natural`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pregunta: userMessage })
      });

      const data = await response.json();

      if (response.ok && data.respuesta) {
        // Agregar la respuesta del asistente al chat
        setChatMessages(prev => [...prev, { text: data.respuesta, isUser: false }]);
      } else {
        setChatMessages(prev => [...prev, { 
          text: 'Lo siento, no pude procesar tu pregunta. Por favor intenta de nuevo.', 
          isUser: false 
        }]);
        showMessage(data.detail || 'Error al procesar la pregunta', 'error');
      }
    } catch (error) {
      setChatMessages(prev => [...prev, { 
        text: 'Ocurrió un error de conexión. Por favor verifica tu red e intenta nuevamente.', 
        isUser: false 
      }]);
      showMessage('Error de conexión: ' + error.message, 'error');
    }

    setChatLoading(false);
  };

  // VISTA DE LOGIN Y REGISTRO
  if (!token) {
    if (currentView === 'signup' && !esperandoCodigo) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md relative z-10 border border-white/20 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
                <UserPlus size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Crear Cuenta</h1>
              <p className="text-slate-600 font-medium">Regístrese en el sistema</p>
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
              <PasswordInput
                label="Contraseña"
                value={registroPassword}
                onChange={setRegistroPassword}
                error={erroresRegistro.password}
                required
                placeholder="Ingrese una contraseña segura"
                showPasswordRequirements={true}
              />
              <Button onClick={handleSignup} disabled={loading} className="w-full text-lg py-4" variant="primary">
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
              <Button onClick={() => setCurrentView('login')} variant="outline" className="w-full text-lg py-4">
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md relative z-10 border border-white/20 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Mail size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Verificar Email</h1>
              <p className="text-slate-600 font-medium">Se envió un código a:</p>
              <p className="text-purple-600 font-bold mt-1">{emailRegistrado}</p>
            </div>

            <div className="space-y-5">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
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
              <Button onClick={handleVerifyEmail} disabled={loading} className="w-full text-lg py-4" variant="primary">
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
                variant="outline" 
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md relative z-10 border border-white/20 animate-fadeIn">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
              <Database size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Sistema de Gestión</h1>
            <p className="text-slate-600 font-medium">Plataforma de Datos Personales</p>
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
            <Button onClick={() => setCurrentView('signup')} variant="outline" className="w-full text-lg py-4">
              <UserPlus size={20} />
              Crear Cuenta Nueva
            </Button>
          </div>

          {message && <div className="mt-6"><Alert message={message} type={messageType} /></div>}

          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">Sistema de Gestión de Datos</p>
            <p className="text-xs text-slate-400 mt-1">Seguro y Confiable</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <Database size={32} />
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
            <StatCard title="Total de Operaciones" value={stats.total} icon={BarChart3} color="#3B82F6" delay={0} />
            <StatCard title="Personas Creadas" value={stats.created} icon={Plus} color="#10B981" delay={100} />
            <StatCard title="Modificaciones" value={stats.modified} icon={Edit2} color="#F59E0B" delay={200} />
            <StatCard title="Consultas" value={stats.consulted} icon={Search} color="#8B5CF6" delay={300} />
          </div>

          <h2 className="text-3xl font-bold mb-6 text-slate-800">Panel de Control</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              onClick={() => setCurrentView('crear')} 
              className="group bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white p-8 rounded-2xl text-center font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl animate-slideUp cursor-pointer border border-emerald-500/20"
              style={{ animationDelay: '0ms' }}
            >
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus size={32} />
              </div>
              <span className="text-xl">Crear Personas</span>
              <p className="text-emerald-100 text-sm mt-2 opacity-90">Registrar nuevas personas en el sistema</p>
            </div>

            <div 
              onClick={() => setCurrentView('consultar')} 
              className="group bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-8 rounded-2xl text-center font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl animate-slideUp cursor-pointer border border-blue-500/20"
              style={{ animationDelay: '100ms' }}
            >
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Search size={32} />
              </div>
              <span className="text-xl">Consultar Datos</span>
              <p className="text-blue-100 text-sm mt-2 opacity-90">Buscar información de personas</p>
            </div>

            <div 
              onClick={() => setCurrentView('modificar')} 
              className="group bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-8 rounded-2xl text-center font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl animate-slideUp cursor-pointer border border-amber-500/20"
              style={{ animationDelay: '200ms' }}
            >
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Edit2 size={32} />
              </div>
              <span className="text-xl">Modificar Datos</span>
              <p className="text-amber-100 text-sm mt-2 opacity-90">Actualizar información existente</p>
            </div>

            <div 
              onClick={() => setCurrentView('eliminar')} 
              className="group bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white p-8 rounded-2xl text-center font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl animate-slideUp cursor-pointer border border-rose-500/20"
              style={{ animationDelay: '300ms' }}
            >
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Trash2 size={32} />
              </div>
              <span className="text-xl">Eliminar Personas</span>
              <p className="text-rose-100 text-sm mt-2 opacity-90">Remover registros del sistema</p>
            </div>

            <div 
              onClick={() => setCurrentView('logs')} 
              className="group bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white p-8 rounded-2xl text-center font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl animate-slideUp cursor-pointer border border-purple-500/20"
              style={{ animationDelay: '400ms' }}
            >
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileText size={32} />
              </div>
              <span className="text-xl">Consultar Logs</span>
              <p className="text-purple-100 text-sm mt-2 opacity-90">Historial de operaciones</p>
            </div>

            <div 
              onClick={() => setCurrentView('chat')}
              className="group bg-gradient-to-br from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white p-8 rounded-2xl text-center font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl animate-slideUp cursor-pointer border border-cyan-500/20"
              style={{ animationDelay: '500ms' }}
            >
              <div className="bg-white/20 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles size={32} />
              </div>
              <span className="text-xl">Consulta Inteligente</span>
              <p className="text-cyan-100 text-sm mt-2 opacity-90">Chat con IA en lenguaje natural</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'chat') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <ViewHeader
          title="Asistente Inteligente - Chat IA"
          subtitle="Realiza consultas en lenguaje natural sobre los datos del sistema"
          gradient="from-cyan-600 to-teal-700"
          breadcrumbItems={['Menú Principal', 'Consulta Inteligente']}
          icon={Sparkles}
          onBack={() => {
            setCurrentView('menu');
            setChatMessages([]);
            setCurrentQuestion('');
          }}
        />

        <div className="max-w-6xl mx-auto p-8">
          {message && <Alert message={message} type={messageType} />}
          
          <Card title="Chat con Asistente IA" icon={MessageCircle}>
            <div className="bg-gradient-to-r from-cyan-50 to-teal-100 p-6 rounded-xl mb-6 border border-cyan-200">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-cyan-600 to-teal-700 p-3 rounded-xl">
                  <Sparkles className="text-white" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-2">💡 ¿Cómo funciona?</h3>
                  <p className="text-slate-700 text-sm leading-relaxed mb-3">
                    Este asistente inteligente utiliza <strong>Google Gemini</strong> para responder preguntas sobre los datos del sistema en lenguaje natural.
                  </p>
                  <p className="text-slate-600 text-sm">
                    <strong>Ejemplos de preguntas:</strong>
                  </p>
                  <ul className="text-slate-600 text-sm mt-2 space-y-1 ml-4">
                    <li>• "¿Cuántas personas hay registradas?"</li>
                    <li>• "Muéstrame información sobre Juan Pérez"</li>
                    <li>• "¿Cuántos hombres y mujeres están registrados?"</li>
                    <li>• "Dame un resumen de las personas del sistema"</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Área de mensajes del chat */}
            <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-200" style={{ height: '500px', overflowY: 'auto' }}>
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="bg-gradient-to-r from-cyan-600 to-teal-700 w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Bot size={40} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">¡Hola! Soy tu asistente inteligente</h3>
                  <p className="text-slate-600 max-w-md">
                    Puedes preguntarme cualquier cosa sobre los datos del sistema. Estoy aquí para ayudarte.
                  </p>
                </div>
              ) : (
                <div>
                  {chatMessages.map((msg, idx) => (
                    <ChatMessage key={idx} message={msg.text} isUser={msg.isUser} />
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start mb-4 animate-fadeIn">
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-700 shadow-lg">
                          <Bot size={20} className="text-white" />
                        </div>
                        <div className="px-6 py-4 rounded-2xl shadow-md bg-white text-slate-800 border border-slate-200">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
                            <span className="text-sm">Pensando...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Input para nueva pregunta */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  label=""
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  placeholder="Escribe tu pregunta aquí..."
                  icon={MessageCircle}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !chatLoading) {
                      handleSendQuestion();
                    }
                  }}
                  disabled={chatLoading}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSendQuestion} 
                  disabled={chatLoading || !currentQuestion.trim()} 
                  className="px-8 h-12"
                  variant="primary"
                >
                  {chatLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {chatMessages.length > 0 && (
              <div className="mt-4">
                <Button 
                  onClick={() => {
                    setChatMessages([]);
                    setCurrentQuestion('');
                  }} 
                  variant="outline" 
                  className="w-full"
                  size="sm"
                >
                  <Trash2 size={16} />
                  Limpiar Conversación
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  if (currentView === 'crear') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <ViewHeader
          title="Crear Nueva Persona"
          subtitle="Complete el formulario para registrar una nueva persona"
          gradient="from-emerald-600 to-green-700"
          breadcrumbItems={['Menú Principal', 'Crear Persona']}
          icon={Plus}
          onBack={() => setCurrentView('menu')}
        />

        <div className="max-w-5xl mx-auto p-8">
          {message && <Alert message={message} type={messageType} />}
          
          <Card title="Formulario de Registro" icon={User}>
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
        </div>
      </div>
    );
  }

  if (currentView === 'consultar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <ViewHeader
          title="Consultar Datos Personales"
          subtitle="Busque información de personas registradas"
          gradient="from-blue-600 to-indigo-700"
          breadcrumbItems={['Menú Principal', 'Consultar Datos']}
          icon={Search}
          onBack={() => setCurrentView('menu')}
        />

        <div className="max-w-4xl mx-auto p-8">
          {message && <Alert message={message} type={messageType} />}
          
          <Card title="Buscar Persona" icon={Search}>
            <div className="space-y-4">
              <Input
                label="Número de Documento"
                value={nroDocConsulta}
                onChange={(e) => setNroDocConsulta(e.target.value)}
                placeholder="Ingrese el número de documento (máximo 10 dígitos)"
                icon={CreditCard}
                maxLength={10}
                onKeyPress={(e) => e.key === 'Enter' && handleConsultarPersona()}
              />
              <Button 
                onClick={handleConsultarPersona} 
                disabled={loading} 
                className="w-full text-lg py-4"
                variant="primary"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Buscar Persona
                  </>
                )}
              </Button>
            </div>
          </Card>

          {personaConsultada && (
            <Card title="Información de la Persona" icon={User}>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-100 p-6 rounded-xl mb-6 border border-blue-200">
                <div className="flex items-start gap-6">
                  <img 
                    src={personaConsultada.foto || PLACEHOLDER_IMAGE} 
                    alt="Foto de perfil" 
                    className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">
                      {personaConsultada.primer_nombre} {personaConsultada.segundo_nombre} {personaConsultada.apellidos}
                    </h3>
                    <p className="text-blue-700 font-semibold">{personaConsultada.tipo_doc} {personaConsultada.nro_doc}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="text-blue-600" size={20} />
                    <p className="text-sm text-slate-600 font-semibold">Correo Electrónico</p>
                  </div>
                  <p className="font-semibold text-slate-800 ml-8">{personaConsultada.correo}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="text-green-600" size={20} />
                    <p className="text-sm text-slate-600 font-semibold">Celular</p>
                  </div>
                  <p className="font-semibold text-slate-800 ml-8">{personaConsultada.celular}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="text-purple-600" size={20} />
                    <p className="text-sm text-slate-600 font-semibold">Fecha de Nacimiento</p>
                  </div>
                  <p className="font-semibold text-slate-800 ml-8">{personaConsultada.fecha_nacimiento}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="text-orange-600" size={20} />
                    <p className="text-sm text-slate-600 font-semibold">Género</p>
                  </div>
                  <p className="font-semibold text-slate-800 ml-8">{personaConsultada.genero}</p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'modificar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <ViewHeader
          title="Modificar Datos Personales"
          subtitle="Actualice la información de personas registradas"
          gradient="from-amber-600 to-orange-700"
          breadcrumbItems={['Menú Principal', 'Modificar Datos']}
          icon={Edit2}
          onBack={() => {
            setCurrentView('menu');
            setPersonaConsultada(null);
            setFormModificar({});
            setNroDocConsulta('');
          }}
        />

        <div className="max-w-5xl mx-auto p-8">
          {message && <Alert message={message} type={messageType} />}
          
          {!personaConsultada ? (
            <Card title="Buscar Persona" icon={Search}>
              <div className="space-y-4">
                <Input
                  label="Número de Documento"
                  value={nroDocConsulta}
                  onChange={(e) => setNroDocConsulta(e.target.value)}
                  placeholder="Ingrese el número de documento (máximo 10 dígitos)"
                  icon={CreditCard}
                  maxLength={10}
                  onKeyPress={(e) => e.key === 'Enter' && handleConsultarPersona()}
                />
                <Button 
                  onClick={handleConsultarPersona} 
                  disabled={loading} 
                  className="w-full text-lg py-4"
                  variant="primary"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search size={20} />
                      Buscar Persona
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <Card title="Datos Actuales" icon={User}>
                <div className="bg-gradient-to-r from-amber-50 to-orange-100 p-6 rounded-xl">
                  <div className="flex items-start gap-6">
                    <img 
                      src={personaConsultada.foto || PLACEHOLDER_IMAGE} 
                      alt="Foto de perfil" 
                      className="w-24 h-24 rounded-xl object-cover border-4 border-white shadow-lg"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="flex-1">
                      <p className="font-bold text-2xl mb-3 text-slate-800">
                        {personaConsultada.primer_nombre} {personaConsultada.segundo_nombre} {personaConsultada.apellidos}
                      </p>
                      <div className="flex items-center gap-2 text-amber-800">
                        <CreditCard size={20} />
                        <p className="font-semibold">Documento: {personaConsultada.tipo_doc} {personaConsultada.nro_doc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Modificar Información" icon={Edit2}>
                <p className="text-sm text-slate-600 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-200">
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
                  <Button variant="outline" onClick={() => {
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
        </div>
      </div>
    );
  }

  if (currentView === 'eliminar') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <ViewHeader
          title="Eliminar Personas"
          subtitle="Esta acción es permanente y no se puede deshacer"
          gradient="from-rose-600 to-red-700"
          breadcrumbItems={['Menú Principal', 'Eliminar Personas']}
          icon={Trash2}
          onBack={() => {
            setCurrentView('menu');
            setPersonaConsultada(null);
            setNroDocConsulta('');
          }}
        />

        <div className="max-w-4xl mx-auto p-8">
          {message && <Alert message={message} type={messageType} />}
          
          <Card title="Buscar Persona a Eliminar" icon={Search}>
            <div className="space-y-4">
              <Input
                label="Número de Documento"
                value={nroDocConsulta}
                onChange={(e) => setNroDocConsulta(e.target.value)}
                placeholder="Ingrese el número de documento (máximo 10 dígitos)"
                icon={CreditCard}
                maxLength={10}
                onKeyPress={(e) => e.key === 'Enter' && handleConsultarPersona()}
              />
              <Button 
                onClick={handleConsultarPersona} 
                disabled={loading} 
                className="w-full text-lg py-4"
                variant="primary"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Buscar Persona
                  </>
                )}
              </Button>
            </div>
          </Card>

          {personaConsultada && (
            <Card title="Confirmar Eliminación" icon={Trash2}>
              <div className="bg-rose-50 border-2 border-rose-300 p-6 rounded-xl mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-rose-100 p-3 rounded-full">
                    <AlertCircle className="text-rose-600" size={32} />
                  </div>
                  <div>
                    <p className="text-rose-800 font-bold text-lg">⚠️ Advertencia: Esta acción no se puede deshacer</p>
                    <p className="text-rose-700 text-sm">Los datos serán eliminados permanentemente del sistema</p>
                  </div>
                </div>
                <div className="space-y-3 bg-white p-4 rounded-lg">
                  <div className="flex justify-center mb-4">
                    <img 
                      src={personaConsultada.foto || PLACEHOLDER_IMAGE} 
                      alt="Foto de perfil" 
                      className="w-24 h-24 rounded-xl object-cover border-4 border-slate-200 shadow-lg"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="text-slate-600" size={20} />
                    <p><strong>Nombre:</strong> {personaConsultada.primer_nombre} {personaConsultada.segundo_nombre} {personaConsultada.apellidos}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-slate-600" size={20} />
                    <p><strong>Documento:</strong> {personaConsultada.tipo_doc} {personaConsultada.nro_doc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="text-slate-600" size={20} />
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
                <Button variant="outline" onClick={() => {
                  setPersonaConsultada(null);
                  setNroDocConsulta('');
                }} className="flex-1 text-lg py-4">
                  Cancelar
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (currentView === 'logs') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <ViewHeader
          title="Consultar Logs del Sistema"
          subtitle="Historial completo de operaciones realizadas"
          gradient="from-purple-600 to-violet-700"
          breadcrumbItems={['Menú Principal', 'Consultar Logs']}
          icon={FileText}
          onBack={() => setCurrentView('menu')}
        />

        <div className="max-w-7xl mx-auto p-8">
          {message && <Alert message={message} type={messageType} />}
          
          <Card title="Filtros de Búsqueda" icon={Search}>
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
            <Button variant="outline" onClick={() => {
              setFiltroLogs({ tipo_operacion: '', documento: '' });
              handleConsultarLogs();
            }} className="w-full">
              Mostrar Todos los Logs
            </Button>
          </Card>

          {logs.length > 0 ? (
            <Card title={`Registros Encontrados: ${logs.length} operaciones`} icon={FileText}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-violet-700 text-white">
                    <tr>
                      <th className="p-4 text-left font-bold rounded-tl-xl">Operación</th>
                      <th className="p-4 text-left font-bold">Usuario</th>
                      <th className="p-4 text-left font-bold">Documento</th>
                      <th className="p-4 text-left font-bold rounded-tr-xl">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => (
                      <tr key={idx} className="border-b border-slate-200 hover:bg-purple-50 transition-colors animate-fadeIn" style={{ animationDelay: `${idx * 50}ms` }}>
                        <td className="p-4">
                          <span className={`px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 ${
                            log.tipo_operacion === 'CREAR' ? 'bg-green-100 text-green-800' :
                            log.tipo_operacion === 'MODIFICAR' ? 'bg-amber-100 text-amber-800' :
                            log.tipo_operacion === 'ELIMINAR' ? 'bg-rose-100 text-rose-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {log.tipo_operacion === 'CREAR' && <Plus size={16} />}
                            {log.tipo_operacion === 'MODIFICAR' && <Edit2 size={16} />}
                            {log.tipo_operacion === 'ELIMINAR' && <Trash2 size={16} />}
                            {log.tipo_operacion === 'CONSULTAR' && <Search size={16} />}
                            {log.tipo_operacion}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-700">{log.usuario_email}</td>
                        <td className="p-4 font-mono text-slate-800">{log.documento_afectado}</td>
                        <td className="p-4 text-slate-600">{new Date(log.fecha_transaccion).toLocaleString('es-CO')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card title="Sin Resultados" icon={FileText}>
              <div className="text-center py-12">
                <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={40} className="text-slate-400" />
                </div>
                <p className="text-slate-500 text-lg">No se encontraron registros con los filtros seleccionados</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return null;
}