import React from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { 
  Mail, 
  MessageCircle, 
  CheckCircle2,
  MapPin,
  Phone
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { cn } from '../cn';

export const ContactPage = ({ lang, isDark }) => {
  const t = TRANSLATIONS[lang];
  const [formData, setFormData] = React.useState({ name: '', email: '', message: '' });
  const [isSending, setIsSending] = React.useState(false);
  const [sendSuccess, setSendSuccess] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setError(null);
    
    try {
      // Replace these with your actual EmailJS credentials
      const serviceId = 'service_id'; 
      const templateId = 'template_id'; 
      const publicKey = 'public_key'; 

      const templateParams = {
        name: formData.name,
        email: formData.email,
        message: formData.message
      };

      const result = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );
      
      if (result.text === 'OK') {
        setSendSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSendSuccess(false), 5000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      setError(`Error: ${err.message}. Please try again later.`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 space-y-16">
      <div className="text-center space-y-4">
        <h1 className={cn("text-4xl md:text-5xl font-black", isDark ? "text-white" : "text-slate-900")}>Contact Us</h1>
        <p className={cn("text-lg max-w-2xl mx-auto", isDark ? "text-slate-400" : "text-slate-500")}>
          Have questions about IPO allotments or our predictor tool? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className={cn(
            "p-8 rounded-[2.5rem] border space-y-8",
            isDark ? "glass border-white/10" : "bg-white border-slate-200 shadow-sm"
          )}>
            <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Mail className="text-emerald-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Email Us</p>
                  <p className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>earnrealcashnepal@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-[#25D366]/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="text-[#25D366] w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">WhatsApp Support</p>
                  <a 
                    href="https://wa.me/917080460057" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg font-bold text-emerald-500 hover:underline"
                  >
                    +91 7080460057
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <MapPin className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Location</p>
                  <p className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>Kathmandu, Nepal</p>
                </div>
              </div>
            </div>
          </div>

          <div className={cn(
            "p-8 rounded-[2.5rem] border bg-emerald-600/5 border-emerald-500/20",
            isDark ? "" : "bg-emerald-50"
          )}>
            <h3 className={cn("text-xl font-bold mb-4", isDark ? "text-white" : "text-slate-900")}>Business Hours</h3>
            <p className={isDark ? "text-slate-400" : "text-slate-600"}>
              Monday - Friday: 10:00 AM - 6:00 PM (NPT)<br />
              Saturday: 11:00 AM - 4:00 PM (NPT)<br />
              Sunday: Closed
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <form 
          onSubmit={handleSendMessage}
          className={cn(
            "glass p-10 rounded-[3rem] border space-y-6",
            isDark ? "border-white/10" : "border-slate-200 bg-white/50"
          )}
        >
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn(
                "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              )} 
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={cn(
                "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              )} 
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
            <textarea 
              rows={5} 
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={cn(
                "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              )} 
              placeholder="How can we help you?"
            />
          </div>

          <button 
            type="submit" 
            disabled={isSending}
            className={cn(
              "btn-gold w-full py-4 text-lg flex items-center justify-center gap-2",
              isSending && "opacity-70 cursor-not-allowed"
            )}
          >
            {isSending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : sendSuccess ? (
              <>
                <CheckCircle2 className="w-6 h-6" /> Message Sent!
              </>
            ) : (
              'Send Message'
            )}
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center font-bold">{error}</p>
          )}
          {sendSuccess && (
            <p className="text-emerald-500 text-sm text-center font-bold">Thank you! We'll get back to you as soon as possible.</p>
          )}
        </form>
      </div>
    </div>
  );
};
