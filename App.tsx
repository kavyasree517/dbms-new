
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Calendar, FileText, LayoutDashboard, Activity, 
  Clock, Plus, Trash2, Edit2, X, Menu, LogOut, Search,
  Stethoscope, Heart, BrainCircuit, AlertCircle,
  History, Sparkles, CheckCircle, Save, Briefcase, Database, RefreshCw,
  Terminal, HardDrive, ShieldCheck, Copy, ChevronRight, Table as TableIcon,
  Download, FileSpreadsheet, ListFilter, Eye, UserPlus, Fingerprint, Pill,
  Settings, UserCheck, PlusCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';

import { 
  UserRole, Appointment, AppointmentStatus, Patient, Doctor, 
  AISymptomResult, User, Prescription, AIReport 
} from './types';
import { NAV_ITEMS, STATUS_STYLES } from './constants';
import { analyzeSymptoms } from './services/geminiService';
import { storage, STORAGE_KEYS } from './services/storage';

// --- INITIAL MOCK DATA ---
const INITIAL_DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Sarah Connor', specialization: 'Cardiology', email: 'sarah@nexus.med', licenseNumber: 'MED-10001', availability: ['Mon', 'Wed'], rating: 4.9 },
  { id: 'd2', name: 'Dr. John Watson', specialization: 'Diagnostics', email: 'watson@nexus.med', licenseNumber: 'MED-10002', availability: ['Tue', 'Thu'], rating: 4.8 },
  { id: 'd3', name: 'Dr. Gregory House', specialization: 'Internal Medicine', email: 'house@nexus.med', licenseNumber: 'MED-10003', availability: ['Mon', 'Fri'], rating: 4.7 },
  { id: 'd4', name: 'Dr. Meredith Grey', specialization: 'General Surgery', email: 'grey@nexus.med', licenseNumber: 'MED-10004', availability: ['Wed', 'Thu'], rating: 4.9 },
  { id: 'd5', name: 'Dr. Shaun Murphy', specialization: 'Pediatrics', email: 'murphy@nexus.med', licenseNumber: 'MED-10005', availability: ['Tue', 'Wed'], rating: 5.0 },
  { id: 'd6', name: 'Dr. Hannibal Lecter', specialization: 'Psychiatry', email: 'lecter@nexus.med', licenseNumber: 'MED-10006', availability: ['Mon', 'Thu'], rating: 4.6 },
  { id: 'd7', name: 'Dr. Stephen Strange', specialization: 'Neurology', email: 'strange@nexus.med', licenseNumber: 'MED-10007', availability: ['Fri', 'Sat'], rating: 4.9 },
];

const INITIAL_PATIENTS: Patient[] = [
  { id: 'p1', name: 'John Doe', email: 'john@nexus.med', phone: '555-0101', medicalHistory: 'Hypertension', bloodGroup: 'O+', lastVisit: '2024-01-10', historyEntries: [{ id: 'h1', date: '2024-01-10', diagnosis: 'Routine Checkup', treatment: 'Rest' }] },
  { id: 'p2', name: 'Jane Smith', email: 'jane@nexus.med', phone: '555-0102', medicalHistory: 'Asthma', bloodGroup: 'A-', lastVisit: '2024-02-15', historyEntries: [{ id: 'h2', date: '2024-02-15', diagnosis: 'Mild Flare-up', treatment: 'Inhaler increase' }] },
  { id: 'p3', name: 'Robert Paulson', email: 'robert@nexus.med', phone: '555-0103', medicalHistory: 'Type 1 Diabetes', bloodGroup: 'B+', lastVisit: '2024-03-01', historyEntries: [] },
  { id: 'p4', name: 'Sarah Miller', email: 'smiller@nexus.med', phone: '555-0104', medicalHistory: 'None', bloodGroup: 'AB+', lastVisit: '2024-03-05', historyEntries: [] },
  { id: 'p5', name: 'Michael Scott', email: 'michael@nexus.med', phone: '555-0105', medicalHistory: 'Anxiety', bloodGroup: 'O-', lastVisit: '2024-03-10', historyEntries: [] },
  { id: 'p6', name: 'Ellen Ripley', email: 'ripley@nexus.med', phone: '555-0106', medicalHistory: 'PTSD', bloodGroup: 'B-', lastVisit: '2024-01-20', historyEntries: [] },
  { id: 'p7', name: 'Arthur Dent', email: 'arthur@nexus.med', phone: '555-0107', medicalHistory: 'Chronic Stress', bloodGroup: 'A+', lastVisit: '2024-02-28', historyEntries: [] },
  { id: 'p8', name: 'Dana Scully', email: 'scully@nexus.med', phone: '555-0108', medicalHistory: 'Thyroid Issues', bloodGroup: 'AB-', lastVisit: '2024-03-12', historyEntries: [] },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: 'a1', patientId: 'p1', doctorId: 'd1', patientName: 'John Doe', doctorName: 'Dr. Sarah Connor', date: '2024-05-24', time: '10:00 AM', status: AppointmentStatus.PENDING, reason: 'Cardio Follow-up' },
  { id: 'a2', patientId: 'p2', doctorId: 'd2', patientName: 'Jane Smith', doctorName: 'Dr. John Watson', date: '2024-05-25', time: '11:30 AM', status: AppointmentStatus.CONFIRMED, reason: 'Diagnostic Screening' },
  { id: 'a3', patientId: 'p3', doctorId: 'd3', patientName: 'Robert Paulson', doctorName: 'Dr. Gregory House', date: '2024-05-26', time: '09:00 AM', status: AppointmentStatus.PENDING, reason: 'Unexplained Pain' },
  { id: 'a4', patientId: 'p5', doctorId: 'd6', patientName: 'Michael Scott', doctorName: 'Dr. Hannibal Lecter', date: '2024-05-27', time: '02:00 PM', status: AppointmentStatus.PENDING, reason: 'Counseling Session' },
  { id: 'a5', patientId: 'p7', doctorId: 'd7', patientName: 'Arthur Dent', doctorName: 'Dr. Stephen Strange', date: '2024-05-28', time: '04:15 PM', status: AppointmentStatus.PENDING, reason: 'Neurological Consultation' },
  { id: 'a6', patientId: 'p8', doctorId: 'd5', patientName: 'Dana Scully', doctorName: 'Dr. Shaun Murphy', date: '2024-05-29', time: '10:45 AM', status: AppointmentStatus.PENDING, reason: 'Pediatric Research Inquiry' },
];

// --- COMPONENTS ---

const Login = ({ onLogin }: { onLogin: (role: UserRole, user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('PATIENT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = { 
      id: role === 'ADMIN' ? 'u_admin' : role === 'DOCTOR' ? 'd1' : 'p1', 
      email, 
      role, 
      name: role === 'ADMIN' ? 'System Administrator' : role === 'DOCTOR' ? 'Dr. Sarah Connor' : 'John Doe' 
    };
    onLogin(role, user);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-medical p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-12 rounded-[56px] w-full max-w-lg border-white shadow-2xl">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="p-5 bg-teal-500 text-white rounded-[24px] shadow-xl mb-6"><Activity size={32} /></div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Healthcare Nexus</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Secure Gateway Access</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
            {(['PATIENT', 'DOCTOR', 'ADMIN'] as UserRole[]).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)} className={`py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${role === r ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{r}</button>
            ))}
          </div>
          <div className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all font-bold" required />
          </div>
          <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-teal-600 transition-all active:scale-95">Initiate Login</button>
        </form>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.get(STORAGE_KEYS.CURRENT_USER, null));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Data States hydrated from "Database" (LocalStorage)
  const [patients, setPatients] = useState<Patient[]>(() => storage.get(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS));
  const [doctors, setDoctors] = useState<Doctor[]>(() => storage.get(STORAGE_KEYS.DOCTORS, INITIAL_DOCTORS));
  const [appointments, setAppointments] = useState<Appointment[]>(() => storage.get(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS));
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => storage.get(STORAGE_KEYS.PRESCRIPTIONS, []));
  const [aiReports, setAiReports] = useState<AIReport[]>(() => storage.get(STORAGE_KEYS.AI_REPORTS, []));
  
  // Database Inspector State
  const [inspectedTable, setInspectedTable] = useState<keyof typeof STORAGE_KEYS>('DOCTORS');
  const [inspectorView, setInspectorView] = useState<'TABLE' | 'SOURCE'>('TABLE');

  // Persistence Watchers
  useEffect(() => { storage.set(STORAGE_KEYS.PATIENTS, patients); }, [patients]);
  useEffect(() => { storage.set(STORAGE_KEYS.DOCTORS, doctors); }, [doctors]);
  useEffect(() => { storage.set(STORAGE_KEYS.APPOINTMENTS, appointments); }, [appointments]);
  useEffect(() => { storage.set(STORAGE_KEYS.PRESCRIPTIONS, prescriptions); }, [prescriptions]);
  useEffect(() => { storage.set(STORAGE_KEYS.AI_REPORTS, aiReports); }, [aiReports]);
  useEffect(() => { storage.set(STORAGE_KEYS.CURRENT_USER, currentUser); }, [currentUser]);

  // UI States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [aiResult, setAiResult] = useState<AISymptomResult | null>(null);
  
  // Modal Visibility
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  
  // Editing States
  const [editingDoctor, setEditingDoctor] = useState<Partial<Doctor>>({});
  const [editingPatient, setEditingPatient] = useState<Partial<Patient>>({});
  const [newApt, setNewApt] = useState({ patientId: '', doctorId: '', reason: '', date: '', time: '' });
  const [newPrescription, setNewPrescription] = useState({ patientId: '', medication: '', dosage: '', duration: '' });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (role: UserRole, user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storage.set(STORAGE_KEYS.CURRENT_USER, null);
  };

  const resetDatabase = () => {
    if (confirm("WARNING: This will purge all clinic data. Proceed?")) {
      storage.clear();
      window.location.reload();
    }
  };

  const handleAiCheck = async () => {
    if (!symptoms.trim() || !currentUser) return;
    setIsAiLoading(true);
    try {
      const result = await analyzeSymptoms(symptoms);
      setAiResult(result);
      const newReport: AIReport = {
        id: Math.random().toString(36).substr(2, 9),
        patientId: currentUser.id,
        symptoms_text: symptoms,
        ai_response: result,
        created_at: new Date().toISOString()
      };
      setAiReports(prev => [newReport, ...prev]);
    } catch (error) {
      alert("Analysis failed. Please check your network or API key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const saveDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoctor.id) {
      setDoctors(doctors.map(d => d.id === editingDoctor.id ? (editingDoctor as Doctor) : d));
    } else {
      const newDoc: Doctor = {
        ...editingDoctor as Doctor,
        id: 'd' + Date.now(),
        rating: 5.0
      };
      setDoctors([...doctors, newDoc]);
    }
    setShowDoctorModal(false);
    setEditingDoctor({});
  };

  const savePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPatient.id) {
      setPatients(patients.map(p => p.id === editingPatient.id ? (editingPatient as Patient) : p));
    } else {
      const newPat: Patient = {
        ...editingPatient as Patient,
        id: 'p' + Date.now(),
        lastVisit: new Date().toISOString().split('T')[0],
        historyEntries: []
      };
      setPatients([...patients, newPat]);
    }
    setShowPatientModal(false);
    setEditingPatient({});
  };

  const scheduleAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPatientId = currentUser?.role === 'ADMIN' ? newApt.patientId : currentUser?.id;
    if (!targetPatientId) return;

    const doctor = doctors.find(d => d.id === newApt.doctorId);
    const patient = patients.find(p => p.id === targetPatientId);
    
    const newAppointment: Appointment = {
      id: 'a' + Date.now(),
      patientId: targetPatientId,
      doctorId: newApt.doctorId,
      patientName: patient?.name || 'Unknown',
      doctorName: doctor?.name || 'Unknown',
      date: newApt.date,
      time: newApt.time,
      status: AppointmentStatus.PENDING,
      reason: newApt.reason
    };
    setAppointments([newAppointment, ...appointments]);
    setShowAppointmentModal(false);
    setNewApt({ patientId: '', doctorId: '', reason: '', date: '', time: '' });
  };

  const createPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const prescription: Prescription = {
      id: 'rx' + Date.now(),
      patientId: newPrescription.patientId,
      doctorId: currentUser.id,
      medication: newPrescription.medication,
      dosage: newPrescription.dosage,
      duration: newPrescription.duration,
      date: new Date().toISOString().split('T')[0]
    };
    setPrescriptions([prescription, ...prescriptions]);
    setShowPrescriptionModal(false);
    setNewPrescription({ patientId: '', medication: '', dosage: '', duration: '' });
  };

  const filteredAppointments = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return appointments;
    if (currentUser.role === 'DOCTOR') return appointments.filter(a => a.doctorId === currentUser.id);
    return appointments.filter(a => a.patientId === currentUser.id);
  }, [currentUser, appointments]);

  const getInspectedData = () => {
    switch (inspectedTable) {
      case 'DOCTORS': return doctors;
      case 'PATIENTS': return patients;
      case 'APPOINTMENTS': return appointments;
      case 'PRESCRIPTIONS': return prescriptions;
      case 'AI_REPORTS': return aiReports;
      case 'CURRENT_USER': return currentUser;
      default: return [];
    }
  };

  const downloadCSV = () => {
    const data = getInspectedData();
    if (!Array.isArray(data) || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const val = (row as any)[header];
        return typeof val === 'object' ? `"${JSON.stringify(val).replace(/"/g, '""')}"` : `"${val}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${inspectedTable.toLowerCase()}_export_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white flex-col gap-8">
        <motion.div animate={{ rotate: 360, scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="p-8 bg-teal-500 rounded-[32px] shadow-2xl shadow-teal-500/30">
          <Activity size={48} />
        </motion.div>
        <h2 className="text-4xl font-black tracking-tighter">Establishing Nexus...</h2>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-medical relative overflow-hidden">
      
      {/* SIDEBAR */}
      <motion.aside animate={{ x: isSidebarOpen ? 0 : -320 }} className="w-80 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-[100] shadow-2xl">
        <div className="p-10 flex flex-col flex-1">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-4 bg-teal-500 rounded-[22px] shadow-xl"><Activity size={24} /></div>
            <h1 className="text-2xl font-black tracking-tighter">Nexus HMS</h1>
          </div>
          <nav className="space-y-3">
            {NAV_ITEMS.filter(item => item.roles.includes(currentUser.role)).map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-5 px-8 py-5 rounded-[28px] transition-all ${activeTab === item.id ? 'bg-teal-500 text-white shadow-2xl' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                {item.icon}
                <span className="font-bold tracking-tight text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="p-10 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-4 text-slate-500 hover:text-rose-400 transition-all font-black uppercase tracking-widest text-[10px] w-full px-2">
            <LogOut size={18} /> Logout Session
          </button>
        </div>
      </motion.aside>

      {/* MAIN CONTENT */}
      <motion.main animate={{ marginLeft: isSidebarOpen ? 320 : 0 }} className="flex-1 p-16 max-w-[1600px] mx-auto w-full">
        <header className="flex justify-between items-end mb-16">
          <div className="flex items-center gap-8">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-5 bg-slate-900 text-white rounded-3xl shadow-xl hover:bg-teal-500 transition-all"><Menu size={20} /></button>
            )}
            <div>
              <p className="text-teal-600 font-black uppercase tracking-[0.4em] text-[10px] mb-2">Nexus Node Control</p>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter capitalize">{activeTab}</h2>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm font-black text-slate-900">{currentUser.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentUser.role}</p>
            </div>
            <div className="w-16 h-16 rounded-[24px] bg-slate-200 flex items-center justify-center text-slate-500 font-black text-xl">{currentUser.name[0]}</div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="glass p-10 rounded-[48px] border-white shadow-lg">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[24px]"><Users size={24} /></div>
                  </div>
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Clinic Registry</h3>
                  <p className="text-5xl font-black text-slate-900 tracking-tighter">{patients.length}</p>
                </div>
                <div className="glass p-10 rounded-[48px] border-white shadow-lg">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-5 bg-teal-50 text-teal-600 rounded-[24px]"><Calendar size={24} /></div>
                  </div>
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Schedules</h3>
                  <p className="text-5xl font-black text-slate-900 tracking-tighter">{filteredAppointments.length}</p>
                </div>
                <div className="glass p-10 rounded-[48px] border-white shadow-lg">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-5 bg-rose-50 text-rose-600 rounded-[24px]"><Database size={24} /></div>
                  </div>
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Database Sync</h3>
                  <p className="text-5xl font-black text-slate-900 tracking-tighter">Live</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="glass p-12 rounded-[64px] border-white shadow-xl">
                  <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight">Recent Activity</h3>
                  <div className="space-y-6">
                    {filteredAppointments.length > 0 ? filteredAppointments.slice(0, 3).map(a => (
                      <div key={a.id} className="flex items-center gap-6 p-6 bg-slate-50/50 rounded-3xl">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-teal-600"><Clock size={20} /></div>
                        <div>
                          <p className="font-black text-slate-900">{a.status} Appointment</p>
                          <p className="text-xs font-bold text-slate-400">{a.date} at {a.time}</p>
                        </div>
                      </div>
                    )) : (
                      <p className="text-slate-400 font-bold italic">No recent activity detected.</p>
                    )}
                  </div>
                </div>
                <div className="glass p-12 rounded-[64px] border-white shadow-xl">
                  <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight">System Health</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[{n:'M',c:10},{n:'T',c:25},{n:'W',c:18},{n:'T',c:45},{n:'F',c:30}]}>
                        <defs><linearGradient id="color" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4}/><stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="n" axisLine={false} tickLine={false} />
                        <Area type="monotone" dataKey="c" stroke="#14b8a6" fill="url(#color)" strokeWidth={4} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'system' && currentUser.role === 'ADMIN' && (
            <motion.div key="sys" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-24">
               
               {/* CLINIC ORCHESTRATION (NEW SETTINGS-STYLE MANUAL ENTRY) */}
               <div>
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                      <Settings className="text-teal-500" /> Clinic Orchestration
                    </h3>
                    <div className="flex gap-4">
                      <button onClick={resetDatabase} className="px-6 py-4 bg-rose-50 text-rose-600 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2">
                        <RefreshCw size={14} /> Reset System
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <button onClick={() => { setEditingDoctor({}); setShowDoctorModal(true); }} className="glass p-10 rounded-[48px] border-white shadow-lg group hover:bg-slate-900 transition-all text-left">
                       <div className="p-5 bg-teal-50 text-teal-600 rounded-[24px] w-fit mb-6 group-hover:bg-teal-500 group-hover:text-white transition-colors"><Stethoscope size={24} /></div>
                       <p className="text-slate-900 font-black text-xl group-hover:text-white">Manual Doctor Entry</p>
                       <p className="text-slate-400 font-bold text-xs mt-2 group-hover:text-teal-200">Inject new specialist into registry</p>
                    </button>
                    <button onClick={() => { setEditingPatient({}); setShowPatientModal(true); }} className="glass p-10 rounded-[48px] border-white shadow-lg group hover:bg-slate-900 transition-all text-left">
                       <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[24px] w-fit mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-colors"><UserPlus size={24} /></div>
                       <p className="text-slate-900 font-black text-xl group-hover:text-white">Manual Patient Entry</p>
                       <p className="text-slate-400 font-bold text-xs mt-2 group-hover:text-indigo-200">Register new patient entity</p>
                    </button>
                    <button onClick={() => { setNewApt({ patientId: '', doctorId: '', reason: '', date: '', time: '' }); setShowAppointmentModal(true); }} className="glass p-10 rounded-[48px] border-white shadow-lg group hover:bg-slate-900 transition-all text-left">
                       <div className="p-5 bg-amber-50 text-amber-600 rounded-[24px] w-fit mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors"><Calendar size={24} /></div>
                       <p className="text-slate-900 font-black text-xl group-hover:text-white">Orchestrate Session</p>
                       <p className="text-slate-400 font-bold text-xs mt-2 group-hover:text-amber-200">Manually link patient and doctor</p>
                    </button>
                  </div>
               </div>

               {/* DATABASE INSPECTOR SECTION */}
               <div className="pt-12 border-t border-slate-200">
                  <div className="flex justify-between items-end mb-10">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                        <HardDrive className="text-indigo-500" /> Nexus Data Core
                      </h3>
                      <p className="text-slate-400 font-bold text-xs mt-2 ml-10">Direct browser database viewer. Live sync across all nodes.</p>
                    </div>
                    <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl">
                      <button onClick={() => setInspectorView('TABLE')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inspectorView === 'TABLE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Table View</button>
                      <button onClick={() => setInspectorView('SOURCE')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${inspectorView === 'SOURCE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>JSON Source</button>
                    </div>
                  </div>
                  
                  <div className="glass p-10 rounded-[64px] border-white shadow-2xl space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar max-w-[70%]">
                        {(Object.keys(STORAGE_KEYS) as Array<keyof typeof STORAGE_KEYS>).map(key => (
                          <button 
                            key={key} 
                            onClick={() => setInspectedTable(key)}
                            className={`px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 whitespace-nowrap ${inspectedTable === key ? 'bg-indigo-600 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                          >
                            <TableIcon size={14} /> {key.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={downloadCSV} className="px-8 py-4 bg-teal-50 text-teal-700 rounded-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-teal-100 transition-all">
                          <FileSpreadsheet size={16} /> Download CSV
                        </button>
                      </div>
                    </div>

                    <div className="rounded-[40px] overflow-hidden border border-slate-100 bg-white">
                      {inspectorView === 'TABLE' ? (
                        <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                          {Array.isArray(getInspectedData()) ? (
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-slate-50 sticky top-0 z-10">
                                <tr>
                                  {getInspectedData() && (getInspectedData() as any[]).length > 0 ? Object.keys((getInspectedData() as any[])[0]).map(key => (
                                    <th key={key} className="px-6 py-5 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">{key}</th>
                                  )) : <th className="px-6 py-5">No Data</th>}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {(getInspectedData() as any[]).map((row, i) => (
                                  <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                                    {Object.values(row).map((val: any, j) => (
                                      <td key={j} className="px-6 py-4 text-[11px] font-medium text-slate-600 whitespace-nowrap overflow-hidden max-w-[200px] text-ellipsis">
                                        {typeof val === 'object' ? <span className="text-[9px] text-indigo-400 opacity-60 italic">Nested Data</span> : String(val)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                             <div className="p-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest italic">Viewing Storage Primitive</div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-slate-950 p-10 overflow-auto max-h-[600px] custom-scrollbar">
                          <pre className="text-indigo-400 font-mono text-xs leading-relaxed">
                            {JSON.stringify(getInspectedData(), null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'patients' && (
            <motion.div key="pts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Patient Registry</h3>
                  {currentUser.role === 'ADMIN' && (
                    <button onClick={() => { setEditingPatient({}); setShowPatientModal(true); }} className="px-8 py-4 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-indigo-600 transition-all flex items-center gap-2">
                      <UserPlus size={16} /> Register Patient
                    </button>
                  )}
               </div>
               <div className="glass overflow-hidden rounded-[40px] border-white shadow-xl">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-slate-100">
                       <tr>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Blood Group</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                       {patients.map(p => (
                         <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-6 text-xs font-mono text-slate-400">{p.id}</td>
                           <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black text-sm">{p.name[0]}</div>
                               <p className="font-black text-slate-900">{p.name}</p>
                             </div>
                           </td>
                           <td className="px-8 py-6">
                             <p className="text-xs font-bold text-slate-600">{p.email}</p>
                             <p className="text-[10px] text-slate-400">{p.phone}</p>
                           </td>
                           <td className="px-8 py-6">
                             <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full font-black text-[10px]">{p.bloodGroup}</span>
                           </td>
                           <td className="px-8 py-6 text-right">
                             <div className="flex justify-end gap-2">
                               {currentUser.role === 'ADMIN' && (
                                 <button onClick={() => { setEditingPatient(p); setShowPatientModal(true); }} className="p-3 bg-white text-slate-400 rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 hover:text-indigo-600 transition-all"><Edit2 size={14} /></button>
                               )}
                               <button onClick={() => setActiveTab('records')} className="p-3 bg-white text-teal-600 rounded-xl shadow-sm border border-slate-100 hover:bg-teal-50 transition-all"><Eye size={14} /></button>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'symptom-checker' && currentUser.role === 'PATIENT' && (
            <motion.div key="ai" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <div className="p-6 bg-gradient-to-br from-indigo-500 to-teal-500 text-white rounded-[32px] w-fit mx-auto shadow-2xl mb-8"><BrainCircuit size={48} /></div>
                <h3 className="text-5xl font-black text-slate-900 tracking-tighter">AI Clinical Agent</h3>
                <p className="text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">Submit your clinical data for immediate intelligent analysis.</p>
              </div>

              <div className="glass p-12 rounded-[56px] border-white shadow-2xl space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-6">Symptom Input Terminal</label>
                  <textarea 
                    value={symptoms}
                    onChange={e => setSymptoms(e.target.value)}
                    placeholder="Describe symptoms here..."
                    className="w-full h-48 bg-slate-50/50 rounded-[40px] p-10 border border-slate-100 outline-none focus:ring-8 focus:ring-teal-500/5 focus:border-teal-500 transition-all font-bold text-lg resize-none"
                  />
                </div>
                <button 
                  onClick={handleAiCheck} 
                  disabled={isAiLoading || !symptoms.trim()}
                  className="w-full py-10 bg-slate-900 text-white rounded-[48px] font-black uppercase tracking-[0.4em] text-xs shadow-2xl hover:bg-teal-600 transition-all flex items-center justify-center gap-6 disabled:opacity-20"
                >
                  {isAiLoading ? <Activity className="animate-spin" /> : <Sparkles size={24} />}
                  {isAiLoading ? 'Synthesizing Patterns...' : 'Commence Analysis'}
                </button>
              </div>

              {aiResult && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-20">
                  <div className="p-10 bg-amber-50 border border-amber-100 rounded-[40px] flex items-start gap-6 shadow-sm">
                    <AlertCircle className="text-amber-600 mt-1" size={24} />
                    <p className="text-amber-800 font-bold text-sm leading-relaxed">{aiResult.disclaimer}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="glass p-12 rounded-[56px] border-white shadow-xl space-y-8">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><History size={16} /> Findings</h4>
                      <div className="space-y-3">
                        {aiResult.possibleDiseases.map((d, i) => (
                          <div key={i} className="px-6 py-4 bg-slate-50 rounded-2xl font-black text-slate-800 border border-slate-100">{d}</div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-8 border-t border-slate-50">
                        <span className="text-[10px] font-black uppercase text-slate-400">Threat Level</span>
                        <span className={`px-6 py-2 rounded-full font-black text-xs ${aiResult.severity === 'Emergency' ? 'bg-rose-500 text-white' : 'bg-teal-100 text-teal-700'}`}>{aiResult.severity}</span>
                      </div>
                    </div>
                    <div className="glass p-12 rounded-[56px] border-white shadow-xl space-y-8">
                       <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Stethoscope size={16} /> Expert Routing</h4>
                       <div className="p-8 bg-indigo-50 text-indigo-700 rounded-3xl font-black text-2xl tracking-tight">{aiResult.specialist}</div>
                       <div>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Immediate Care</h4>
                        <ul className="space-y-3">
                          {aiResult.precautions.map((p, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-600 font-bold text-sm"><CheckCircle className="text-teal-500" size={16} /> {p}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'appointments' && (
            <motion.div key="apts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Clinic Pipeline</h3>
                  {(currentUser.role === 'PATIENT' || currentUser.role === 'ADMIN') && (
                    <button onClick={() => { setNewApt({ patientId: '', doctorId: '', reason: '', date: '', time: '' }); setShowAppointmentModal(true); }} className="px-10 py-5 bg-slate-900 text-white rounded-[32px] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-teal-600 transition-all flex items-center gap-2">
                      <PlusCircle size={16} /> Schedule Session
                    </button>
                  )}
               </div>
               
               <div className="glass overflow-hidden rounded-[56px] border-white shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date/Time</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Participants</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reason</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                          <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredAppointments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-10 py-20 text-center text-slate-300 font-black uppercase tracking-widest text-[10px]">Empty Clinical Pipeline</td>
                          </tr>
                        ) : (
                          filteredAppointments.map(apt => (
                            <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-10 py-8">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-slate-950 text-white rounded-xl text-center min-w-[50px]">
                                    <p className="text-[8px] opacity-60 uppercase">{new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                                    <p className="text-lg font-black leading-none">{new Date(apt.date).getDate()}</p>
                                  </div>
                                  <p className="text-xs font-black text-slate-900">{apt.time}</p>
                                </div>
                              </td>
                              <td className="px-10 py-8">
                                <p className="font-black text-slate-900 tracking-tight">Patient: {apt.patientName}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Doctor: {apt.doctorName}</p>
                              </td>
                              <td className="px-10 py-8">
                                <p className="text-xs text-slate-500 italic max-w-xs truncate">{apt.reason}</p>
                              </td>
                              <td className="px-10 py-8">
                                <span className={`px-6 py-2 rounded-full font-black text-[10px] uppercase ${STATUS_STYLES[apt.status]}`}>{apt.status}</span>
                              </td>
                              <td className="px-10 py-8 text-right">
                                <div className="flex justify-end gap-2">
                                  {(currentUser.role === 'DOCTOR' || currentUser.role === 'ADMIN') && (
                                    <button 
                                      onClick={() => { setNewPrescription({...newPrescription, patientId: apt.patientId}); setShowPrescriptionModal(true); }}
                                      className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm border border-slate-100 hover:bg-indigo-50 transition-all"
                                      title="Prescribe"
                                    >
                                      <Pill size={16} />
                                    </button>
                                  )}
                                  {currentUser.role === 'DOCTOR' && apt.status === AppointmentStatus.PENDING && (
                                    <button 
                                      onClick={() => setAppointments(appointments.map(a => a.id === apt.id ? {...a, status: AppointmentStatus.CONFIRMED} : a))}
                                      className="p-3 bg-teal-500 text-white rounded-xl shadow-lg hover:bg-teal-600 transition-all"
                                    >
                                      <CheckCircle size={18} />
                                    </button>
                                  )}
                                  {currentUser.role === 'ADMIN' && (
                                    <button 
                                      onClick={() => setAppointments(appointments.filter(a => a.id !== apt.id))}
                                      className="p-3 bg-white text-rose-500 rounded-xl shadow-sm border border-slate-100 hover:bg-rose-50 transition-all"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'records' && (
            <motion.div key="rec" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 pb-24">
               <h3 className="text-3xl font-black text-slate-900 tracking-tight">Clinical Records</h3>
               
               <div className="glass overflow-hidden rounded-[40px] border-white shadow-xl">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-slate-50 border-b border-slate-100">
                       <tr>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient Entity</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Visit History</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Active Prescriptions</th>
                         <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                       {patients.filter(p => currentUser.role !== 'PATIENT' || p.id === currentUser.id).map(p => (
                         <tr key={p.id} className="hover:bg-slate-50/50 transition-colors align-top">
                           <td className="px-8 py-8 w-[250px]">
                             <div className="flex items-center gap-4 mb-2">
                               <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black">{p.name[0]}</div>
                               <p className="font-black text-slate-900">{p.name}</p>
                             </div>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {p.id}</p>
                             <p className="text-[10px] text-rose-500 font-black mt-1">{p.bloodGroup} PRIMARY</p>
                           </td>
                           <td className="px-8 py-8">
                             <div className="space-y-4">
                               {p.historyEntries?.map(h => (
                                 <div key={h.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                                   <div className="text-[10px] font-black text-teal-600 bg-white px-3 py-1 rounded-lg shadow-sm whitespace-nowrap">{h.date}</div>
                                   <div>
                                     <p className="text-xs font-black text-slate-900 mb-1">{h.diagnosis}</p>
                                     <p className="text-[10px] text-slate-500 leading-relaxed">{h.treatment}</p>
                                   </div>
                                 </div>
                               ))}
                               {(!p.historyEntries || p.historyEntries.length === 0) && (
                                 <p className="text-xs text-slate-300 italic">No history logged.</p>
                               )}
                             </div>
                           </td>
                           <td className="px-8 py-8">
                              <div className="space-y-3">
                                {prescriptions.filter(rx => rx.patientId === p.id).map(rx => (
                                  <div key={rx.id} className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-start gap-3">
                                    <Pill size={14} className="text-indigo-600 mt-1" />
                                    <div>
                                      <p className="text-xs font-black text-slate-900">{rx.medication}</p>
                                      <p className="text-[10px] text-slate-500 font-bold">{rx.dosage} • {rx.duration}</p>
                                      <p className="text-[9px] text-indigo-400 uppercase tracking-widest mt-1">Ref: {rx.id}</p>
                                    </div>
                                  </div>
                                ))}
                                {prescriptions.filter(rx => rx.patientId === p.id).length === 0 && (
                                  <p className="text-xs text-slate-300 italic">No active prescriptions.</p>
                                )}
                              </div>
                           </td>
                           <td className="px-8 py-8 text-right">
                             <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-teal-600 transition-all flex items-center gap-2 ml-auto">
                               <Download size={14} /> Clinical Export
                             </button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.main>

      {/* MODAL: DOCTOR MGMT (ADMIN) */}
      <AnimatePresence>
        {showDoctorModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass p-12 rounded-[56px] w-full max-w-2xl border-white shadow-2xl relative">
              <button onClick={() => setShowDoctorModal(false)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-600"><X size={24} /></button>
              <h3 className="text-3xl font-black text-slate-900 mb-10">{editingDoctor.id ? 'Modify Specialist' : 'Manual Specialist Onboarding'}</h3>
              <form onSubmit={saveDoctor} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Legal Name</label>
                  <input placeholder="e.g. Dr. Julian Bashir" value={editingDoctor.name || ''} onChange={e => setEditingDoctor({...editingDoctor, name: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-500/10 font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Medical Email</label>
                  <input placeholder="specialist@nexus.med" value={editingDoctor.email || ''} onChange={e => setEditingDoctor({...editingDoctor, email: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-500/10 font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Specialization</label>
                  <input placeholder="e.g. Neurosurgery" value={editingDoctor.specialization || ''} onChange={e => setEditingDoctor({...editingDoctor, specialization: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-500/10 font-bold" required />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Registry License Number</label>
                  <input placeholder="e.g. MED-88221-X" value={editingDoctor.licenseNumber || ''} onChange={e => setEditingDoctor({...editingDoctor, licenseNumber: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-500/10 font-bold" required />
                </div>
                <button type="submit" className="col-span-2 mt-4 py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-teal-600 transition-all flex items-center justify-center gap-4">
                  <Save size={20} /> Authorize Specialist
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PATIENT MGMT (ADMIN) */}
      <AnimatePresence>
        {showPatientModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass p-12 rounded-[56px] w-full max-w-2xl border-white shadow-2xl relative">
              <button onClick={() => setShowPatientModal(false)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-600"><X size={24} /></button>
              <h3 className="text-3xl font-black text-slate-900 mb-10">{editingPatient.id ? 'Modify Profile' : 'Manual Patient Registration'}</h3>
              <form onSubmit={savePatient} className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Patient Name</label>
                  <input placeholder="Full Name" value={editingPatient.name || ''} onChange={e => setEditingPatient({...editingPatient, name: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Contact Email</label>
                  <input placeholder="email@address.com" value={editingPatient.email || ''} onChange={e => setEditingPatient({...editingPatient, email: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Phone Number</label>
                  <input placeholder="555-000-0000" value={editingPatient.phone || ''} onChange={e => setEditingPatient({...editingPatient, phone: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Blood Group</label>
                  <select value={editingPatient.bloodGroup || ''} onChange={e => setEditingPatient({...editingPatient, bloodGroup: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" required>
                    <option value="">Select Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Primary Condition</label>
                   <input placeholder="e.g. Type 2 Diabetes" value={editingPatient.medicalHistory || ''} onChange={e => setEditingPatient({...editingPatient, medicalHistory: e.target.value})} className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" required />
                </div>
                <button type="submit" className="col-span-2 mt-4 py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4">
                  <UserCheck size={20} /> Sync Patient Registry
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SCHEDULE (PATIENT OR ADMIN) */}
      <AnimatePresence>
        {showAppointmentModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass p-12 rounded-[56px] w-full max-w-2xl border-white shadow-2xl relative">
              <button onClick={() => setShowAppointmentModal(false)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-600"><X size={24} /></button>
              <h3 className="text-3xl font-black text-slate-900 mb-10">{currentUser.role === 'ADMIN' ? 'Manual Session Orchestration' : 'Schedule Medical Session'}</h3>
              <form onSubmit={scheduleAppointment} className="space-y-6">
                
                {currentUser.role === 'ADMIN' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Target Patient Entity</label>
                    <select 
                      value={newApt.patientId} 
                      onChange={e => setNewApt({...newApt, patientId: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-100 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-teal-500/10 font-bold"
                      required
                    >
                      <option value="">Choose patient...</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Select Specialist</label>
                  <select 
                    value={newApt.doctorId} 
                    onChange={e => setNewApt({...newApt, doctorId: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-500/10 font-bold"
                    required
                  >
                    <option value="">Choose doctor...</option>
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Preferred Date</label>
                    <input 
                      type="date" 
                      value={newApt.date}
                      onChange={e => setNewApt({...newApt, date: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-500/10 font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Preferred Time</label>
                    <input 
                      type="time" 
                      value={newApt.time}
                      onChange={e => setNewApt({...newApt, time: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-500/10 font-bold"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Primary Complaint</label>
                  <textarea 
                    placeholder="Describe clinical reason..." 
                    value={newApt.reason}
                    onChange={e => setNewApt({...newApt, reason: e.target.value})}
                    className="w-full h-32 px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-teal-500/10 font-bold resize-none"
                    required
                  />
                </div>
                <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-teal-600 transition-all flex items-center justify-center gap-4">
                  <Calendar size={20} /> Authorize Clinical Session
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DOCTOR MODAL: PRESCRIBE */}
      <AnimatePresence>
        {showPrescriptionModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass p-12 rounded-[56px] w-full max-lg border-white shadow-2xl relative">
              <button onClick={() => setShowPrescriptionModal(false)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-600"><X size={24} /></button>
              <h3 className="text-3xl font-black text-slate-900 mb-10 flex items-center gap-4">
                <Pill className="text-indigo-500" /> New Prescription
              </h3>
              <form onSubmit={createPrescription} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Patient Target</label>
                  <div className="px-8 py-5 bg-slate-100 rounded-3xl font-bold text-slate-600">
                    {patients.find(p => p.id === newPrescription.patientId)?.name || 'Unknown Patient'}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Medication Name</label>
                  <input 
                    placeholder="e.g. Amoxicillin 500mg" 
                    value={newPrescription.medication} 
                    onChange={e => setNewPrescription({...newPrescription, medication: e.target.value})} 
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Dosage</label>
                    <input 
                      placeholder="e.g. 1 Tab 3x Daily" 
                      value={newPrescription.dosage} 
                      onChange={e => setNewPrescription({...newPrescription, dosage: e.target.value})} 
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Duration</label>
                    <input 
                      placeholder="e.g. 7 Days" 
                      value={newPrescription.duration} 
                      onChange={e => setNewPrescription({...newPrescription, duration: e.target.value})} 
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold" 
                      required 
                    />
                  </div>
                </div>
                <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 mt-4">
                  <CheckCircle size={20} /> Authorize Prescription
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
