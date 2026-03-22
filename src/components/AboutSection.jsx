import React from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { 
  Target, 
  Globe, 
  ShieldCheck, 
  Mail, 
  MessageCircle,
  TrendingUp,
  Info,
  Heart,
  CheckCircle2
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { cn } from '../cn';

export const AboutSection = ({ lang, isDark }) => {
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
      console.log('[CLIENT] Sending message via EmailJS:', formData);
      
      // Direct values as requested (Replace these with your actual EmailJS credentials)
      const serviceId = 'service_id'; // Replace with your Service ID
      const templateId = 'template_id'; // Replace with your Template ID
      const publicKey = 'public_key'; // Replace with your Public Key

      const templateParams = {
        name: formData.name,
        email: formData.email,
        message: formData.message
      };

      console.log('[CLIENT] Template Parameters being sent:', templateParams);

      const result = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      console.log('[CLIENT] EmailJS Result:', result.text);
      
      if (result.text === 'OK') {
        setSendSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSendSuccess(false), 5000);
      } else {
        throw new Error('Failed to send message via EmailJS');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError(`Error: ${err.message}. Please ensure your EmailJS Service ID, Template ID, and Public Key are correctly placed in the code.`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={cn("text-4xl font-black", isDark ? "text-white" : "text-slate-900")}>{t.about}</h1>
          <p className={isDark ? "text-slate-400" : "text-slate-500"}>Empowering your investment journey with data-driven insights.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={cn(
            "glass p-8 md:p-12 rounded-[3rem] border max-w-4xl mx-auto text-left space-y-6 mt-12",
            isDark ? "border-white/10" : "border-slate-200 bg-white/50"
          )}
        >
            <p className={cn("text-lg md:text-xl leading-relaxed", isDark ? "text-slate-300" : "text-slate-600")}>
              Welcome to our IPO Allotment Probability website — a simple platform created to help investors understand their approximate chances of getting IPO shares.
            </p>
            <p className={cn("text-lg md:text-xl leading-relaxed", isDark ? "text-slate-300" : "text-slate-600")}>
              We use publicly available subscription data to calculate and display estimated allotment probabilities in an easy and understandable format. Our goal is to make IPO data more transparent, engaging, and a little more fun for retail investors.
            </p>
            <p className={cn("text-lg md:text-xl leading-relaxed", isDark ? "text-slate-300" : "text-slate-600")}>
              Please note that the results shown here are only estimates. The actual IPO allotment process is conducted by official registrars using randomized methods, so final outcomes may vary.
            </p>
            <p className={cn("text-lg md:text-xl leading-relaxed", isDark ? "text-slate-300" : "text-slate-600")}>
              This website is built purely for informational and educational purposes and does not provide financial or investment advice.
            </p>
            <p className="text-lg md:text-xl text-emerald-500 font-bold">
              Thank you for visiting and exploring IPO probabilities with us!
            </p>
          </motion.div>
        </section>

      {/* Values Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { 
            title: 'Transparency', 
            desc: 'We believe in making complex financial data accessible to everyone.', 
            icon: Target, 
            color: 'bg-emerald-500/20 text-emerald-500' 
          },
          { 
            title: 'Community', 
            desc: 'Building a supportive network for Nepali retail investors.', 
            icon: Heart, 
            color: 'bg-pink-500/20 text-pink-500' 
          },
          { 
            title: 'Accuracy', 
            desc: 'Using statistical models to provide the most realistic estimates.', 
            icon: ShieldCheck, 
            color: 'bg-gold-500/20 text-gold-500' 
          },
        ].map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -10 }}
            className={cn(
              "glass p-8 rounded-[2.5rem] border space-y-6",
              isDark ? "border-white/10" : "border-slate-200 bg-white/50"
            )}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color}`}>
              <item.icon className="w-7 h-7" />
            </div>
            <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>{item.title}</h3>
            <p className={cn("leading-relaxed", isDark ? "text-slate-400" : "text-slate-500")}>{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Contact Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h2 className={cn("text-4xl font-black", isDark ? "text-white" : "text-slate-900")}>{t.contactUs}</h2>
          <p className={cn("text-lg leading-relaxed", isDark ? "text-slate-400" : "text-slate-600")}>
            Have questions or suggestions? We'd love to hear from you. Our team is dedicated to improving your investment journey.
          </p>
          <div className="space-y-6">
            <div className={cn(
              "flex items-center gap-6 p-6 glass rounded-2xl border",
              isDark ? "border-white/10" : "border-slate-200 bg-white/50"
            )}>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Mail className="text-emerald-500 w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Email Support</p>
                <p className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>earnrealcashnepal@gmail.com</p>
              </div>
            </div>
            <div className={cn(
              "flex items-center gap-6 p-6 glass rounded-2xl border",
              isDark ? "border-white/10" : "border-slate-200 bg-white/50"
            )}>
              <div className="w-12 h-12 bg-[#25D366]/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="text-[#25D366] w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Direct Support</p>
                <a 
                  href="https://wa.me/917080460057" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform mt-2"
                >
                  <MessageCircle className="w-5 h-5" /> Message Us
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <form 
          onSubmit={handleSendMessage}
          className={cn(
            "glass p-10 rounded-[3rem] border space-y-6",
            isDark ? "border-white/10" : "border-slate-200 bg-white/50"
          )}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={cn(
                  "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                  isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                )} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={cn(
                  "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                  isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
                )} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
            <textarea 
              rows={4} 
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className={cn(
                "w-full border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
                isDark ? "bg-navy-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              )} 
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
            <p className="text-emerald-500 text-sm text-center font-bold">We've received your message and will get back to you soon!</p>
          )}
        </form>
      </section>
    </div>
  );
};
