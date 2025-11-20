import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar as CalendarIcon, 
  Search, 
  Bell, 
  Check, 
  X, 
  ChevronRight, 
  MoreHorizontal,
  Settings,
  Home,
  FileText
} from 'lucide-react';

const DesignSystemShowcase: React.FC = () => {
  const navigate = useNavigate();
  const [toggleState, setToggleState] = useState(false);
  const [checkboxState, setCheckboxState] = useState(true);

  return (
    <div className="min-h-screen bg-surface-primary text-content-primary p-8 pb-32 font-sans transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-surface-tertiary gap-4">
          <div>
            <h1 className="text-4xl font-bold text-content-primary mb-2 tracking-tight">Design System</h1>
            <p className="text-content-secondary text-lg">Cleverence Mobile Proto • v1.0.0</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/')} icon={<Home size={18} />}>
              Back to Home
            </Button>
          </div>
        </header>

        {/* 1. Typography Scale */}
        <section className="space-y-6">
          <SectionHeader title="01. Typography" description="Atkinson Hyperlegible scale" />
          
          <div className="bg-surface-secondary rounded-2xl border border-surface-tertiary overflow-hidden">
            <div className="p-8 space-y-8">
              <TypeSpecimen size="text-3xl" label="Display 3XL" weight="font-bold" sizeLabel="36px" />
              <TypeSpecimen size="text-2xl" label="Display 2XL" weight="font-bold" sizeLabel="32px" />
              <TypeSpecimen size="text-xl" label="Heading XL" weight="font-bold" sizeLabel="24px" />
              <TypeSpecimen size="text-lg" label="Heading LG" weight="font-bold" sizeLabel="20px" />
              <TypeSpecimen size="text-base" label="Body Base" weight="font-normal" sizeLabel="16px" />
              <TypeSpecimen size="text-sm" label="Body Small" weight="font-normal" sizeLabel="12px" />
              <TypeSpecimen size="text-xs" label="Caption XS" weight="font-normal" sizeLabel="10px" />
            </div>
          </div>
        </section>

        {/* 2. Color Palette */}
        <section className="space-y-6">
          <SectionHeader title="02. Colors" description="Semantic palette tokens" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Surface */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-content-tertiary border-b border-surface-tertiary pb-2">Surface</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorCard name="surface-primary" hex="#242424" bg="bg-surface-primary" />
                <ColorCard name="surface-secondary" hex="#343436" bg="bg-surface-secondary" />
                <ColorCard name="surface-tertiary" hex="#474747" bg="bg-surface-tertiary" />
                <ColorCard name="surface-inverse" hex="#ffffff" bg="bg-surface-inverse" text="text-surface-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-content-tertiary border-b border-surface-tertiary pb-2">Content</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorCard name="content-primary" hex="#ffffff" bg="bg-content-primary" text="text-surface-primary" />
                <ColorCard name="content-secondary" hex="#e3e3dd" bg="bg-content-secondary" text="text-surface-primary" />
                <ColorCard name="content-tertiary" hex="#a7a7a7" bg="bg-content-tertiary" text="text-surface-primary" />
                <ColorCard name="content-inverse" hex="#242424" bg="bg-content-inverse" text="text-content-primary" />
              </div>
            </div>

            {/* Brand */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-content-tertiary border-b border-surface-tertiary pb-2">Brand</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorCard name="brand-primary" hex="#daa420" bg="bg-brand-primary" text="text-brand-dark" />
                <ColorCard name="brand-dark" hex="#725a1e" bg="bg-brand-dark" text="text-white" />
                <ColorCard name="brand-secondary" hex="#86e0cb" bg="bg-brand-secondary" text="text-surface-primary" />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-content-tertiary border-b border-surface-tertiary pb-2">Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <ColorCard name="success" hex="#91ed91" bg="bg-success" text="text-surface-primary" />
                <ColorCard name="warning" hex="#f3a361" bg="bg-warning" text="text-surface-primary" />
                <ColorCard name="error" hex="#ba8f8e" bg="bg-error" text="text-surface-primary" />
                <ColorCard name="info" hex="#86e0cb" bg="bg-info" text="text-surface-primary" />
              </div>
            </div>
          </div>
        </section>

        {/* 3. Buttons */}
        <section className="space-y-6">
          <SectionHeader title="03. Buttons" description="Interactive elements" />

          <div className="p-8 bg-surface-secondary rounded-2xl border border-surface-tertiary space-y-8">
            {/* Standard Buttons */}
            <div className="space-y-4">
              <h4 className="text-sm text-content-tertiary font-bold uppercase">Standard</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </div>

            {/* With Icons */}
            <div className="space-y-4">
              <h4 className="text-sm text-content-tertiary font-bold uppercase">With Icons</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary" icon={<Check size={18} />}>Confirm</Button>
                <Button variant="secondary" icon={<Settings size={18} />}>Settings</Button>
                <Button variant="ghost" icon={<ChevronRight size={18} />}>Next</Button>
              </div>
            </div>

            {/* Icon Only */}
            <div className="space-y-4">
              <h4 className="text-sm text-content-tertiary font-bold uppercase">Icon Only</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <IconButton variant="primary" icon={<Search size={20} />} />
                <IconButton variant="secondary" icon={<Bell size={20} />} />
                <IconButton variant="ghost" icon={<MoreHorizontal size={20} />} />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Cards */}
        <section className="space-y-6">
          <SectionHeader title="04. Cards" description="Content containers" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Base Card */}
            <div className="bg-surface-secondary p-6 rounded-lg border border-surface-tertiary">
              <h4 className="text-lg font-bold mb-2">Base Card</h4>
              <p className="text-content-secondary text-sm leading-relaxed">
                Standard container with subtle border and no shadow. Used for grouped content.
              </p>
            </div>

            {/* Elevated Card */}
            <div className="bg-surface-secondary p-6 rounded-lg border border-surface-tertiary shadow-soft">
              <h4 className="text-lg font-bold mb-2 text-brand-primary">Elevated Card</h4>
              <p className="text-content-secondary text-sm leading-relaxed">
                Container with soft shadow (`shadow-soft`). Used for floating elements or emphasis.
              </p>
            </div>

            {/* Interactive Card */}
            <div className="bg-surface-secondary p-6 rounded-lg border border-surface-tertiary shadow-soft hover:border-brand-primary/50 hover:shadow-card transition-all cursor-pointer active:scale-[0.98]">
              <div className="flex justify-between items-start mb-3">
                 <h4 className="text-lg font-bold">Interactive</h4>
                 <Badge label="Click Me" variant="success" />
              </div>
              <p className="text-content-secondary text-sm leading-relaxed">
                Reacts to hover and click. Scales down slightly on active press.
              </p>
            </div>
          </div>
        </section>

        {/* 5. UI Elements */}
        <section className="space-y-6">
          <SectionHeader title="05. UI Elements" description="Badges, Avatars, Progress" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Avatars & Badges */}
            <div className="p-6 bg-surface-secondary rounded-2xl border border-surface-tertiary space-y-8">
              <div className="space-y-4">
                <h4 className="text-sm text-content-tertiary font-bold uppercase">Avatars</h4>
                <div className="flex items-center gap-4">
                  <Avatar size="lg" src="https://i.pravatar.cc/150?img=11" fallback="JD" />
                  <Avatar size="md" fallback="AB" status="online" />
                  <Avatar size="sm" fallback="User" status="offline" />
                  <div className="flex -space-x-3">
                    <Avatar size="sm" fallback="1" className="border-2 border-surface-secondary" />
                    <Avatar size="sm" fallback="2" className="border-2 border-surface-secondary" />
                    <Avatar size="sm" fallback="3" className="border-2 border-surface-secondary" />
                    <div className="w-8 h-8 rounded-full bg-surface-tertiary border-2 border-surface-secondary flex items-center justify-center text-[10px] font-bold text-content-secondary">
                      +5
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm text-content-tertiary font-bold uppercase">Badges & Pills</h4>
                <div className="flex flex-wrap gap-3">
                  <Badge label="Success" variant="success" />
                  <Badge label="Warning" variant="warning" />
                  <Badge label="Error" variant="error" />
                  <Badge label="Info" variant="info" />
                  <Badge label="Neutral" variant="neutral" />
                </div>
              </div>
            </div>

            {/* Progress & Loading */}
            <div className="p-6 bg-surface-secondary rounded-2xl border border-surface-tertiary space-y-8">
              <div className="space-y-4">
                <h4 className="text-sm text-content-tertiary font-bold uppercase">Progress Indicators</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-content-secondary">
                    <span>Downloading...</span>
                    <span>45%</span>
                  </div>
                  <ProgressBar value={45} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-content-secondary">
                    <span>Completed</span>
                    <span className="text-success">100%</span>
                  </div>
                  <ProgressBar value={100} variant="success" />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm text-content-tertiary font-bold uppercase">Skeleton Loading</h4>
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-surface-tertiary rounded w-3/4"></div>
                  <div className="h-4 bg-surface-tertiary rounded w-1/2"></div>
                  <div className="h-32 bg-surface-tertiary rounded w-full mt-4"></div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 6. Forms */}
        <section className="space-y-6">
          <SectionHeader title="06. Form Elements" description="Inputs, Toggles, Checkboxes" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="p-6 bg-surface-secondary rounded-2xl border border-surface-tertiary space-y-6">
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-4">Input Fields</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-content-secondary">Email Address</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-content-tertiary" size={18} />
                  <input 
                    type="email" 
                    placeholder="user@example.com" 
                    className="w-full bg-surface-primary text-content-primary pl-10 pr-4 py-2.5 rounded-lg border border-surface-tertiary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all placeholder-content-tertiary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-content-secondary">Bio</label>
                <textarea 
                  rows={3}
                  placeholder="Tell us about yourself..." 
                  className="w-full bg-surface-primary text-content-primary px-4 py-2.5 rounded-lg border border-surface-tertiary focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all placeholder-content-tertiary resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-content-secondary">Disabled Input</label>
                <input 
                  type="text" 
                  disabled
                  value="Cannot edit this" 
                  className="w-full bg-surface-tertiary text-content-tertiary px-4 py-2.5 rounded-lg border border-transparent cursor-not-allowed"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="p-6 bg-surface-secondary rounded-2xl border border-surface-tertiary space-y-6">
              <h4 className="text-sm text-content-tertiary font-bold uppercase mb-4">Selection Controls</h4>
              
              {/* Toggle */}
              <div className="flex items-center justify-between p-3 bg-surface-primary rounded-lg border border-surface-tertiary">
                <div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-xs text-content-tertiary">Receive email alerts</div>
                </div>
                <button 
                  onClick={() => setToggleState(!toggleState)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${toggleState ? 'bg-brand-primary' : 'bg-surface-tertiary'}`}
                >
                  <span className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${toggleState ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Checkbox */}
              <div 
                className="flex items-center gap-3 p-3 bg-surface-primary rounded-lg border border-surface-tertiary cursor-pointer"
                onClick={() => setCheckboxState(!checkboxState)}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checkboxState ? 'bg-brand-primary border-brand-primary' : 'border-content-tertiary bg-transparent'}`}>
                  {checkboxState && <Check size={14} className="text-brand-dark" />}
                </div>
                <div className="select-none">
                  <div className="font-medium">Terms of Service</div>
                  <div className="text-xs text-content-tertiary">I agree to the terms</div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 7. Calendar */}
        <section className="space-y-6">
          <SectionHeader title="07. Calendar" description="Date picker component" />
          
          <div className="max-w-sm mx-auto md:mx-0 p-4 bg-surface-secondary rounded-2xl border border-surface-tertiary shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-content-primary flex items-center gap-2">
                <CalendarIcon size={18} className="text-brand-primary" />
                October 2025
              </h4>
              <div className="flex gap-1">
                <IconButton variant="ghost" icon={<ChevronRight size={18} className="rotate-180" />} />
                <IconButton variant="ghost" icon={<ChevronRight size={18} />} />
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                <span key={d} className="text-xs font-bold text-content-tertiary py-1">{d}</span>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Empty days */}
              {[...Array(2)].map((_, i) => <div key={`empty-${i}`} className="p-2" />)}
              
              {/* Days */}
              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const isSelected = day === 24;
                const isToday = day === 20;
                
                return (
                  <button 
                    key={day}
                    className={`
                      p-2 rounded-lg text-sm font-medium transition-colors
                      ${isSelected ? 'bg-brand-primary text-brand-dark font-bold shadow-soft' : ''}
                      ${isToday && !isSelected ? 'border border-brand-primary text-brand-primary' : ''}
                      ${!isSelected && !isToday ? 'text-content-secondary hover:bg-surface-tertiary' : ''}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

/* --- Helper Components --- */

const SectionHeader = ({ title, description }: { title: string, description: string }) => (
  <div className="border-l-4 border-brand-primary pl-4">
    <h2 className="text-2xl font-bold text-content-primary">{title}</h2>
    <p className="text-content-secondary">{description}</p>
  </div>
);

const ColorCard = ({ name, hex, bg, text = "text-content-primary" }: { name: string, hex: string, bg: string, text?: string }) => (
  <div className={`${bg} ${text} p-4 rounded-lg shadow-soft flex flex-col justify-between h-24 border border-black/5`}>
    <span className="font-bold text-sm">{name}</span>
    <span className="font-mono text-xs opacity-80 uppercase">{hex}</span>
  </div>
);

const TypeSpecimen = ({ size, label, weight, sizeLabel }: any) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-surface-tertiary pb-4 last:border-0 last:pb-0">
    <div className={`${size} ${weight} text-content-primary mb-2 md:mb-0`}>
      The quick brown fox
    </div>
    <div className="text-xs font-mono text-content-tertiary flex gap-4">
      <span>{label}</span>
      <span>{sizeLabel}</span>
      <span className="opacity-50">{weight}</span>
    </div>
  </div>
);

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({ children, variant = "primary", disabled = false, icon, onClick }) => {
  const baseStyles = "px-5 py-2.5 rounded-lg font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center gap-2";
  
  const variants = {
    primary: "bg-brand-primary text-brand-dark hover:brightness-110 shadow-soft",
    secondary: "bg-surface-tertiary text-content-primary hover:bg-surface-tertiary/80 border border-surface-tertiary",
    ghost: "bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-tertiary",
  };

  return (
    <button disabled={disabled} onClick={onClick} className={`${baseStyles} ${variants[variant]}`}>
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

const IconButton = ({ icon, variant = "primary" }: { icon: React.ReactNode, variant?: "primary" | "secondary" | "ghost" }) => {
  const baseStyles = "p-2.5 rounded-lg transition-all active:scale-[0.95] flex items-center justify-center";
  const variants = {
    primary: "bg-brand-primary text-brand-dark hover:brightness-110 shadow-soft",
    secondary: "bg-surface-tertiary text-content-primary hover:bg-surface-tertiary/80 border border-surface-tertiary",
    ghost: "bg-transparent text-content-secondary hover:text-content-primary hover:bg-surface-tertiary",
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant]}`}>
      {icon}
    </button>
  );
};

const Badge = ({ label, variant = "neutral" }: { label: string, variant?: "success" | "warning" | "error" | "info" | "neutral" }) => {
  const variants = {
    success: "bg-success/20 text-success border-success/30",
    warning: "bg-warning/20 text-warning border-warning/30",
    error: "bg-error/20 text-error border-error/30",
    info: "bg-info/20 text-info border-info/30",
    neutral: "bg-surface-tertiary text-content-secondary border-surface-tertiary",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${variants[variant]}`}>
      {label}
    </span>
  );
};

const Avatar = ({ size = "md", src, fallback, status, className = "" }: any) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
  };

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizes[size]} rounded-full bg-surface-tertiary flex items-center justify-center overflow-hidden border border-surface-tertiary`}>
        {src ? (
          <img src={src} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="font-bold text-content-secondary">{fallback}</span>
        )}
      </div>
      {status && (
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface-secondary ${
          status === 'online' ? 'bg-success' : 'bg-content-tertiary'
        }`} />
      )}
    </div>
  );
};

const ProgressBar = ({ value, variant = "primary" }: { value: number, variant?: "primary" | "success" }) => {
  const colors = {
    primary: "bg-brand-primary",
    success: "bg-success",
  };

  return (
    <div className="w-full h-2 bg-surface-tertiary rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all duration-500 ${colors[variant]}`} 
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default DesignSystemShowcase;
